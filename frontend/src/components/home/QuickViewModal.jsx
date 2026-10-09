import "../../styles/home/QuickViewModal.css";

function QuickViewModal({ product, onClose, onAddToCart }) {
  if (!product) {
    return null;
  }

  const price = Number(product.price || 0).toLocaleString("vi-VN");

  return (
    <div className="quick-view-backdrop" onClick={onClose}>
      <div
        className="quick-view-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="quick-view-close" onClick={onClose}>
          ×
        </button>

        <div className="quick-view-image">
          {product.primary_image ? (
            <img
              src={`http://127.0.0.1:8000${product.primary_image}`}
              alt={product.name}
            />
          ) : (
            <div className="quick-view-placeholder">
              {product.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="quick-view-info">
          <span className="quick-view-label">SẢN PHẨM</span>

          <h2>{product.name}</h2>

          <strong className="quick-view-price">{price}₫</strong>

          <p className="quick-view-description">
            {product.description ||
              "Sản phẩm nội thất dành cho không gian sống hiện đại."}
          </p>

          <div className="quick-view-details">
            {product.material && (
              <div>
                <span>Chất liệu</span>
                <strong>{product.material}</strong>
              </div>
            )}

            {product.color && (
              <div>
                <span>Màu sắc</span>
                <strong>{product.color}</strong>
              </div>
            )}

            {product.dimensions && (
              <div>
                <span>Kích thước</span>
                <strong>{product.dimensions}</strong>
              </div>
            )}
          </div>

          <button
            className="quick-view-cart-btn"
            onClick={() => onAddToCart(product)}
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
