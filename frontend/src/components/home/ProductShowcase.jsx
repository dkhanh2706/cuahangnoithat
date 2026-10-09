import { useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import "../../styles/home/ProductShowcase.css";

function ProductShowcase({ products, loading }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState("new");

  const token = localStorage.getItem("access_token");

  const displayProducts = useMemo(() => {
    const data = [...products];

    if (tab === "new") {
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (tab === "best") {
      data.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    }

    return data.slice(0, 8);
  }, [products, tab]);

  const requireLogin = () => {
    navigate("/login", {
      state: {
        from: location.pathname,
      },
    });
  };

  const handleAddCart = (event, product) => {
    event.stopPropagation();

    if (!token) {
      requireLogin();
      return;
    }

    console.log("Thêm giỏ hàng:", product);

    navigate("/cart");
  };

  const handleWishlist = (event, product) => {
    event.stopPropagation();

    if (!token) {
      requireLogin();
      return;
    }

    console.log("Yêu thích:", product);
  };

  return (
    <section className="product-showcase-section" id="products-home">
      <div className="product-showcase-heading">
        <div>
          <span>SẢN PHẨM</span>

          <h2>Những lựa chọn dành cho ngôi nhà.</h2>
        </div>

        <div className="showcase-tabs">
          <button
            className={tab === "new" ? "active" : ""}
            onClick={() => setTab("new")}
          >
            Mới nhất
          </button>

          <button
            className={tab === "best" ? "active" : ""}
            onClick={() => setTab("best")}
          >
            Bán chạy
          </button>
        </div>
      </div>

      {loading ? (
        <div className="showcase-loading">Đang tải sản phẩm...</div>
      ) : displayProducts.length === 0 ? (
        <div className="showcase-loading">Chưa có sản phẩm.</div>
      ) : (
        <div className="showcase-grid">
          {displayProducts.map((product) => (
            <article
              className="showcase-card"
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="showcase-image">
                {product.primary_image ? (
                  <img
                    src={`http://127.0.0.1:8000${product.primary_image}`}
                    alt={product.name}
                  />
                ) : (
                  <div className="showcase-placeholder">
                    {product.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                <button
                  className="wishlist-btn"
                  onClick={(event) => handleWishlist(event, product)}
                  aria-label="Yêu thích"
                >
                  ♡
                </button>
              </div>

              <div className="showcase-info">
                <p>{product.material || "Nội thất"}</p>

                <h3>{product.name}</h3>

                <div className="showcase-bottom">
                  <strong>
                    {Number(product.price).toLocaleString("vi-VN")}₫
                  </strong>

                  <button
                    onClick={(event) => handleAddCart(event, product)}
                    title="Thêm vào giỏ"
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <button
        className="showcase-view-all"
        onClick={() => navigate("/products")}
      >
        Xem tất cả sản phẩm
        <span>→</span>
      </button>
    </section>
  );
}

export default ProductShowcase;
