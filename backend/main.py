from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import config

from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.categories import router as categories_router
from routers.products import router as products_router
from routers.product_images import router as product_images_router
from routers.store_reviews import router as store_reviews_router
from routers.advisor import router as advisor_router
from routers.live_chat import router as live_chat_router
from admin.router import router as admin_router
from admin.init_admin import ensure_single_admin
from routers.order_management import router as order_management_router
from routers.store_features import router as store_features_router
from routers.shopping import router as shopping_router
from routers.admin_dashboard import router as admin_dashboard_router


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
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


config.UPLOADS_DIR.mkdir(exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=config.UPLOADS_DIR),
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
app.include_router(advisor_router)
app.include_router(live_chat_router)
app.include_router(admin_router)
app.include_router(order_management_router)
app.include_router(store_features_router)
app.include_router(shopping_router)
app.include_router(admin_dashboard_router)


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
