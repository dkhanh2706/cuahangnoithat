import unittest
from unittest.mock import patch

from test_store_reviews import ASGIClient
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database.database import Base, get_db
from models.user import User
from routers import auth
from utils.dependencies import get_current_user
from utils.security import create_reset_token, hash_password, verify_password


class PasswordFlowTests(unittest.TestCase):
    def setUp(self):
        auth._last_forgot_request.clear()
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        self.user = User(full_name="Khách thử", email="khach@example.com", role="CUSTOMER", status=True,
                         password_hash=hash_password("matkhau-cu"))
        self.admin = User(full_name="Admin", email="adminhdk@gmail.com", role="ADMIN", status=True,
                          password_hash=hash_password("admin-pass"))
        self.db.add_all([self.user, self.admin])
        self.db.commit()
        self.current = self.user
        self.app = FastAPI()
        self.app.include_router(auth.router)
        self.app.dependency_overrides[get_db] = lambda: self.db
        self.app.dependency_overrides[get_current_user] = lambda: self.current
        self.client = ASGIClient(self.app)

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    # ----- đổi mật khẩu -----
    def test_change_password_success(self):
        r = self.client.request("POST", "/api/auth/change-password",
                                {"current_password": "matkhau-cu", "new_password": "matkhau-moi"})
        self.assertEqual(r.status_code, 200, r.text)
        self.db.refresh(self.user)
        self.assertTrue(verify_password("matkhau-moi", self.user.password_hash))

    def test_change_password_rejects_wrong_current(self):
        r = self.client.request("POST", "/api/auth/change-password",
                                {"current_password": "sai", "new_password": "matkhau-moi"})
        self.assertEqual(r.status_code, 400)
        self.db.refresh(self.user)
        self.assertTrue(verify_password("matkhau-cu", self.user.password_hash))

    def test_change_password_rejects_same_and_short(self):
        same = self.client.request("POST", "/api/auth/change-password",
                                   {"current_password": "matkhau-cu", "new_password": "matkhau-cu"})
        self.assertEqual(same.status_code, 400)
        short = self.client.request("POST", "/api/auth/change-password",
                                    {"current_password": "matkhau-cu", "new_password": "123"})
        self.assertEqual(short.status_code, 422)

    def test_admin_cannot_change_password_here(self):
        self.current = self.admin
        r = self.client.request("POST", "/api/auth/change-password",
                                {"current_password": "admin-pass", "new_password": "admin-moi"})
        self.assertEqual(r.status_code, 403)

    # ----- quên mật khẩu -----
    def forgot(self, email):
        return self.client.request("POST", "/api/auth/forgot-password", {"email": email})

    def test_forgot_sends_email_for_existing_user_only(self):
        with patch.object(auth, "send_password_reset_email") as send:
            known = self.forgot("khach@example.com")
            unknown = self.forgot("khong-ton-tai@example.com")
        self.assertEqual(known.status_code, 200)
        self.assertEqual(known.json(), unknown.json())  # không lộ email nào đã đăng ký
        self.assertEqual(send.call_count, 1)
        self.assertIn("/reset-password?token=", send.call_args.args[2])

    def test_forgot_skips_admin_and_locked_users(self):
        self.user.status = False
        self.db.commit()
        with patch.object(auth, "send_password_reset_email") as send:
            self.forgot("khach@example.com")
            self.forgot("adminhdk@gmail.com")
        send.assert_not_called()

    def test_forgot_has_cooldown_per_email(self):
        with patch.object(auth, "send_password_reset_email") as send:
            self.forgot("khach@example.com")
            self.forgot("khach@example.com")
        self.assertEqual(send.call_count, 1)

    # ----- đặt lại mật khẩu -----
    def reset(self, token, password="matkhau-moi"):
        return self.client.request("POST", "/api/auth/reset-password", {"token": token, "new_password": password})

    def test_reset_with_valid_token_is_single_use(self):
        token = create_reset_token(self.user)
        first = self.reset(token)
        self.assertEqual(first.status_code, 200, first.text)
        self.db.refresh(self.user)
        self.assertTrue(verify_password("matkhau-moi", self.user.password_hash))
        again = self.reset(token, "mat-khau-khac")
        self.assertEqual(again.status_code, 400)

    def test_reset_rejects_garbage_and_wrong_purpose_tokens(self):
        self.assertEqual(self.reset("khong-phai-token-hop-le").status_code, 400)
        from utils.security import create_access_token
        login_token = create_access_token({"sub": str(self.user.id), "email": self.user.email, "role": "CUSTOMER"})
        self.assertEqual(self.reset(login_token).status_code, 400)

    def test_reset_rejects_admin_and_locked_user(self):
        self.assertEqual(self.reset(create_reset_token(self.admin)).status_code, 400)
        token = create_reset_token(self.user)
        self.user.status = False
        self.db.commit()
        self.assertEqual(self.reset(token).status_code, 400)


if __name__ == "__main__":
    unittest.main()
