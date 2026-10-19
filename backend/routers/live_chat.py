import asyncio
from contextlib import suppress
from uuid import UUID

from fastapi import APIRouter, Depends, Header, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from schemas.live_chat import CustomerMessage, SessionClose, PresenceHeartbeat, PresenceLeave, AdminMessage
from services.live_chat import live_chat
from utils.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/live-chat", tags=["Live support"])
optional_auth = HTTPBearer(auto_error=False)
cleanup_task = None


@router.on_event("startup")
async def start_cleanup():
    global cleanup_task
    async def sweep():
        while True:
            await asyncio.sleep(5)
            live_chat.prune()
    cleanup_task = asyncio.create_task(sweep())


@router.on_event("shutdown")
async def stop_cleanup():
    if cleanup_task:
        cleanup_task.cancel()
        with suppress(asyncio.CancelledError):
            await cleanup_task


@router.get("/status")
def status():
    with live_chat.lock:
        live_chat.prune()
        return {"admin_online": live_chat.online(), "timeout_seconds": 30}


@router.post("/sessions", status_code=201)
def create_session(response: Response, credentials: HTTPAuthorizationCredentials | None = Depends(optional_auth), db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    user = get_current_user(credentials, db) if credentials else None
    return live_chat.create(user.full_name if user else None)


@router.get("/sessions/{session_id}")
def customer_session(session_id: UUID, response: Response, x_chat_token: str = Header(min_length=32, max_length=128), db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    return live_chat.customer_snapshot(session_id, x_chat_token, db)


@router.post("/sessions/{session_id}/messages")
def customer_message(session_id: UUID, data: CustomerMessage, response: Response, x_chat_token: str = Header(min_length=32, max_length=128), db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    return live_chat.customer_message(session_id, x_chat_token, data, db)


@router.post("/sessions/{session_id}/close", status_code=204)
def close_session(session_id: UUID, data: SessionClose):
    # Capability in body allows sendBeacon on pagehide without a persisted token.
    live_chat.close(session_id, data.token)


@router.post("/admin/presence")
def heartbeat(data: PresenceHeartbeat, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    live_chat.resolve_pending(db)
    return live_chat.heartbeat(data.tab_id, admin.id)


@router.post("/admin/leave", status_code=204)
def leave(data: PresenceLeave, db: Session = Depends(get_db)):
    if live_chat.leave(data.tab_id, data.token):
        live_chat.resolve_pending(db)


@router.get("/admin/sessions")
def admin_sessions(response: Response, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    return live_chat.admin_sessions(db)


@router.get("/admin/sessions/{session_id}")
def admin_session(session_id: UUID, response: Response, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    return live_chat.admin_snapshot(session_id, db)


@router.post("/admin/sessions/{session_id}/messages")
def admin_message(session_id: UUID, data: AdminMessage, response: Response, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    return live_chat.admin_message(session_id, data, admin, db)
