from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from sqlalchemy import text

from database.database import engine

from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.categories import router as categories_router
from routers.products import router as products_router
from routers.product_images import router as product_images_router
from routers.store_reviews import router as store_reviews_router
from admin.router import router as admin_router
from admin.init_admin import ensure_single_admin


app = FastAPI(
    title="HTTT05 - Furniture Store API",
    description="RESTful API cho hệ thống quản lý cửa hàng nội thất",
    version="1.0.0"
)


@app.on_event("startup")
def on_startup():
    ensure_single_admin()


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# =========================
# ROUTERS
# =========================

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(categories_router)
app.include_router(products_router)
app.include_router(product_images_router)
app.include_router(store_reviews_router)
app.include_router(admin_router)


# =========================
# ROOT
# =========================

@app.get("/")
def root():
    return {
        "message": "HTTT05 Furniture Store API is running"
    }


# =========================
# HEALTH CHECK
# =========================

@app.get("/api/health")
def health():
    return {
        "status": "ok"
    }


# =========================
# DATABASE TEST
# =========================

@app.get("/api/db-test")
def test_database():
    try:
        with engine.connect() as connection:

            result = connection.execute(
                text(
                    "SELECT current_database();"
                )
            )

            database_name = result.scalar()

        return {
            "status": "success",
            "database": database_name
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }
