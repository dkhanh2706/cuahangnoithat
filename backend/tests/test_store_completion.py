"""Order workflow, real collection membership and persistent newsletter tests."""
import unittest
from uuid import uuid4
import test_store_reviews as review_tests
from routers.order_management import router as management_router
from routers.store_features import router as features_router
from utils.dependencies import get_current_user
from models.order_review import Order, OrderItem
from models.product import Product
from models.user import User
from models.store_features import CollectionProduct, NewsletterSubscriber
from database.migrate_store_features import seed_collections


class StoreCompletionTests(unittest.TestCase):
    def setUp(self):
        review_tests.StoreReviewTests.setUp(self)
        self.admin = User(full_name="Admin", email="adminhdk@gmail.com", password_hash="unused", role="ADMIN", status=True)
        self.db.add(self.admin)
        self.db.commit()
        self.actor = self.admin
        self.app.dependency_overrides[get_current_user] = lambda: self.actor
        self.app.include_router(management_router)
        self.app.include_router(features_router)

    def tearDown(self):
        review_tests.StoreReviewTests.tearDown(self)

    def payload(self, **updates):
        return {"items": [{"product_id": self.product.id, "quantity": 1}],
            "receiver_name": "Khach", "receiver_phone": "0901234567", "shipping_address": "Ha Noi", **updates}

    def place(self, **updates):
        response = self.client.post("/api/orders", self.payload(**updates))
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()

    def transition(self, order, status):
        return self.client.request("PATCH", f"/api/admin/orders/{order['id']}/status", {"status": status})

    def test_cod_lifecycle_and_customer_history(self):
        order = self.place(promo_code="CHNT10")
        self.assertEqual(order["payment_status"], "PENDING")
        self.assertTrue(order["code"].startswith("CHNT-"))
        self.assertEqual(self.db.get(Product, self.product.id).stock_quantity, 4)
        item_id = self.client.get("/api/orders").json()[0]["items"][0]["id"]
        self.assertEqual(self.client.post("/api/product-reviews", {"order_item_id": item_id, "rating": 5, "content": "Tot"}).status_code, 403)
        for status in ["CONFIRMED", "SHIPPING", "COMPLETED"]:
            response = self.transition(order, status)
            self.assertEqual(response.status_code, 200, response.text)
            self.assertEqual(response.json()["status"], status)
        history = self.client.get("/api/orders").json()[0]
        self.assertEqual(history["status"], "COMPLETED")
        self.assertEqual(history["payment_status"], "SUCCESS")
        self.assertEqual(history["shipping_address"], "Ha Noi")
        self.assertEqual(self.db.get(Product, self.product.id).stock_quantity, 4)
        self.assertEqual(self.client.post("/api/product-reviews", {"order_item_id": item_id, "rating": 5, "content": "Tot"}).status_code, 201)
        self.assertEqual(self.transition(order, "CANCELLED").status_code, 409)

    def test_cancel_restores_inventory_once_and_cannot_reopen(self):
        order = self.place(items=[{"product_id": self.product.id, "quantity": 2}])
        self.assertEqual(self.transition(order, "CONFIRMED").status_code, 200)
        for _ in range(2):
            self.assertEqual(self.transition(order, "CANCELLED").status_code, 200)
            self.assertEqual(self.db.get(Product, self.product.id).stock_quantity, 5)
        self.assertEqual(self.transition(order, "CONFIRMED").status_code, 409)

    def test_demo_cancellation_never_increases_inventory(self):
        response = self.client.post("/api/orders/demo", self.payload())
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.transition(response.json(), "CANCELLED").status_code, 200)
        self.assertEqual(self.db.get(Product, self.product.id).stock_quantity, 5)

    def test_cannot_skip_shipping_or_complete_twice(self):
        order = self.place()
        self.assertEqual(self.transition(order, "COMPLETED").status_code, 409)
        self.assertEqual(self.transition(order, "SHIPPING").status_code, 409)
        self.assertEqual(self.transition(order, "CONFIRMED").status_code, 200)
        self.assertEqual(self.transition(order, "SHIPPING").status_code, 200)
        self.assertEqual(self.transition(order, "CANCELLED").status_code, 409)
        for _ in range(2):
            self.assertEqual(self.transition(order, "COMPLETED").status_code, 200)
        self.assertEqual(self.db.get(Product, self.product.id).stock_quantity, 4)

    def test_idempotent_checkout_returns_one_order_even_after_stock_runs_out(self):
        key = str(uuid4())
        payload = {"request_id": key, "items": [{"product_id": self.product.id, "quantity": 5}]}
        first = self.place(**payload)
        second = self.place(**payload)
        self.assertEqual(first["id"], second["id"])
        self.assertEqual(self.db.query(Order).count(), 1)
        self.assertEqual(self.db.get(Product, self.product.id).stock_quantity, 0)
        self.assertEqual(self.client.post("/api/orders", self.payload(request_id=key, receiver_name="Changed")).status_code, 409)

    def test_invalid_prices_coupons_and_stock_create_no_orders(self):
        for updates in [{"expected_total": 1}, {"promo_code": "INVALID"},
                        {"items": [{"product_id": self.product.id, "quantity": 6}]},
                        {"items": [{"product_id": self.product.id, "quantity": 1}, {"product_id": 999999, "quantity": 1}]}]:
            response = self.client.post("/api/orders", self.payload(**updates))
            self.assertIn(response.status_code, [400, 409], response.text)
        self.assertEqual(self.db.query(Order).count(), 0)
        self.assertEqual(self.db.query(OrderItem).count(), 0)
        self.assertEqual(self.db.get(Product, self.product.id).stock_quantity, 5)
        quote = self.client.post("/api/orders/quote", self.payload(promo_code="CHNT20"))
        self.assertEqual(quote.status_code, 200, quote.text)
        self.assertEqual(float(quote.json()["total"]), 950000)

    def test_admin_filters_pagination_and_details(self):
        order = self.place(receiver_name="Target")
        self.place(receiver_name="Other")
        result = self.client.get("/api/admin/orders?q=Target&status=PENDING&limit=1").json()
        self.assertEqual(result["total"], 1)
        self.assertEqual(result["items"][0]["id"], order["id"])
        self.assertEqual(self.client.get("/api/admin/orders?offset=1&limit=1").json()["total"], 2)
        detail = self.client.get(f"/api/admin/orders/{order['id']}").json()
        self.assertEqual(detail["items"][0]["product_name"], self.product.name)
        self.assertEqual(self.client.get("/api/admin/orders/999999").status_code, 404)
        self.assertEqual(self.client.get("/api/admin/orders?status=INVALID").status_code, 422)

    def test_customer_cannot_read_or_update_admin_data(self):
        order = self.place()
        self.actor = self.user
        for path in ["/api/admin/orders", f"/api/admin/orders/{order['id']}", "/api/admin/newsletter/subscriptions"]:
            self.assertEqual(self.client.get(path).status_code, 403)
        self.assertEqual(self.transition(order, "CANCELLED").status_code, 403)
        self.assertEqual(self.client.request("DELETE", "/api/admin/newsletter/subscriptions/1").status_code, 403)

    def test_collection_uses_database_ids_prices_and_renamed_products(self):
        self.product.id = 301
        self.product.name = "Database product"
        self.db.commit()
        self.db.add(CollectionProduct(collection_slug="phong-khach-bac-au", product_id=301, position=0, hotspot_x=45, hotspot_y=68))
        self.db.commit()
        response = self.client.get("/api/collections/products")
        self.assertEqual(response.status_code, 200, response.text)
        collection = response.json()["phong-khach-bac-au"]
        self.assertEqual(collection["products"][0]["id"], 301)
        self.assertEqual(collection["hotspots"][0]["product_id"], 301)
        self.product.price = 2345678
        self.product.name = "Renamed"
        self.product.stock_quantity = 0
        self.db.commit()
        updated = self.client.get("/api/collections/products").json()["phong-khach-bac-au"]["products"][0]
        self.assertEqual(updated["name"], "Renamed")
        self.assertEqual(float(updated["price"]), 2345678)
        self.assertEqual(updated["stock_quantity"], 0)
        self.product.status = False
        self.db.commit()
        self.assertEqual(self.client.get("/api/collections/products").json(), {})

    def test_collection_seed_is_repeatable_and_does_not_guess_ids(self):
        seed_collections(self.db)
        self.assertEqual(self.db.query(CollectionProduct).count(), 0)
        self.product.name = "Sofa Góc L-Shape Scandinavia Nord"
        self.db.commit()
        seed_collections(self.db)
        count = self.db.query(CollectionProduct).count()
        self.assertGreater(count, 0)
        seed_collections(self.db)
        self.assertEqual(self.db.query(CollectionProduct).count(), count)

    def test_newsletter_persists_deduplicates_and_requires_consent(self):
        for email in ["Customer@example.com", "customer@example.com"]:
            response = self.client.post("/api/newsletter/subscriptions", {"email": email, "consent": True})
            self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(self.db.query(NewsletterSubscriber).count(), 1)
        self.assertEqual(self.client.post("/api/newsletter/subscriptions", {"email": "bad", "consent": True}).status_code, 422)
        self.assertEqual(self.client.post("/api/newsletter/subscriptions", {"email": "other@example.com", "consent": False}).status_code, 422)
        row = self.client.get("/api/admin/newsletter/subscriptions?q=customer").json()["items"][0]
        self.assertEqual(row["email"], "customer@example.com")
        self.assertEqual(self.client.request("DELETE", f"/api/admin/newsletter/subscriptions/{row['id']}").status_code, 204)
        self.assertEqual(self.db.query(NewsletterSubscriber).count(), 0)
