import base64
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from test_store_reviews import ASGIClient
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database.database import Base, get_db
from models.user import User
from routers import users
from utils.dependencies import get_current_user


PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1kAAAAASUVORK5CYII=")


class ProfileAvatarTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        self.user = User(full_name="Khách thử", email="avatar@example.com", password_hash="unused", role="CUSTOMER", status=True)
        self.other = User(full_name="Khách khác", email="other-avatar@example.com", password_hash="unused", role="CUSTOMER", status=True)
        self.db.add_all([self.user, self.other])
        self.db.commit()
        self.directory = tempfile.TemporaryDirectory()
        self.upload_patch = patch.object(users, "AVATAR_DIR", Path(self.directory.name))
        self.upload_patch.start()
        self.app = FastAPI()
        self.app.include_router(users.router)
        self.app.dependency_overrides[get_db] = lambda: self.db
        self.app.dependency_overrides[get_current_user] = lambda: self.user
        self.client = ASGIClient(self.app)

    def tearDown(self):
        self.upload_patch.stop()
        self.directory.cleanup()
        self.db.close()
        self.engine.dispose()

    def upload(self, content=PNG, mime="image/png", filename="avatar.png"):
        boundary = "avatar-test-boundary"
        body = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\nContent-Type: {mime}\r\n\r\n'.encode()
                + content + f"\r\n--{boundary}--\r\n".encode())
        return self.client.request("POST", "/api/users/me/avatar", body=body,
                                   headers=[(b"content-type", f"multipart/form-data; boundary={boundary}".encode())])

    def test_upload_persists_and_is_returned_on_profile_reload(self):
        response = self.upload(filename="../../untrusted.png")
        self.assertEqual(response.status_code, 200, response.text)
        url = response.json()["avatar_url"]
        self.assertTrue(url.startswith("/uploads/avatars/"))
        self.assertNotIn("untrusted", url)
        self.assertEqual((Path(self.directory.name) / Path(url).name).read_bytes(), PNG)
        self.db.expire_all()
        self.assertEqual(self.client.get("/api/users/me").json()["avatar_url"], url)
        self.assertNotIn("password_hash", response.json())
        self.app.dependency_overrides[get_current_user] = lambda: self.other
        self.assertIsNone(self.client.get("/api/users/me").json()["avatar_url"])

    def test_invalid_or_oversized_upload_keeps_previous_avatar(self):
        url = self.upload().json()["avatar_url"]
        self.assertEqual(self.upload(b"<svg></svg>", "image/svg+xml").status_code, 400)
        self.assertEqual(self.upload(b"this is not a png").status_code, 400)
        self.assertEqual(self.upload(b"x" * (users.MAX_AVATAR_BYTES + 1)).status_code, 413)
        self.assertEqual(self.client.get("/api/users/me").json()["avatar_url"], url)
        self.assertEqual(len(list(Path(self.directory.name).iterdir())), 1)

    def test_profile_save_preserves_avatar_and_cannot_change_account_role(self):
        url = self.upload().json()["avatar_url"]
        response = self.client.request("PATCH", "/api/users/me", {
            "full_name": "  Tên mới  ", "phone": "0901234567", "address": "Hà Nội", "role": "ADMIN", "email": "wrong@example.com"})
        self.assertEqual(response.status_code, 200, response.text)
        data = response.json()
        self.assertEqual(data["full_name"], "Tên mới")
        self.assertEqual(data["avatar_url"], url)
        self.assertEqual(data["role"], "CUSTOMER")
        self.assertEqual(data["email"], "avatar@example.com")
        self.assertEqual(self.client.request("PATCH", "/api/users/me", {"full_name": "  "}).status_code, 422)

    def test_profile_and_upload_require_authentication(self):
        del self.app.dependency_overrides[get_current_user]
        self.assertIn(self.upload().status_code, [401, 403])
        self.assertIn(self.client.request("PATCH", "/api/users/me", {"full_name": "Name"}).status_code, [401, 403])
        self.assertEqual(list(Path(self.directory.name).iterdir()), [])


if __name__ == "__main__":
    unittest.main()
