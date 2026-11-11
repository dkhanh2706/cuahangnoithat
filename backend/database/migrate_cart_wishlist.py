"""Run from backend: python -B -m database.migrate_cart_wishlist.

Makes sure the per-account cart (carts, cart_items) and wishlist (wishlist_items) tables exist.
Tables that already exist are left untouched. Safe to run more than once.
"""
from database.database import Base, engine
import models  # noqa: F401  Register users and products first.
from models.shopping import Cart, CartItem, WishlistItem


if __name__ == "__main__":
    Base.metadata.create_all(engine, tables=[Cart.__table__, CartItem.__table__, WishlistItem.__table__])
    print("Cart and wishlist tables ready.")
