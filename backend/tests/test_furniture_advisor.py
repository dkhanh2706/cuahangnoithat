"""Advisor HTTP integration tests. Only an isolated SQLite database is used."""
import json
import os
import sys
import unittest
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ["DATABASE_URL"] = "sqlite://"

from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database.database import Base, get_db
import models
from models.product import Product
from models.product_image import ProductImage
from routers.advisor import router
from services.furniture_advisor import normalize, parse_budget
from test_store_reviews import ASGIClient


class FurnitureAdvisorTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        catalog = json.loads((Path(__file__).resolve().parents[1] / "database/catalog_products.json").read_text(encoding="utf-8"))
        for index, data in enumerate(catalog):
            product = Product(id=index + 101, name=data["name"], description=data["description"],
                              price=data["price"], material=data["material"], color=data["color"],
                              dimensions=data["dimensions"], stock_quantity=data["stock_quantity"], status=True)
            product.images = [ProductImage(image_url=data["images"][0], is_primary=True)]
            self.db.add(product)
        self.db.commit()
        app = FastAPI()
        app.include_router(router)
        app.dependency_overrides[get_db] = lambda: self.db
        self.client = ASGIClient(app)
        self.app = app

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def chat(self, message, **kwargs):
        response = self.client.post("/api/advisor/chat", json={"message": message, **kwargs})
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def test_bedroom_bundle_uses_live_ids_and_prices(self):
        result = self.chat("Phòng ngủ nên có những món gì?")
        self.assertIn("giường", result["reply"])
        self.assertIn("thêm cả bộ", result["reply"])
        offer = result["offers"][0]
        self.assertEqual(offer["kind"], "bundle")
        self.assertGreater(len(offer["items"]), 2)
        self.assertEqual(offer["total_price"], sum(item["product"]["price"] for item in offer["items"]))
        for item in offer["items"]:
            product = item["product"]
            self.assertGreaterEqual(product["id"], 101)
            self.assertEqual(product["price"], float(self.db.get(Product, product["id"]).price))
            self.assertTrue(product["primary_image"].startswith("https://"))

    def test_singles_and_multiturn_budget(self):
        result = self.chat("Tìm sofa dưới 15 triệu")
        self.assertGreater(len(result["offers"]), 0)
        for offer in result["offers"]:
            self.assertEqual(offer["kind"], "product")
            self.assertLessEqual(offer["total_price"], 15_000_000)
            self.assertIn("Sofa", offer["title"])
        result = self.chat("Ngân sách 20 triệu", history=["Tư vấn phòng ngủ"])
        self.assertLessEqual(result["offers"][0]["total_price"], 20_000_000)
        self.assertEqual(result["offers"][0]["kind"], "bundle")
        cheaper = self.chat("Có món rẻ hơn không?", history=["Tìm sofa"], suggested_ids=[101])
        self.assertTrue(all(offer["total_price"] < 18_500_000 for offer in cheaper["offers"]))

    def test_switch_room_and_material_color_constraints(self):
        result = self.chat("Tư vấn phòng khách", history=["Tôi cần giường ngủ"])
        self.assertEqual(result["offers"][0]["kind"], "bundle")
        self.assertTrue(any("Sofa" in item["product"]["name"] for item in result["offers"][0]["items"]))
        result = self.chat("Tìm sofa màu xanh")
        self.assertGreater(len(result["offers"]), 0)
        self.assertTrue(all("Xanh" in offer["items"][0]["product"]["color"] for offer in result["offers"]))
        result = self.chat("Tìm bàn làm việc gỗ sồi")
        self.assertGreater(len(result["offers"]), 0)
        result = self.chat("Ngân sách 1 triệu", history=["Tìm sofa"])
        self.assertEqual(result["offers"], [])

    def test_unaccented_text_and_money_not_dimensions(self):
        self.assertEqual(parse_budget(normalize("dưới 1,5 triệu")), Decimal("1500000"))
        self.assertEqual(parse_budget("tu 10 den 20 trieu"), Decimal("20000000"))
        self.assertEqual(parse_budget("duoi 15.000.000 vnd"), Decimal("15000000"))
        self.assertIsNone(parse_budget("phong 12m2, giuong 1m8"))
        self.assertTrue(self.chat("phong ngu nho 12m2")["offers"])

    def test_followup_bundle_and_generic_products(self):
        result = self.chat("Ngân sách 30 triệu", history=["Tìm giường ngủ", "Ghép bộ cho phòng này"])
        self.assertEqual(result["offers"][0]["kind"], "bundle")
        result = self.chat("Bạn tư vấn phòng khách giúp tôi")
        self.assertEqual(result["offers"][0]["kind"], "bundle")
        result = self.chat("Dưới 8 triệu", history=["Tìm bàn"])
        self.assertTrue(result["offers"])
        self.assertTrue(all(offer["total_price"] <= 8_000_000 for offer in result["offers"]))
        result = self.chat("Tôi muốn mua món lẻ", history=["Tư vấn phòng ngủ"])
        self.assertEqual(result["offers"], [])
        self.assertIn("món nào", result["reply"])
        self.assertEqual(self.chat("có")["offers"], [])

    def test_hidden_and_sold_out_products_never_offered(self):
        product = self.db.get(Product, 101)
        product.status = False
        self.db.commit()
        result = self.chat("Tìm sofa")
        self.assertNotIn(101, [item["product"]["id"] for offer in result["offers"] for item in offer["items"]])
        for product in self.db.query(Product).all():
            product.stock_quantity = 0
        self.db.commit()
        result = self.chat("Tư vấn phòng ngủ")
        self.assertEqual(result["offers"], [])

    def test_current_product_and_last_suggestion_details(self):
        result = self.chat("Sản phẩm này chất liệu và kích thước thế nào?", product_id=101)
        self.assertIn("Vải linen", result["reply"])
        self.assertEqual(result["offers"][0]["items"][0]["product"]["id"], 101)
        result = self.chat("Chất liệu món đầu tiên là gì?", suggested_ids=[104])
        self.assertIn(self.db.get(Product, 104).dimensions, result["reply"])
        product = self.db.get(Product, 104)
        product.stock_quantity = 0
        self.db.commit()
        result = self.chat("Sản phẩm này còn hàng không?", product_id=104)
        self.assertIn("hết hàng", result["reply"])
        self.assertEqual(result["offers"], [])

    def test_no_database_writes_and_no_invented_policy(self):
        before = [(p.id, p.price, p.stock_quantity, p.updated_at) for p in self.db.query(Product).all()]
        self.chat("Tư vấn phòng ngủ")
        result = self.chat("Phí giao hàng bao nhiêu?")
        self.assertEqual(result["offers"], [])
        self.assertIn("xác nhận", result["reply"])
        result = self.chat("Hướng dẫn thanh toán")
        self.assertIn("DEMO", result["reply"])
        self.assertEqual(before, [(p.id, p.price, p.stock_quantity, p.updated_at) for p in self.db.query(Product).all()])

    def test_cart_check_whole_bundle_stock_current_price_and_no_writes(self):
        items = [{"product_id": 101, "quantity": 1, "cart_quantity": 0}, {"product_id": 104, "quantity": 1, "cart_quantity": 0}]
        response = self.client.post("/api/advisor/check-cart", json={"items": items})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(len(response.json()), 2)
        product = self.db.get(Product, 101)
        product.price = Decimal("20000000")
        self.db.commit()
        response = self.client.post("/api/advisor/check-cart", json={"items": items})
        self.assertEqual(response.json()[0]["product"]["price"], 20_000_000)
        items[0]["cart_quantity"] = product.stock_quantity
        self.assertEqual(self.client.post("/api/advisor/check-cart", json={"items": items}).status_code, 409)
        items[0]["cart_quantity"] = 0
        self.db.get(Product, 104).status = False
        self.db.commit()
        response = self.client.post("/api/advisor/check-cart", json={"items": items})
        self.assertEqual(response.status_code, 409)
        self.assertIn("Chưa thêm", response.json()["detail"])
        self.assertEqual(self.db.get(Product, 101).stock_quantity, 12)

    def test_invalid_requests(self):
        for payload in [{"message": " "}, {"message": "x" * 1201}, {"message": "hi", "history": ["x"] * 13},
                        {"message": "hi", "history": ["x" * 1201]}, {"message": "hi", "product_id": -1}]:
            self.assertEqual(self.client.post("/api/advisor/chat", json=payload).status_code, 422)
        for items in [[], [{"product_id": 101, "quantity": 0}], [{"product_id": 101, "cart_quantity": -1}],
                      [{"product_id": 101}, {"product_id": 101}]]:
            self.assertEqual(self.client.post("/api/advisor/check-cart", json={"items": items}).status_code, 422)


if __name__ == "__main__":
    unittest.main()
