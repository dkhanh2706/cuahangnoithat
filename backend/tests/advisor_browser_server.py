"""Local browser-test server. Seeded SQLite only; never imports main/startup.

From the repository root, after building frontend:
  .venv/Scripts/python.exe -B -m uvicorn advisor_browser_server:app --app-dir backend/tests --port 8000
Stop any other service on that port first. Then run the frontend browser script.
"""
from pathlib import Path
from threading import Lock

from fastapi import Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.orm import Session

from test_furniture_advisor import FurnitureAdvisorTests
from models.product import Product
from models.user import User
from database.database import get_db
from routers.products import router as products_router
from routers.product_images import router as images_router
from routers.categories import router as categories_router
from routers.store_reviews import router as reviews_router
from routers.live_chat import router as live_chat_router
from routers.users import router as users_router
from services.live_chat import live_chat
from utils.security import create_access_token

fixture = FurnitureAdvisorTests()
fixture.setUp()
app = fixture.app
admin_user = User(full_name="Admin kiểm thử", email="adminhdk@gmail.com", password_hash="unused", role="ADMIN", status=True)
customer_user = User(full_name="Khách kiểm thử", email="browser-live@example.com", password_hash="unused", role="CUSTOMER", status=True)
fixture.db.add_all([admin_user, customer_user]); fixture.db.commit()
admin_credentials = {"access_token": create_access_token({"sub": str(admin_user.id)}), "user": {"id": admin_user.id, "full_name": admin_user.full_name, "email": admin_user.email, "role": admin_user.role}}
customer_credentials = {"access_token": create_access_token({"sub": str(customer_user.id)}), "user": {"id": customer_user.id, "full_name": customer_user.full_name, "email": customer_user.email, "role": customer_user.role}}
fixture.db.close()
db_lock = Lock()


def browser_db():
    # SQLite StaticPool has one connection. Serialize requests and use separate
    # ORM sessions, since browser product-image requests arrive concurrently.
    with db_lock:
        with Session(fixture.engine) as session:
            yield session


app.dependency_overrides[get_db] = browser_db
for router in (products_router, images_router, categories_router, reviews_router, live_chat_router, users_router):
    app.include_router(router)


@app.get("/__test/credentials/{role}")
def credentials(role: str):
    return admin_credentials if role == "admin" else customer_credentials


@app.post("/__test/expire-presence")
def expire_presence():
    with live_chat.lock:
        for lease in live_chat.presence.values():
            lease["last_seen"] -= 31
    return {"ok": True}


class ProductChange(BaseModel):
    product_id: int
    price: int | None = None
    stock_quantity: int | None = None


@app.post("/__test/product")
def change_fixture(data: ProductChange, db: Session = Depends(get_db)):
    product = db.get(Product, data.product_id)
    if data.price is not None:
        product.price = data.price
    if data.stock_quantity is not None:
        product.stock_quantity = data.stock_quantity
    db.commit()
    return {"ok": True}


dist = Path(__file__).resolve().parents[2] / "frontend/dist"
app.mount("/assets", StaticFiles(directory=dist / "assets"), name="assets")


@app.get("/{path:path}")
def frontend(path: str):
    if path.startswith("api/"):
        raise HTTPException(404)
    return FileResponse(dist / "index.html")
