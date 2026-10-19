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
from database.database import get_db
from routers.products import router as products_router
from routers.product_images import router as images_router
from routers.categories import router as categories_router
from routers.store_reviews import router as reviews_router

fixture = FurnitureAdvisorTests()
fixture.setUp()
app = fixture.app
fixture.db.close()
db_lock = Lock()


def browser_db():
    # SQLite StaticPool has one connection. Serialize requests and use separate
    # ORM sessions, since browser product-image requests arrive concurrently.
    with db_lock:
        with Session(fixture.engine) as session:
            yield session


app.dependency_overrides[get_db] = browser_db
for router in (products_router, images_router, categories_router, reviews_router):
    app.include_router(router)


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
