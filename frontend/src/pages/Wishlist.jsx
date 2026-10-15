import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Star,
  Check,
  ArrowLeft,
  PackageOpen,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import "../styles/Wishlist.css";

function Wishlist() {
  const navigate = useNavigate();
  const { wishlistProducts, toggleWishlist, addToCart, isWishlisted } = useCart();
  const [addedIds, setAddedIds] = useState([]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1800);
  };

  // EMPTY STATE
  if (wishlistProducts.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-hero">
          <div className="wishlist-hero-inner">
            <div className="wishlist-breadcrumb">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <span>Yêu thích</span>
            </div>
            <h1>
              <Heart size={28} className="wl-title-icon" />
              Sản phẩm yêu thích
            </h1>
          </div>
        </div>

        <div className="wishlist-container">
          <div className="wishlist-empty">
            <div className="wl-empty-icon">
              <Heart size={40} />
            </div>
            <h2>Chưa có sản phẩm yêu thích</h2>
            <p>
              Hãy nhấn vào biểu tượng ♡ trên bất kỳ sản phẩm nào để lưu vào
              danh sách yêu thích của bạn.
            </p>
            <Link to="/products" className="wl-browse-btn">
              <ArrowLeft size={16} />
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      {/* PAGE HERO */}
      <div className="wishlist-hero">
        <div className="wishlist-hero-inner">
          <div className="wishlist-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/products">Sản phẩm</Link>
            <span>/</span>
            <span>Yêu thích</span>
          </div>
          <div className="wl-hero-row">
            <h1>
              <Heart size={26} className="wl-title-icon" fill="#e74c3c" color="#e74c3c" />
              Sản phẩm yêu thích
            </h1>
            <span className="wl-count-badge">{wishlistProducts.length} sản phẩm</span>
          </div>
          <p>Những sản phẩm bạn đã chọn lọc cho không gian sống của mình</p>
        </div>
      </div>

      <div className="wishlist-container">
        {/* GRID OF WISHLISTED PRODUCTS */}
        <div className="wishlist-grid">
          {wishlistProducts.map((product) => {
            const isJustAdded = addedIds.includes(product.id);
            const isOutOfStock =
              product.stock === 0 || product.badge === "Hết hàng";
            const primaryImg =
              product.primary_image ||
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";

            return (
              <article
                key={product.id}
                className="wl-product-card"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                {/* IMAGE */}
                <div className="wl-card-img-box">
                  <img src={primaryImg} alt={product.name} loading="lazy" />

                  {/* Badge */}
                  {product.badge && (
                    <div
                      className={`wl-badge ${isOutOfStock ? "out-of-stock" : ""}`}
                    >
                      {product.badge}
                    </div>
                  )}

                  {/* Remove from wishlist */}
                  <button
                    className="wl-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    title="Bỏ yêu thích"
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Add to cart overlay */}
                  {!isOutOfStock && (
                    <button
                      className={`wl-add-cart-btn ${isJustAdded ? "added" : ""}`}
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      {isJustAdded ? (
                        <>
                          <Check size={15} /> Đã thêm vào giỏ
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={15} /> Thêm vào giỏ
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* INFO */}
                <div className="wl-card-info">
                  <div className="wl-card-meta">
                    <span className="wl-card-material">
                      {product.material || "Nội thất cao cấp"}
                    </span>
                    <div className="wl-card-rating">
                      <Star size={12} fill="#c49a62" color="#c49a62" />
                      <span>{product.rating || "4.9"}</span>
                    </div>
                  </div>
                  <h3 className="wl-card-name">{product.name}</h3>
                  <div className="wl-card-price-row">
                    <strong className="wl-price">
                      {Number(product.price).toLocaleString("vi-VN")}₫
                    </strong>
                    {product.original_price && (
                      <span className="wl-orig-price">
                        {Number(product.original_price).toLocaleString("vi-VN")}₫
                      </span>
                    )}
                  </div>
                  {product.room_name && (
                    <span className="wl-room-tag">{product.room_name}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* BOTTOM CTA */}
        <div className="wishlist-cta-row">
          <Link to="/products" className="wl-continue-btn">
            <ArrowLeft size={16} />
            Tiếp tục mua sắm
          </Link>
          <Link to="/cart" className="wl-cart-btn">
            <ShoppingBag size={16} />
            Xem giỏ hàng
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Wishlist;
