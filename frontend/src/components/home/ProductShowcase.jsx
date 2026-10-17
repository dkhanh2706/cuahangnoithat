import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import "../../styles/home/ProductShowcase.css";

function ProductShowcase({ products = [], loading = false }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  const [tab, setTab] = useState("all");
  const [addedIds, setAddedIds] = useState([]);

  const displayProducts = useMemo(() => {
    let list = [...products];

    if (tab === "new") {
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (tab === "best") {
      list.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    } else if (tab === "sale") {
      list = list.filter((p) => p.original_price || p.badge?.includes("%"));
    }

    return list.slice(0, 8);
  }, [products, tab]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);

    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  const handleWishlist = (e, product) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const getImageUrl = (product) => {
    if (product.primary_image) {
      if (product.primary_image.startsWith("http")) {
        return product.primary_image;
      }
      return `http://127.0.0.1:8000${product.primary_image}`;
    }
    return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";
  };

  return (
    <section className="product-showcase-section" id="products-home">
      <div className="product-showcase-heading">
        <div>
          <span className="showcase-eyebrow">
            <Sparkles size={14} /> SẢN PHẨM NỔI BẬT
          </span>
          <h2>Những tuyệt tác nội thất cho ngôi nhà.</h2>
        </div>

        {/* Filter Tabs */}
        <div className="showcase-tabs">
          <button
            className={tab === "all" ? "active" : ""}
            onClick={() => setTab("all")}
          >
            Tất cả
          </button>
          <button
            className={tab === "best" ? "active" : ""}
            onClick={() => setTab("best")}
          >
            Bán chạy
          </button>
          <button
            className={tab === "new" ? "active" : ""}
            onClick={() => setTab("new")}
          >
            Mới nhất
          </button>
          <button
            className={tab === "sale" ? "active" : ""}
            onClick={() => setTab("sale")}
          >
            Ưu đãi
          </button>
        </div>
      </div>

      {loading ? (
        <div className="showcase-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="showcase-card skeleton-card">
              <div className="skeleton-image shimmer-loading" />
              <div className="skeleton-info">
                <div
                  className="skeleton-line shimmer-loading"
                  style={{ width: "40%" }}
                />
                <div
                  className="skeleton-line shimmer-loading"
                  style={{ width: "80%" }}
                />
                <div
                  className="skeleton-line shimmer-loading"
                  style={{ width: "50%" }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="showcase-empty">
          <p>Chưa có sản phẩm nào trong mục này.</p>
        </div>
      ) : (
        <div className="showcase-grid">
          {displayProducts.map((product) => {
            const isFav = isWishlisted(product.id);
            const isJustAdded = addedIds.includes(product.id);

            return (
              <article
                className="showcase-card"
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="showcase-image">
                  <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";
                    }}
                  />

                  {/* Badges */}
                  {product.badge && (
                    <div className="showcase-badge">
                      <span>{product.badge}</span>
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button
                    className={`wishlist-btn ${isFav ? "active" : ""}`}
                    onClick={(e) => handleWishlist(e, product)}
                    aria-label="Yêu thích"
                    title={isFav ? "Đã lưu yêu thích" : "Lưu vào yêu thích"}
                  >
                    <Heart
                      size={18}
                      fill={isFav ? "#e74c3c" : "none"}
                      color={isFav ? "#e74c3c" : "#3c473f"}
                    />
                  </button>

                  {/* Quick Add To Cart Hover Button */}
                  <button
                    className={`quick-add-btn ${isJustAdded ? "added" : ""}`}
                    onClick={(e) => handleAddToCart(e, product)}
                    title="Thêm vào giỏ hàng"
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

                <div className="showcase-info">
                  <div className="showcase-meta">
                    <span className="showcase-material">
                      {product.material || "Nội thất cao cấp"}
                    </span>
                  </div>

                  <h3 className="showcase-title">{product.name}</h3>

                  <div className="showcase-price-row">
                    <div className="price-box">
                      <strong className="current-price">
                        {Number(product.price).toLocaleString("vi-VN")}₫
                      </strong>
                      {product.original_price && (
                        <span className="original-price">
                          {Number(product.original_price).toLocaleString("vi-VN")}₫
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* View All Button */}
      <div className="showcase-footer">
        <button
          className="showcase-view-all"
          onClick={() => navigate("/products")}
        >
          <span>Xem tất cả danh mục sản phẩm</span>
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}

export default ProductShowcase;
