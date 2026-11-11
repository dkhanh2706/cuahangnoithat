import { Star, ShoppingBag, Heart, Check, Eye } from "lucide-react";

function ProductGridCard({ product, isFav, isJustAdded, onOpen, onToggleWishlist, onQuickView, onAddToCart }) {
  const primaryImg =
    product.primary_image ||
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";
  const secondaryImg = product.secondary_image || primaryImg;
  const isOutOfStock = product.stock === 0 || product.badge === "Hết hàng";

  return (
    <article
      key={product.id}
      className="catalog-product-card"
      onClick={() => onOpen(product)}
    >
      <div className="card-image-box">
        {/* Dual Images with Hover Swap */}
        <img
          src={primaryImg}
          alt={product.name}
          className="card-img-primary"
          loading="lazy"
        />
        <img
          src={secondaryImg}
          alt={`${product.name} góc khác`}
          className="card-img-secondary"
          loading="lazy"
        />

        {/* Badge Tag */}
        {product.badge && (
          <div
            className={`card-badge-pill ${isOutOfStock ? "out-of-stock" : ""}`}
          >
            <span>{product.badge}</span>
          </div>
        )}

        {/* Wishlist Heart Icon */}
        <button
          className={`card-wishlist-btn ${isFav ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          aria-label="Yêu thích"
        >
          <Heart
            size={17}
            fill={isFav ? "#e74c3c" : "none"}
            color={isFav ? "#e74c3c" : "#3b473f"}
          />
        </button>

        {/* Quick View Button */}
        <button
          className="card-quick-view-btn"
          onClick={(e) => onQuickView(e, product)}
        >
          <Eye size={15} />
          <span>Xem nhanh</span>
        </button>

        {/* Add to Cart Button */}
        {!isOutOfStock && (
          <button
            className={`card-add-cart-btn ${isJustAdded ? "added" : ""}`}
            onClick={(e) => onAddToCart(e, product, 1)}
          >
            {isJustAdded ? (
              <>
                <Check size={16} /> Đã thêm vào giỏ
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> Thêm vào giỏ
              </>
            )}
          </button>
        )}
      </div>

      <div className="card-info-box">
        <div className="card-meta-row">
          <span className="card-material-text">
            {product.material || "Nội thất cao cấp"}
          </span>
          <div className="card-rating-badge">
            <Star size={13} fill="#c49a62" color="#c49a62" />
            <span>{product.rating || "4.9"}</span>
          </div>
        </div>

        <h3 className="card-title-text">{product.name}</h3>

        <div className="card-price-row">
          <strong className="card-current-price">
            {Number(product.price).toLocaleString("vi-VN")}₫
          </strong>
          {product.original_price && (
            <span className="card-orig-price">
              {Number(product.original_price).toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductGridCard;
