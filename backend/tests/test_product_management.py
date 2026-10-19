"""Product management HTTP tests against an isolated in-memory database."""
import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ["DATABASE_URL"] = "sqlite://"

from fastapi import FastAPI
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database.database import Base, get_db
import models
from models.product import Product
from models.product_image import ProductImage
from models.user import User
from routers.products import router
from routers.store_reviews import router as orders_router
from utils.dependencies import require_admin, require_customer, get_current_user
from test_store_reviews import ASGIClient


class ProductManagementTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        @event.listens_for(self.engine, "connect")
        def foreign_keys(connection, _):
            connection.execute("PRAGMA foreign_keys=ON")
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        self.admin = User(full_name="Admin", email="adminhdk@gmail.com", password_hash="unused", role="ADMIN", status=True)
        self.customer = User(full_name="Khách", email="customer@example.com", password_hash="unused", role="CUSTOMER", status=True)
        self.db.add_all([self.admin, self.customer])
        self.db.commit()
        self.app = FastAPI()
        self.app.include_router(router)
        self.app.include_router(orders_router)
        self.app.dependency_overrides[get_db] = lambda: self.db
        self.app.dependency_overrides[get_current_user] = lambda: self.admin
        self.app.dependency_overrides[require_customer] = lambda: self.customer
        self.client = ASGIClient(self.app)

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def create_product(self):
        response = self.client.post("/api/products", json={"name": "  Bàn gỗ  ", "price": "1500000.50", "stock_quantity": 5, "material": "Gỗ sồi"})
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()

    def test_create_edit_lock_unlock_delete(self):
        product = self.create_product()
        path = f'/api/products/{product["id"]}'
        self.assertEqual(product["name"], "Bàn gỗ")
        self.assertEqual(self.client.request("PUT", path, {"name": "Ghế gỗ", "stock_quantity": 8}).status_code, 200)
        self.assertEqual(self.client.get(path).json()["name"], "Ghế gỗ")
        self.assertEqual(self.client.request("PUT", path, {"status": False}).status_code, 200)
        self.assertEqual(self.client.get("/api/products").json(), [])
        self.assertEqual(self.client.get(path).status_code, 404)
        admin_products = self.client.get("/api/products/admin/all").json()
        self.assertEqual(len(admin_products), 1)
        self.assertFalse(admin_products[0]["status"])
        self.assertEqual(self.client.request("PUT", path, {"status": True}).status_code, 200)
        self.assertEqual(len(self.client.get("/api/products").json()), 1)
        self.assertEqual(self.client.request("DELETE", path).status_code, 200)
        self.assertEqual(self.client.get("/api/products/admin/all").json(), [])

    def test_invalid_values_and_missing_category(self):
        product = self.create_product()
        path = f'/api/products/{product["id"]}'
        for payload in [{"name": "   "}, {"name": None}, {"price": None}, {"status": None}, {"stock_quantity": None}, {"stock_quantity": -1}, {"stock_quantity": 1.5}, {"price": -1}, {"name": "x" * 151}, {"price": "99999999999999"}, {"material": "x" * 101}]:
            with self.subTest(payload=payload):
                self.assertEqual(self.client.request("PUT", path, payload).status_code, 422)
        self.assertEqual(self.client.request("PUT", path, {"category_id": 999}).status_code, 400)
        self.assertEqual(self.client.post("/api/products", json={"name": "   ", "price": 1}).status_code, 422)
        self.assertEqual(self.client.request("DELETE", "/api/products/99999").status_code, 404)

    def test_customer_cannot_manage_products(self):
        product = self.create_product()
        self.app.dependency_overrides[get_current_user] = lambda: self.customer
        for method, path, payload in [("GET", "/api/products/admin/all", None), ("POST", "/api/products", {"name": "X", "price": 1}), ("PUT", f'/api/products/{product["id"]}', {"status": False}), ("DELETE", f'/api/products/{product["id"]}', None)]:
            with self.subTest(method=method):
                self.assertEqual(self.client.request(method, path, payload).status_code, 403)
        self.assertEqual(len(self.client.get("/api/products").json()), 1)

    def test_delete_cascades_images_and_preserves_order_history(self):
        product = self.create_product()
        product_id = product["id"]
        self.db.add(ProductImage(product_id=product_id, image_url="https://example.com/chair.jpg", is_primary=True))
        self.db.commit()
        self.assertEqual(len(self.client.get("/api/products/admin/all").json()[0]["images"]), 1)
        order = self.client.post("/api/orders", json={"items": [{"product_id": product_id, "quantity": 1}], "receiver_name": "Khách", "receiver_phone": "0901234567", "shipping_address": "Hà Nội"})
        self.assertEqual(order.status_code, 201, order.text)
        self.assertEqual(self.client.request("DELETE", f"/api/products/{product_id}").status_code, 200)
        self.assertEqual(self.db.query(ProductImage).count(), 0)
        from models.order_review import OrderItem
        item = self.db.query(OrderItem).one()
        self.assertIsNone(item.product_id)
        self.assertEqual(item.product_name, "Bàn gỗ")

    def test_locked_product_cannot_be_ordered(self):
        product = self.create_product()
        self.client.request("PUT", f'/api/products/{product["id"]}', {"status": False})
        response = self.client.post("/api/orders", json={"items": [{"product_id": product["id"], "quantity": 1}], "receiver_name": "Khách", "receiver_phone": "0901234567", "shipping_address": "Hà Nội"})
        self.assertEqual(response.status_code, 400, response.text)


if __name__ == "__main__":
    unittest.main()
