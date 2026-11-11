import unittest
from decimal import Decimal
from unittest.mock import patch

from test_store_reviews import ASGIClient
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database.database import Base, get_db
from models.order_review import Order, OrderItem
from models.product import Product
from models.user import User
from routers import admin_dashboard, order_management, shopping, store_reviews
from utils.dependencies import require_admin, require_customer


class ShopApiTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        self.admin = User(full_name="Admin", email="adminhdk@gmail.com", password_hash="x", role="ADMIN", status=True)
        self.alice = User(full_name="Alice", email="alice@example.com", password_hash="x", role="CUSTOMER", status=True)
        self.bob = User(full_name="Bob", email="bob@example.com", password_hash="x", role="CUSTOMER", status=True)
        self.sofa = Product(name="Sofa", price=Decimal("3000000"), stock_quantity=10, status=True)
        self.table = Product(name="Bàn", price=Decimal("1000000"), stock_quantity=2, status=True)
        self.lamp = Product(name="Đèn", price=Decimal("500000"), stock_quantity=50, status=True)
        self.db.add_all([self.admin, self.alice, self.bob, self.sofa, self.table, self.lamp])
        self.db.commit()
        self.customer = self.alice
        self.app = FastAPI()
        for module in (shopping, admin_dashboard, order_management, store_reviews):
            self.app.include_router(module.router)
        self.app.dependency_overrides[get_db] = lambda: self.db
        self.app.dependency_overrides[require_customer] = lambda: self.customer
        self.app.dependency_overrides[require_admin] = lambda: self.admin
        self.client = ASGIClient(self.app)

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    # ----- giỏ hàng -----
    def test_cart_roundtrip_merges_duplicates_and_drops_unknown_products(self):
        put = self.client.request("PUT", "/api/cart", {"items": [
            {"product_id": self.sofa.id, "quantity": 1},
            {"product_id": self.sofa.id, "quantity": 2},
            {"product_id": 9999, "quantity": 1},
        ]})
        self.assertEqual(put.status_code, 200, put.text)
        self.assertEqual(put.json()["items"], [{"product_id": self.sofa.id, "quantity": 3}])
        self.assertEqual(self.client.get("/api/cart").json(), put.json())

    def test_cart_put_replaces_previous_content(self):
        self.client.request("PUT", "/api/cart", {"items": [{"product_id": self.sofa.id, "quantity": 2}]})
        self.client.request("PUT", "/api/cart", {"items": [{"product_id": self.lamp.id, "quantity": 1}]})
        items = self.client.get("/api/cart").json()["items"]
        self.assertEqual(items, [{"product_id": self.lamp.id, "quantity": 1}])
        self.client.request("PUT", "/api/cart", {"items": []})
        self.assertEqual(self.client.get("/api/cart").json()["items"], [])

    def test_cart_is_private_per_customer(self):
        self.client.request("PUT", "/api/cart", {"items": [{"product_id": self.sofa.id, "quantity": 2}]})
        self.customer = self.bob
        self.assertEqual(self.client.get("/api/cart").json()["items"], [])
        self.client.request("PUT", "/api/cart", {"items": [{"product_id": self.lamp.id, "quantity": 1}]})
        self.customer = self.alice
        self.assertEqual(self.client.get("/api/cart").json()["items"],
                         [{"product_id": self.sofa.id, "quantity": 2}])

    def test_cart_rejects_invalid_quantities(self):
        for quantity in (0, -1, 1000):
            r = self.client.request("PUT", "/api/cart", {"items": [{"product_id": self.sofa.id, "quantity": quantity}]})
            self.assertEqual(r.status_code, 422, quantity)

    def test_wishlist_roundtrip_dedupes_and_drops_unknown(self):
        r = self.client.request("PUT", "/api/wishlist",
                                {"product_ids": [self.lamp.id, self.sofa.id, self.lamp.id, 9999]})
        self.assertEqual(r.status_code, 200, r.text)
        self.assertEqual(sorted(r.json()["product_ids"]), sorted([self.lamp.id, self.sofa.id]))
        self.customer = self.bob
        self.assertEqual(self.client.get("/api/wishlist").json()["product_ids"], [])

    # ----- số đơn chờ + email admin -----
    def checkout_payload(self):
        return {"items": [{"product_id": self.lamp.id, "quantity": 1}], "receiver_name": "Alice",
                "receiver_phone": "0900", "shipping_address": "HCM"}

    def test_new_order_emails_admin_once_and_updates_pending_badge(self):
        self.assertEqual(self.client.get("/api/admin/orders/summary").json()["pending"], 0)
        with patch.object(store_reviews, "send_new_order_email") as send:
            first = self.client.request("POST", "/api/orders", self.checkout_payload() | {"request_id": "3f2b1c9e-7d41-4a52-9b6e-1c8d2a4f5e60"})
            retry = self.client.request("POST", "/api/orders", self.checkout_payload() | {"request_id": "3f2b1c9e-7d41-4a52-9b6e-1c8d2a4f5e60"})
        self.assertEqual(first.status_code, 201, first.text)
        self.assertEqual(retry.status_code, 201, retry.text)
        self.assertEqual(send.call_count, 1)  # gửi lại cùng request_id không báo trùng
        self.assertIn("/admin/orders", send.call_args.args[4])
        summary = self.client.get("/api/admin/orders/summary").json()
        self.assertEqual(summary["pending"], 1)
        self.assertEqual(summary["latest_order_id"], first.json()["id"])

    # ----- thống kê -----
    def add_order(self, code, status, total, items, user=None):
        order = Order(code=code, user_id=(user or self.alice).id, total=Decimal(total), receiver_name="A",
                      receiver_phone="1", shipping_address="B", status=status)
        self.db.add(order)
        self.db.flush()
        for product, quantity in items:
            self.db.add(OrderItem(order_id=order.id, product_id=product.id, product_name=product.name, quantity=quantity,
                                  unit_price=product.price, subtotal=product.price * quantity))
        self.db.commit()
        return order

    def test_dashboard_counts_revenue_only_for_completed_real_orders(self):
        self.add_order("CHNT-1", "COMPLETED", "6000000", [(self.sofa, 2)])
        self.add_order("CHNT-2", "COMPLETED", "1000000", [(self.table, 1)])
        self.add_order("CHNT-3", "PENDING", "500000", [(self.lamp, 1)])
        self.add_order("CHNT-4", "CANCELLED", "9000000", [(self.sofa, 3)])
        self.add_order("DEMO-5", "COMPLETED", "7000000", [(self.sofa, 1)])
        data = self.client.get("/api/admin/dashboard?days=7").json()
        self.assertEqual(data["totals"]["revenue"], 7000000)
        self.assertEqual(data["totals"]["pending_orders"], 1)
        self.assertEqual(data["totals"]["customers"], 2)
        self.assertEqual(data["orders_by_status"], {"PENDING": 1, "CONFIRMED": 0, "SHIPPING": 0, "COMPLETED": 2, "CANCELLED": 1})
        self.assertEqual(len(data["daily"]), 7)
        self.assertEqual(sum(day["revenue"] for day in data["daily"]), 7000000)
        self.assertEqual(sum(day["orders"] for day in data["daily"]), 4)  # không đếm đơn DEMO
        self.assertEqual([p["name"] for p in data["top_products"]], ["Sofa", "Bàn"])
        self.assertEqual(data["top_products"][0]["quantity"], 2)

    def test_dashboard_low_stock_and_empty_state(self):
        data = self.client.get("/api/admin/dashboard").json()
        self.assertEqual(data["totals"]["revenue"], 0)
        self.assertEqual(data["top_products"], [])
        self.assertEqual([p["name"] for p in data["low_stock"]], ["Bàn"])  # tồn 2 <= 5
        self.assertEqual(self.client.get("/api/admin/dashboard?days=3").status_code, 422)


if __name__ == "__main__":
    unittest.main()
