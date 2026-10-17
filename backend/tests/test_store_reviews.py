"""Isolated API tests: no connection to the configured application database."""
import os
import sys
import unittest
import asyncio
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ["DATABASE_URL"] = "sqlite://"

from fastapi import FastAPI
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.dialects.postgresql.psycopg import dialect as psycopg_dialect
from database.database import Base, get_db
import models
from models.order_review import Order, OrderItem, StoreReview, OrderItemReview
from models.product_image import ProductImage
from models.product import Product
from models.user import User
from routers.store_reviews import router
from utils.dependencies import require_customer


class ASGIClient:
    """Exercise real HTTP routing and validation using only the standard library."""
    def __init__(self, app):
        self.app = app

    def request(self, method, path, payload=None):
        async def run():
            messages = []
            async def receive():
                return {"type": "http.request", "body": json.dumps(payload).encode() if payload is not None else b"", "more_body": False}
            async def send(message):
                messages.append(message)
            await self.app({"type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1", "method": method,
                            "scheme": "http", "path": path, "raw_path": path.encode(), "query_string": b"",
                            "root_path": "", "headers": [(b"content-type", b"application/json")],
                            "client": ("test", 1), "server": ("test", 80)}, receive, send)
            status = next(message["status"] for message in messages if message["type"] == "http.response.start")
            body = b"".join(message.get("body", b"") for message in messages if message["type"] == "http.response.body")
            class Response:
                status_code = status
                text = body.decode()
                def json(self):
                    return json.loads(self.text)
            return Response()
        return asyncio.run(run())

    def get(self, path):
        return self.request("GET", path)

    def post(self, path, json):
        return self.request("POST", path, json)


class StoreReviewTests(unittest.TestCase):
    def test_order_status_bindings_use_existing_postgresql_enums(self):
        statement = Order.__table__.insert().values(payment_status="SUCCESS", status="PENDING")
        compiled = statement.compile(dialect=psycopg_dialect())
        sql = str(compiled)
        self.assertNotIn("%(payment_status)s::VARCHAR", sql)
        self.assertNotIn("%(status)s::VARCHAR", sql)
        self.assertEqual(compiled.binds["payment_status"].type.name, "payment_status")
        self.assertEqual(compiled.binds["status"].type.name, "order_status")
        self.assertFalse(Order.__table__.c.payment_status.type.create_type)
        self.assertFalse(Order.__table__.c.status.type.create_type)

    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        @event.listens_for(self.engine, "connect")
        def foreign_keys(connection, _):
            connection.execute("PRAGMA foreign_keys=ON")
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        self.user = User(full_name="Khách thử", email="test@example.com", password_hash="unused", role="CUSTOMER")
        self.other = User(full_name="Khách khác", email="other@example.com", password_hash="unused", role="CUSTOMER")
        self.product = Product(name="Bàn", price=1000000, stock_quantity=5, status=True)
        self.db.add_all([self.user, self.other, self.product])
        self.db.commit()
        app = FastAPI()
        app.include_router(router)
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_customer] = lambda: self.user
        self.app = app
        self.client = ASGIClient(app)

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def checkout(self, quantity=1):
        return self.client.post("/api/orders", json={
            "items": [{"product_id": self.product.id, "quantity": quantity}],
            "promo_code": "FURNI10", "receiver_name": "Khách thử",
            "receiver_phone": "0901234567", "shipping_address": "Hà Nội",
        })

    def test_checkout_review_and_public_visibility(self):
        self.assertEqual(self.client.get("/api/reviews/eligible-orders").json(), [])
        response = self.checkout()
        self.assertEqual(response.status_code, 201, response.text)
        order = response.json()
        self.assertEqual(float(order["total"]), 1050000)
        self.assertEqual(self.db.get(Product, self.product.id).stock_quantity, 4)
        self.assertEqual(self.db.query(OrderItem).one().product_name, "Bàn")
        self.assertEqual(len(self.client.get("/api/reviews/eligible-orders").json()), 1)
        payload = {"order_id": order["id"], "rating": 4, "content": "  Rất hài lòng  "}
        response = self.client.post("/api/reviews", json=payload)
        self.assertEqual(response.status_code, 201, response.text)
        self.assertEqual(response.json()["content"], "Rất hài lòng")
        self.assertEqual(self.client.get("/api/reviews").json()[0]["full_name"], "Khách thử")
        self.assertEqual(self.client.post("/api/reviews", json=payload).status_code, 409)
        self.assertEqual(self.client.get("/api/reviews/eligible-orders").json(), [])

    def test_cannot_review_other_users_order_or_cancelled_order(self):
        order_id = self.checkout().json()["id"]
        self.app.dependency_overrides[require_customer] = lambda: self.other
        payload = {"order_id": order_id, "rating": 5, "content": "Tốt"}
        self.assertEqual(self.client.post("/api/reviews", json=payload).status_code, 403)
        self.app.dependency_overrides[require_customer] = lambda: self.user
        self.db.get(Order, order_id).status = "CANCELLED"
        self.db.commit()
        self.assertEqual(self.client.post("/api/reviews", json=payload).status_code, 403)
        self.assertEqual(self.client.get("/api/reviews/eligible-orders").json(), [])

    def test_invalid_checkout_does_not_create_order(self):
        self.assertEqual(self.checkout(quantity=6).status_code, 400)
        self.assertEqual(self.checkout(quantity=0).status_code, 422)
        self.assertEqual(self.db.query(Order).count(), 0)
        self.assertEqual(self.db.get(Product, self.product.id).stock_quantity, 5)

    def test_invalid_reviews_and_authentication(self):
        order_id = self.checkout().json()["id"]
        for rating, content in [(0, "Tốt"), (6, "Tốt"), (5, "   "), (5, "x" * 2001)]:
            self.assertEqual(self.client.post("/api/reviews", json={"order_id": order_id, "rating": rating, "content": content}).status_code, 422)
        self.assertEqual(self.db.query(StoreReview).count(), 0)
        del self.app.dependency_overrides[require_customer]
        self.assertIn(self.client.get("/api/reviews/eligible-orders").status_code, [401, 403])
        self.assertIn(self.checkout().status_code, [401, 403])
        self.assertEqual(self.client.get("/api/reviews").status_code, 200)

    def test_demo_checkout_history_product_review_and_image_snapshot(self):
        self.db.add(ProductImage(product_id=self.product.id, image_url="https://example.com/table.jpg", is_primary=True))
        self.db.commit()
        payload = {"items": [{"product_id": self.product.id, "quantity": 2}],
                   "receiver_name": "Khách thử", "receiver_phone": "0901234567", "shipping_address": "Hà Nội"}
        response = self.client.post("/api/orders/demo", json=payload)
        self.assertEqual(response.status_code, 201, response.text)
        self.assertTrue(response.json()["code"].startswith("DEMO-"))
        self.assertEqual(response.json()["payment_status"], "SUCCESS")
        self.assertEqual(self.db.get(Product, self.product.id).stock_quantity, 5)
        history = self.client.get("/api/orders").json()
        self.assertEqual(len(history), 1)
        item = history[0]["items"][0]
        self.assertEqual(item["quantity"], 2)
        self.assertEqual(item["image_url"], "https://example.com/table.jpg")
        self.assertIsNone(item["review"])
        review = {"order_item_id": item["id"], "rating": 4, "content": "  Đẹp và chắc chắn  "}
        response = self.client.post("/api/product-reviews", json=review)
        self.assertEqual(response.status_code, 201, response.text)
        self.assertEqual(response.json()["content"], "Đẹp và chắc chắn")
        self.assertEqual(response.json()["image_url"], item["image_url"])
        self.assertEqual(self.client.post("/api/product-reviews", json=review).status_code, 409)
        self.assertEqual(self.client.get("/api/orders").json()[0]["items"][0]["review"]["rating"], 4)
        self.db.query(ProductImage).one().image_url = "https://example.com/new.jpg"
        self.db.commit()
        public = self.client.get("/api/product-reviews").json()[0]
        self.assertEqual(public["full_name"], self.user.full_name)
        self.assertEqual(public["product_name"], "Bàn")
        self.assertEqual(public["image_url"], "https://example.com/table.jpg")
        self.assertNotIn("shipping_address", public)
        self.assertNotIn("receiver_phone", public)

    def test_history_is_private_and_unpaid_cancelled_reviews_are_blocked(self):
        order_id = self.checkout().json()["id"]
        item = self.db.query(OrderItem).one()
        payload = {"order_item_id": item.id, "rating": 5, "content": "Tốt"}
        self.assertEqual(self.client.post("/api/product-reviews", json=payload).status_code, 403)
        order = self.db.get(Order, order_id)
        order.payment_status = "SUCCESS"
        self.db.commit()
        self.app.dependency_overrides[require_customer] = lambda: self.other
        self.assertEqual(self.client.get("/api/orders").json(), [])
        self.assertEqual(self.client.post("/api/product-reviews", json=payload).status_code, 403)
        self.app.dependency_overrides[require_customer] = lambda: self.user
        order.status = "CANCELLED"
        self.db.commit()
        self.assertEqual(self.client.post("/api/product-reviews", json=payload).status_code, 403)
        del self.app.dependency_overrides[require_customer]
        self.assertIn(self.client.get("/api/orders").status_code, [401, 403])
        self.assertIn(self.client.post("/api/orders/demo", json={"items": [{"product_id": self.product.id, "quantity": 1}], "receiver_name": "A", "receiver_phone": "1", "shipping_address": "B"}).status_code, [401, 403])
        self.assertEqual(self.client.get("/api/product-reviews").status_code, 200)

    def test_delete_review_removes_public_and_history_entry_and_allows_rewrite(self):
        self.checkout()
        order = self.db.query(Order).one()
        order.payment_status = "SUCCESS"
        self.db.commit()
        item = self.db.query(OrderItem).one()
        payload = {"order_item_id": item.id, "rating": 5, "content": "Đẹp"}
        review = self.client.post("/api/product-reviews", json=payload).json()
        response = self.client.request("DELETE", f"/api/product-reviews/{review['id']}")
        self.assertEqual(response.status_code, 204, response.text)
        self.assertEqual(response.text, "")
        self.assertEqual(self.client.get("/api/product-reviews").json(), [])
        self.assertIsNone(self.client.get("/api/orders").json()[0]["items"][0]["review"])
        self.assertEqual(self.db.query(Order).count(), 1)
        self.assertEqual(self.db.query(OrderItem).count(), 1)
        self.assertEqual(self.db.get(Product, self.product.id).stock_quantity, 4)
        self.assertEqual(self.client.request("DELETE", f"/api/product-reviews/{review['id']}").status_code, 404)
        self.assertEqual(self.client.post("/api/product-reviews", json=payload).status_code, 201)

    def test_delete_review_rejects_other_users_and_unauthenticated_requests(self):
        self.checkout()
        order = self.db.query(Order).one()
        order.payment_status = "SUCCESS"
        self.db.commit()
        item = self.db.query(OrderItem).one()
        review = self.client.post("/api/product-reviews", json={"order_item_id": item.id, "rating": 5, "content": "Đẹp"}).json()
        path = f"/api/product-reviews/{review['id']}"
        self.app.dependency_overrides[require_customer] = lambda: self.other
        self.assertEqual(self.client.request("DELETE", path).status_code, 404)
        self.assertEqual(self.db.query(OrderItemReview).count(), 1)
        del self.app.dependency_overrides[require_customer]
        self.assertIn(self.client.request("DELETE", path).status_code, [401, 403])
        self.assertEqual(len(self.client.get("/api/product-reviews").json()), 1)

    def test_each_purchased_item_can_be_reviewed_once_with_valid_stars(self):
        second = Product(name="Ghế", price=200000, stock_quantity=5, status=True)
        self.db.add(second)
        self.db.commit()
        response = self.client.post("/api/orders/demo", json={"items": [
            {"product_id": self.product.id, "quantity": 1}, {"product_id": second.id, "quantity": 1}],
            "receiver_name": "A", "receiver_phone": "1", "shipping_address": "B"})
        self.assertEqual(response.status_code, 201)
        items = self.client.get("/api/orders").json()[0]["items"]
        for rating, content in [(0, "Tốt"), (6, "Tốt"), (True, "Tốt"), (5, "  "), (5, "x" * 2001)]:
            result = self.client.post("/api/product-reviews", json={"order_item_id": items[0]["id"], "rating": rating, "content": content})
            self.assertEqual(result.status_code, 422)
        for item in items:
            result = self.client.post("/api/product-reviews", json={"order_item_id": item["id"], "rating": 5, "content": "Tốt"})
            self.assertEqual(result.status_code, 201, result.text)
        self.assertEqual(self.db.query(OrderItemReview).count(), 2)
        self.assertEqual(self.client.get("/api/product-reviews").json()[0]["order_item_id"], items[-1]["id"])


if __name__ == "__main__":
    unittest.main()
