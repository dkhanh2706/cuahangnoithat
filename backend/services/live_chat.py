"""Ephemeral live support. No ORM models, database writes or persisted transcripts."""
from copy import deepcopy
from datetime import datetime, timezone
from secrets import compare_digest, token_urlsafe
from threading import RLock
from time import monotonic
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy.orm import selectinload

from models.product import Product
from schemas.advisor import AdvisorRequest
from services.furniture_advisor import advise, make_offer

ONLINE_SECONDS = 30
CUSTOMER_TTL = 90
MAX_SESSIONS = 1000
MAX_MESSAGES = 500


class LiveChat:
    def __init__(self, clock=monotonic):
        self.clock = clock
        self.lock = RLock()
        self.sessions = {}
        self.presence = {}

    def prune(self):
        with self.lock:
            now = self.clock()
            for key in [key for key, value in self.sessions.items() if now - value["last_seen"] >= CUSTOMER_TTL]:
                del self.sessions[key]
            for key in [key for key, value in self.presence.items() if now - value["last_seen"] >= ONLINE_SECONDS]:
                del self.presence[key]

    def online(self):
        return any(self.clock() - lease["last_seen"] < ONLINE_SECONDS for lease in self.presence.values())

    def heartbeat(self, tab_id, admin_id):
        with self.lock:
            self.prune()
            key = str(tab_id)
            lease = self.presence.get(key)
            if not lease or lease["admin_id"] != admin_id:
                lease = {"admin_id": admin_id, "token": token_urlsafe(32)}
                self.presence[key] = lease
            lease["last_seen"] = self.clock()
            return {"tab_id": key, "token": lease["token"], "online": True, "timeout_seconds": ONLINE_SECONDS}

    def leave(self, tab_id, token):
        with self.lock:
            lease = self.presence.get(str(tab_id))
            if lease and compare_digest(lease["token"], token):
                del self.presence[str(tab_id)]
                return True
            return False

    def create(self, name=None):
        with self.lock:
            self.prune()
            if len(self.sessions) >= MAX_SESSIONS:
                raise HTTPException(429, "Hiện có nhiều phiên tư vấn. Bạn vui lòng thử lại sau.")
            key = str(uuid4())
            session = {"id": key, "token": token_urlsafe(32), "customer_name": name or f"Khách {key[:6].upper()}",
                       "last_seen": self.clock(), "messages": [], "updated_at": self._timestamp()}
            self.sessions[key] = session
            return {"id": key, "token": session["token"], "admin_online": self.online(), "expires_after_seconds": CUSTOMER_TTL}

    def _session(self, key, token=None, touch=False):
        self.prune()
        session = self.sessions.get(str(key))
        if not session or (token is not None and not compare_digest(session["token"], token)):
            raise HTTPException(404, "Phiên chat đã kết thúc. Hãy bắt đầu cuộc trò chuyện mới.")
        if touch:
            session["last_seen"] = self.clock()
        return session

    def close(self, key, token):
        with self.lock:
            session = self.sessions.get(str(key))
            if session and compare_digest(session["token"], token):
                del self.sessions[str(key)]

    @staticmethod
    def _timestamp():
        return datetime.now(timezone.utc).isoformat()

    def _append(self, session, role, text, **extra):
        message = {"id": str(uuid4()), "role": role, "text": text, "offers": [], "suggestions": [],
                   "created_at": self._timestamp(), **extra}
        session["messages"].append(message)
        session["updated_at"] = message["created_at"]
        return message

    @staticmethod
    def catalog(db):
        return db.query(Product).options(selectinload(Product.images), selectinload(Product.category)).filter(Product.status.is_(True)).all()

    def _bot_reply(self, session, message, products):
        earlier = session["messages"][:session["messages"].index(message)]
        history = [item["text"] for item in earlier if item["role"] == "user"][-12:]
        result = advise(AdvisorRequest(message=message["text"], history=history,
                                      product_id=message.get("product_id"), suggested_ids=message.get("suggested_ids", [])), products)
        self._append(session, "bot", result["reply"], offers=result["offers"], suggestions=result["suggestions"], reply_to=message["id"])
        message["answered_by"] = "bot"

    def resolve_pending(self, db):
        with self.lock:
            self.prune()
            if self.online():
                return
            waiting = [(session, message) for session in self.sessions.values() for message in session["messages"]
                       if message["role"] == "user" and message.get("answered_by") is None]
            if not waiting:
                return
            products = self.catalog(db)
            for session, message in waiting:
                self._bot_reply(session, message, products)

    def _snapshot(self, session):
        # Never include customer capabilities or internal contextual fields in admin responses.
        messages = [{key: value for key, value in message.items() if key not in ("product_id", "suggested_ids")}
                    for message in session["messages"]]
        return deepcopy({"id": session["id"], "customer_name": session["customer_name"], "messages": messages,
                         "admin_online": self.online(), "pending_count": sum(message["role"] == "user" and message.get("answered_by") is None for message in messages),
                         "updated_at": session["updated_at"]})

    def customer_snapshot(self, key, token, db):
        with self.lock:
            session = self._session(key, token, touch=True)
            self.resolve_pending(db)
            return self._snapshot(session)

    def customer_message(self, key, token, data, db):
        with self.lock:
            session = self._session(key, token, touch=True)
            if any(message.get("client_id") == str(data.client_id) and message["role"] == "user" for message in session["messages"]):
                self.resolve_pending(db)
                return self._snapshot(session)
            if len(session["messages"]) >= MAX_MESSAGES:
                raise HTTPException(429, "Cuộc trò chuyện đã dài. Hãy dùng nút làm mới để bắt đầu lại.")
            # Load first when offline, so a catalog error does not strand an accepted message.
            products = None if self.online() else self.catalog(db)
            message = self._append(session, "user", data.message, client_id=str(data.client_id), answered_by=None,
                                   product_id=data.product_id, suggested_ids=data.suggested_ids)
            if products is not None:
                self._bot_reply(session, message, products)
            return self._snapshot(session)

    def admin_sessions(self, db):
        with self.lock:
            self.resolve_pending(db)
            rows = []
            for session in self.sessions.values():
                if not session["messages"]:
                    continue
                rows.append({"id": session["id"], "customer_name": session["customer_name"], "updated_at": session["updated_at"],
                             "preview": session["messages"][-1]["text"][:120],
                             "pending_count": sum(message["role"] == "user" and message.get("answered_by") is None for message in session["messages"])})
            return {"sessions": sorted(rows, key=lambda row: (row["pending_count"] > 0, row["updated_at"]), reverse=True), "admin_online": self.online()}

    def admin_snapshot(self, key, db):
        with self.lock:
            self.resolve_pending(db)
            return self._snapshot(self._session(key))

    def admin_message(self, key, data, admin, db):
        with self.lock:
            session = self._session(key)
            if any(message.get("client_id") == str(data.client_id) and message["role"] == "admin" for message in session["messages"]):
                return self._snapshot(session)
            self.resolve_pending(db)
            lease = self.presence.get(str(data.tab_id))
            if not lease or lease["admin_id"] != admin.id or not compare_digest(lease["token"], data.lease_token) or self.clock() - lease["last_seen"] >= ONLINE_SECONDS:
                raise HTTPException(409, "Bạn đang offline. Hãy bật Nhận tư vấn trước khi gửi.")
            waiting = [message for message in session["messages"] if message["role"] == "user" and message.get("answered_by") is None]
            target = next((message for message in waiting if message["id"] == str(data.reply_to)), None)
            if (data.reply_to and not target) or (waiting and not target):
                raise HTTPException(409, "Tin này đã được trả lời hoặc thay đổi. Hãy xem lại cuộc trò chuyện trước khi gửi.")
            if len(session["messages"]) >= MAX_MESSAGES:
                raise HTTPException(429, "Cuộc trò chuyện đã dài. Khách cần làm mới để tiếp tục.")
            products = {p.id: p for p in self.catalog(db)} if data.product_ids else {}
            selected = [products.get(product_id) for product_id in data.product_ids]
            if any(product is None or product.stock_quantity < 1 for product in selected):
                raise HTTPException(409, "Có sản phẩm đã hết hàng hoặc bị ẩn. Hãy chọn lại sản phẩm.")
            offers = ([make_offer(selected, "Bộ sản phẩm tư vấn viên gợi ý")] if data.as_bundle and len(selected) > 1
                      else [make_offer([product]) for product in selected])
            text = data.text or "Tôi gợi ý bạn các sản phẩm dưới đây."
            if offers:
                text += "\nBạn có muốn tôi thêm món lẻ hoặc cả bộ vào giỏ hàng luôn không? Bạn chọn Có hoặc Không bên dưới nhé."
            self._append(session, "admin", text, client_id=str(data.client_id), offers=offers,
                         sender_name=admin.full_name, reply_to=str(data.reply_to) if data.reply_to else None)
            if target:
                cutoff = session["messages"].index(target)
                for message in session["messages"][:cutoff + 1]:
                    if message["role"] == "user" and message.get("answered_by") is None:
                        message["answered_by"] = "admin"
            return self._snapshot(session)


live_chat = LiveChat()
