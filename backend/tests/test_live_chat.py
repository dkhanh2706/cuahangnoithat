"""HTTP tests for live support using an isolated catalog and a controllable clock."""
import unittest
from unittest.mock import patch
from uuid import uuid4

from fastapi import FastAPI

import test_furniture_advisor as catalog_tests
from test_store_reviews import ASGIClient
from database.database import get_db
from models.product import Product
from models.user import User
from routers.live_chat import router
from services.live_chat import LiveChat
from utils.security import create_access_token


class LiveChatTests(unittest.TestCase):
    def setUp(self):
        self.fixture = catalog_tests.FurnitureAdvisorTests()
        self.fixture.setUp()
        self.db = self.fixture.db
        self.admin = User(full_name="Admin thử", email="adminhdk@gmail.com", role="ADMIN", status=True, password_hash="unused")
        self.customer = User(full_name="Khách thử", email="live@example.com", role="CUSTOMER", status=True, password_hash="unused")
        self.db.add_all([self.admin, self.customer]); self.db.commit()
        self.now = 1000.0
        self.state = LiveChat(clock=lambda: self.now)
        self.patched = patch("routers.live_chat.live_chat", self.state)
        self.patched.start()
        app = FastAPI(); app.include_router(router)
        app.dependency_overrides[get_db] = lambda: self.db
        self.client = ASGIClient(app)
        self.admin_token = create_access_token({"sub": str(self.admin.id)})
        self.customer_token = create_access_token({"sub": str(self.customer.id)})

    def tearDown(self):
        self.patched.stop()
        self.fixture.tearDown()

    def request(self, method, path, payload=None, token=None, session=None):
        headers = [(b"content-type", b"application/json")]
        if token: headers.append((b"authorization", f"Bearer {token}".encode()))
        if session: headers.append((b"x-chat-token", session["token"].encode()))
        return self.client.request(method, "/api/live-chat" + path, payload, headers=headers)

    def session(self, token=None):
        response = self.request("POST", "/sessions", token=token)
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()

    def heartbeat(self, tab=None):
        response = self.request("POST", "/admin/presence", {"tab_id": tab or str(uuid4())}, token=self.admin_token)
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def send(self, session, text="Tư vấn phòng ngủ", client_id=None):
        response = self.request("POST", f'/sessions/{session["id"]}/messages', {"message": text, "client_id": client_id or str(uuid4())}, session=session)
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def snapshot(self, session):
        response = self.request("GET", f'/sessions/{session["id"]}', session=session)
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def reply(self, session, lease, reply_to, **extra):
        return self.request("POST", f'/admin/sessions/{session["id"]}/messages', {
            "client_id": str(uuid4()), "tab_id": lease["tab_id"], "lease_token": lease["token"],
            "reply_to": reply_to, "text": "Chào bạn, tôi đang hỗ trợ trực tiếp.", **extra,
        }, token=self.admin_token)

    def test_guest_offline_bot_and_signed_customer_name(self):
        session = self.session()
        result = self.send(session)
        self.assertEqual([message["role"] for message in result["messages"]], ["user", "bot"])
        self.assertTrue(result["messages"][1]["offers"])
        self.assertFalse(result["admin_online"])
        self.assertEqual(result["pending_count"], 0)
        signed = self.session(self.customer_token)
        self.assertEqual(self.snapshot(signed)["customer_name"], "Khách thử")

    def test_online_routes_only_to_admin_and_admin_replies(self):
        lease = self.heartbeat(); session = self.session()
        result = self.send(session)
        self.assertEqual(len(result["messages"]), 1)
        self.assertEqual(result["pending_count"], 1)
        result = self.reply(session, lease, result["messages"][0]["id"])
        self.assertEqual(result.status_code, 200, result.text)
        self.assertEqual([message["role"] for message in self.snapshot(session)["messages"]], ["user", "admin"])
        self.assertEqual(self.snapshot(session)["pending_count"], 0)

    def test_exact_30_second_boundary_and_unanswered_fallback(self):
        self.heartbeat(); session = self.session(); self.send(session)
        self.now += 29.999
        self.assertTrue(self.snapshot(session)["admin_online"])
        self.assertEqual(len(self.snapshot(session)["messages"]), 1)
        self.now += .001
        result = self.snapshot(session)
        self.assertFalse(result["admin_online"])
        self.assertEqual(result["messages"][-1]["role"], "bot")
        self.assertEqual(result["pending_count"], 0)
        self.assertEqual(len(self.snapshot(session)["messages"]), 2)

    def test_heartbeat_keeps_admin_online_and_expired_reconnect_answers_old_queue(self):
        lease = self.heartbeat(); session = self.session(); self.send(session)
        self.now += 20; lease = self.heartbeat(lease["tab_id"])
        self.now += 20
        self.assertTrue(self.snapshot(session)["admin_online"])
        self.assertEqual(len(self.snapshot(session)["messages"]), 1)
        self.now += 11
        self.heartbeat(lease["tab_id"])
        self.assertEqual(self.snapshot(session)["messages"][-1]["role"], "bot")

    def test_leave_immediately_falls_back_and_other_admin_tab_stays_online(self):
        first = self.heartbeat(); second = self.heartbeat(); session = self.session(); self.send(session)
        self.request("POST", "/admin/leave", {"tab_id": first["tab_id"], "token": first["token"]})
        self.assertTrue(self.snapshot(session)["admin_online"])
        self.assertEqual(len(self.snapshot(session)["messages"]), 1)
        self.request("POST", "/admin/leave", {"tab_id": second["tab_id"], "token": second["token"]})
        self.assertEqual(self.snapshot(session)["messages"][-1]["role"], "bot")

    def test_stale_admin_reply_after_bot_is_rejected(self):
        lease = self.heartbeat(); session = self.session(); pending = self.send(session)["messages"][0]["id"]
        self.now += 30; self.snapshot(session)
        lease = self.heartbeat(lease["tab_id"])
        response = self.reply(session, lease, pending)
        self.assertEqual(response.status_code, 409)
        self.assertEqual([message["role"] for message in self.snapshot(session)["messages"]], ["user", "bot"])

    def test_retries_do_not_duplicate_customer_or_admin_messages(self):
        lease = self.heartbeat(); session = self.session(); key = str(uuid4())
        first = self.send(session, client_id=key)
        second = self.send(session, client_id=key)
        self.assertEqual(first["messages"], second["messages"])
        key = str(uuid4())
        response = self.reply(session, lease, first["messages"][0]["id"], client_id=key)
        self.assertEqual(response.status_code, 200)
        response = self.reply(session, lease, first["messages"][0]["id"], client_id=key)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(self.snapshot(session)["messages"]), 2)

    def test_admin_reply_can_cover_several_waiting_messages(self):
        lease = self.heartbeat(); session = self.session()
        self.send(session); result = self.send(session, "Ngân sách 30 triệu")
        response = self.reply(session, lease, result["messages"][-1]["id"])
        self.assertEqual(response.status_code, 200)
        self.request("POST", "/admin/leave", {"tab_id": lease["tab_id"], "token": lease["token"]})
        self.assertEqual(len(self.snapshot(session)["messages"]), 3)

    def test_admin_real_product_bundle_and_single_offers(self):
        lease = self.heartbeat(); session = self.session(); result = self.send(session)
        response = self.reply(session, lease, result["messages"][0]["id"], product_ids=[104, 113])
        self.assertEqual(response.status_code, 200, response.text)
        message = response.json()["messages"][-1]
        self.assertEqual(message["offers"][0]["kind"], "bundle")
        self.assertIn("Có hoặc Không", message["text"])
        self.assertEqual(message["offers"][0]["total_price"], sum(float(self.db.get(Product, key).price) for key in [104, 113]))
        response = self.reply(session, lease, None, product_ids=[104, 113], as_bundle=False)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["messages"][-1]["offers"]), 2)
        self.db.get(Product, 104).stock_quantity = 0; self.db.commit()
        self.assertEqual(self.reply(session, lease, None, product_ids=[104]).status_code, 409)

    def test_customer_session_is_private_and_close_erases_admin_copy(self):
        session = self.session(); self.send(session)
        other = self.session()
        response = self.request("GET", f'/sessions/{session["id"]}', session=other)
        self.assertEqual(response.status_code, 404)
        self.request("POST", f'/sessions/{session["id"]}/close', {"token": other["token"]})
        self.assertTrue(self.snapshot(session)["messages"])
        rows = self.request("GET", "/admin/sessions", token=self.admin_token).json()
        self.assertEqual(len(rows["sessions"]), 1)
        self.assertNotIn("token", rows["sessions"][0])
        self.request("POST", f'/sessions/{session["id"]}/close', {"token": session["token"]})
        self.assertEqual(self.request("GET", f'/sessions/{session["id"]}', session=session).status_code, 404)
        self.assertEqual(self.request("GET", "/admin/sessions", token=self.admin_token).json()["sessions"], [])

    def test_abandoned_sessions_expire_and_new_process_has_no_transcript(self):
        session = self.session(); self.send(session)
        self.now += 89; self.state.prune(); self.assertIn(session["id"], self.state.sessions)
        self.now += 1; self.state.prune(); self.assertNotIn(session["id"], self.state.sessions)
        self.assertEqual(LiveChat().sessions, {})

    def test_authentication_and_live_lease_required(self):
        self.assertIn(self.request("GET", "/admin/sessions").status_code, [401, 403])
        self.assertEqual(self.request("GET", "/admin/sessions", token=self.customer_token).status_code, 403)
        self.assertEqual(self.request("POST", "/admin/presence", {"tab_id": str(uuid4())}, token=self.customer_token).status_code, 403)
        lease = self.heartbeat(); session = self.session(); result = self.send(session)
        self.request("POST", "/admin/leave", {"tab_id": lease["tab_id"], "token": "x" * 43})
        self.assertTrue(self.state.online())
        lease["token"] = "x" * 43
        self.assertEqual(self.reply(session, lease, result["messages"][0]["id"]).status_code, 409)

    def test_no_database_writes_for_chat(self):
        before = [(p.id, p.price, p.stock_quantity, p.updated_at) for p in self.db.query(Product).all()]
        users = [(u.id, u.updated_at) for u in self.db.query(User).all()]
        lease = self.heartbeat(); session = self.session(); result = self.send(session)
        self.reply(session, lease, result["messages"][0]["id"], product_ids=[104])
        self.request("POST", f'/sessions/{session["id"]}/close', {"token": session["token"]})
        self.assertEqual(before, [(p.id, p.price, p.stock_quantity, p.updated_at) for p in self.db.query(Product).all()])
        self.assertEqual(users, [(u.id, u.updated_at) for u in self.db.query(User).all()])


if __name__ == "__main__":
    unittest.main()
