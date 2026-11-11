import { useState } from "react";
import { Star, ShoppingBag, X, ArrowRight } from "lucide-react";

function QuickViewModal({ product, onClose, onAddToCart, onOpenDetail }) {
  const [image, setImage] = useState(product.primary_image || "");
  const [qty, setQty] = useState(1);

  return (
    <div
      className="quick-view-overlay"
      onClick={() => onClose()}
    >
      <div
        className="quick-view-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="quick-view-close-btn"
          onClick={() => onClose()}
        >
          <X size={20} />
        </button>

        <div className="quick-view-grid">
          {/* GALLERY */}
          <div className="quick-view-gallery">
            <div className="quick-view-main-img">
              <img src={image} alt={product.name} />
            </div>
            {product.gallery && product.gallery.length > 1 && (
              <div className="quick-view-thumbs">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    className={`quick-thumb-btn ${image === img ? "active" : ""}`}
                    onClick={() => setImage(img)}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="quick-view-info">
            <span className="quick-view-category">
              {product.room_name} • {product.style}
            </span>

            <h2 className="quick-view-title">{product.name}</h2>

            <div className="card-rating-badge" style={{ marginBottom: "12px" }}>
              <Star size={15} fill="#c49a62" color="#c49a62" />
              <span>{product.rating || "4.9"} ({product.reviews_count || 30} nhận xét)</span>
            </div>

            <div className="quick-view-price">
              {Number(product.price).toLocaleString("vi-VN")}₫
            </div>

            <p className="quick-view-desc">{product.description}</p>

            <div className="quick-view-specs">
              <div>
                <span>Chất liệu:</span>
                <strong>{product.material || "Gỗ tự nhiên"}</strong>
              </div>
              <div>
                <span>Kích thước:</span>
                <strong>{product.dimensions || "Tiêu chuẩn"}</strong>
              </div>
              <div>
                <span>Bảo hành:</span>
                <strong>{product.warranty || "3 năm"}</strong>
              </div>
              <div>
                <span>Tình trạng:</span>
                <strong style={{ color: "#27ae60" }}>
                  {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                </strong>
              </div>
            </div>

            <div className="quick-view-actions">
              <div className="qty-picker">
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="qty-value">{qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => q + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="detail-add-cart-btn"
                onClick={(e) => {
                  onAddToCart(e, product, qty);
                  onClose();
                }}
              >
                <ShoppingBag size={18} />
                <span>Thêm vào giỏ</span>
              </button>

              <button
                className="section-explore-btn"
                onClick={() => {
                  onOpenDetail(product);
                  onClose();
                }}
              >
                <span>Chi tiết</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
