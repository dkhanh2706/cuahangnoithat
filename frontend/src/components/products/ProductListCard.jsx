import { Star, ShoppingBag, Heart, Check } from "lucide-react";

function ProductListCard({ product, isFav, isJustAdded, onOpen, onToggleWishlist, onAddToCart }) {
  const primaryImg =
    product.primary_image ||
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";

  return (
    <article
      key={product.id}
      className="catalog-product-card-list"
      onClick={() => onOpen(product)}
    >
      <div className="list-card-img-box">
        <img src={primaryImg} alt={product.name} loading="lazy" />
        {product.badge && (
          <div className="card-badge-pill">
            <span>{product.badge}</span>
          </div>
        )}
      </div>

      <div className="list-card-info-box">
        <div>
          <div className="card-meta-row">
            <span className="card-material-text">
              {product.room_name} • {product.material}
            </span>
            <div className="card-rating-badge">
              <Star size={14} fill="#c49a62" color="#c49a62" />
              <span>{product.rating || "4.9"} ({product.reviews_count || 24})</span>
            </div>
          </div>

          <h3 style={{ fontSize: "18px", margin: "6px 0", color: "#17241c" }}>
            {product.name}
          </h3>

          <p className="list-card-desc">{product.description}</p>
        </div>

        <div className="list-card-bottom">
          <div className="card-price-row">
            <strong style={{ fontSize: "20px", color: "#1e3428" }}>
              {Number(product.price).toLocaleString("vi-VN")}₫
            </strong>
            {product.original_price && (
              <span className="card-orig-price">
                {Number(product.original_price).toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>

          <div className="list-action-btns">
            <button
              className={`card-wishlist-btn ${isFav ? "active" : ""}`}
              style={{ position: "static" }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
            >
              <Heart
                size={18}
                fill={isFav ? "#e74c3c" : "none"}
                color={isFav ? "#e74c3c" : "#3b473f"}
              />
            </button>

            <button
              className="list-add-cart-btn"
              onClick={(e) => onAddToCart(e, product, 1)}
            >
              {isJustAdded ? (
                <>
                  <Check size={16} /> Đã thêm
                </>
              ) : (
                <>
                  <ShoppingBag size={16} /> Thêm vào giỏ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductListCard;
