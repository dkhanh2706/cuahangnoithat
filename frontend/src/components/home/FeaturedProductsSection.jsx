import { useMemo, useState } from "react";

import QuickViewModal from "./QuickViewModal";

import "../../styles/home/FeaturedProductsSection.css";

const tabs = [
  {
    key: "new",
    label: "Mới nhất",
  },
  {
    key: "best",
    label: "Bán chạy",
  },
  {
    key: "sale",
    label: "Giảm giá",
  },
];

function FeaturedProductsSection({ products, onAddToCart }) {
  const [activeTab, setActiveTab] = useState("new");

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const displayedProducts = useMemo(() => {
    const data = [...products];

    if (activeTab === "new") {
      return data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8);
    }

    if (activeTab === "best") {
      return data
        .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
        .slice(0, 8);
    }

    if (activeTab === "sale") {
      return data
        .filter((product) => Number(product.discount_percent || 0) > 0)
        .slice(0, 8);
    }

    return data.slice(0, 8);
  }, [products, activeTab]);

  return (
    <section className="featured-section">
      <div className="featured-heading">
        <div>
          <p>SẢN PHẨM</p>

          <h2>Lựa chọn dành cho bạn</h2>
        </div>

        <div className="product-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "active" : ""}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {displayedProducts.length > 0 ? (
        <div className="featured-grid">
          {displayedProducts.map((product) => (
            <article className="featured-card" key={product.id}>
              <div className="featured-image">
                {product.primary_image ? (
                  <img
                    src={`http://127.0.0.1:8000${product.primary_image}`}
                    alt={product.name}
                  />
                ) : (
                  <div className="featured-placeholder">
                    {product.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                <button
                  className="quick-view-button"
                  onClick={() => setQuickViewProduct(product)}
                >
                  Xem nhanh
                </button>
              </div>

              <div className="featured-info">
                <h3>{product.name}</h3>

                <p>{product.material || "Nội thất cao cấp"}</p>

                <div className="featured-bottom">
                  <strong>
                    {Number(product.price).toLocaleString("vi-VN")}₫
                  </strong>

                  <button onClick={() => onAddToCart(product)}>+ Giỏ</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="featured-empty">
          {activeTab === "sale"
            ? "Hiện chưa có sản phẩm giảm giá."
            : "Chưa có sản phẩm."}
        </div>
      )}

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={onAddToCart}
      />
    </section>
  );
}

export default FeaturedProductsSection;
