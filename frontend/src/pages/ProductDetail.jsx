import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { productImageUrl } from "../services/media";
import "../styles/ProductDetail.css";
import "../styles/home/ProductShowcase.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setQuantity(1);

    const loadProduct = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const res = await api.get(`/api/products/${id}`);
        const p = res.data;

        // Try getting images
        try {
          const imgRes = await api.get(`/api/products/${id}/images`);
          const imgs = imgRes.data.map((i) =>
            i.image_url.startsWith("http")
              ? i.image_url
              : `http://127.0.0.1:8000${i.image_url}`
          );
          setProduct({ ...p, images: imgs });
          setSelectedImage(imgs[0] || "");
        } catch {
          setProduct(p);
          setSelectedImage(p.primary_image || "");
        }
      } catch (err) {
        setProduct(null);
        setSelectedImage("");
        setLoadError(err.response?.status === 404 ? "Sản phẩm không còn tồn tại." : "Không thể tải sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    let active = true;
    api.get("/api/products").then(async ({ data }) => {
      const items = await Promise.all(data.filter(p => String(p.id) !== String(id)).slice(0, 4).map(async p => {
        try {
          const { data: images } = await api.get(`/api/products/${p.id}/images`);
          return { ...p, primary_image: productImageUrl((images.find(image => image.is_primary) || images[0])?.image_url) };
        } catch { return { ...p, primary_image: null }; }
      }));
      if (active) setRelated(items);
    }).catch(() => { if (active) setRelated([]); });
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="detail-container" style={{ padding: "80px 0" }}>
        <div className="skeleton-image shimmer-loading" style={{ height: "450px" }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="detail-container" style={{ padding: "80px 0", textAlign: "center" }}>
        <h2>Không tìm thấy sản phẩm</h2>
        {loadError && <p role="alert">{loadError}</p>}
        <Link to="/products" className="reset-filter-btn" style={{ marginTop: "20px", display: "inline-block" }}>
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const isFav = isWishlisted(product.id);
  const images = product.images && product.images.length > 0 ? product.images : [selectedImage];

  return (
    <div className="product-detail-page">
      <div className="detail-container">
        {/* BREADCRUMBS */}
        <div className="detail-breadcrumbs">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/products">Sản phẩm</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        {/* MAIN GRID */}
        <div className="detail-main-grid">
          {/* GALLERY */}
          <div className="detail-gallery">
            <div className="main-image-frame">
              <img src={selectedImage} alt={product.name} />
              {product.badge && (
                <div className="detail-badge-pill">
                  <span>{product.badge}</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="thumbnail-row">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail-btn ${selectedImage === img ? "active" : ""}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS INFO */}
          <div className="detail-info-col">
            <span className="detail-cat-tag">
              {product.category_name || "Nội thất gia đình cao cấp"}
            </span>
            <h1 className="detail-title">{product.name}</h1>

            <div className="detail-rating-row">
              <Link to="/reviews">Xem đánh giá cửa hàng</Link>
              <span>•</span>
              <span className="in-stock-tag">Còn hàng</span>
            </div>

            {/* PRICE */}
            <div className="detail-price-box">
              <strong className="detail-price-current">
                {Number(product.price).toLocaleString("vi-VN")}₫
              </strong>
              {product.original_price && (
                <>
                  <span className="detail-price-original">
                    {Number(product.original_price).toLocaleString("vi-VN")}₫
                  </span>
                  <span className="discount-tag">Giảm giá</span>
                </>
              )}
            </div>

            {/* SPECS */}
            <div className="detail-specs-grid">
              <div className="spec-item">
                <span>Chất liệu chính</span>
                <strong>{product.material || "Gỗ sồi tự nhiên"}</strong>
              </div>
              <div className="spec-item">
                <span>Kích thước tiêu chuẩn</span>
                <strong>{product.dimensions || "D180 x R80 x C75 cm"}</strong>
              </div>
              <div className="spec-item">
                <span>Thời gian bảo hành</span>
                <strong>{product.warranty || "3 năm chính hãng"}</strong>
              </div>
              <div className="spec-item">
                <span>Xuất xứ & Thiết kế</span>
                <strong>FurniHome Design (Scandinavia)</strong>
              </div>
            </div>

            <p style={{ color: "#59665d", fontSize: "14.5px", lineHeight: "1.7", marginBottom: "20px" }}>
              {product.description ||
                "Thiết kế tinh tế mang hơi thở đương đại, vừa tôn vinh vẻ đẹp mộc mạc của vân gỗ tự nhiên, vừa mang lại sự thoải mái trọn vẹn cho gia chủ."}
            </p>

            {/* ACTIONS */}
            <div className="detail-actions-row">
              <div className="qty-picker">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="detail-add-cart-btn"
                onClick={() => addToCart(product, quantity)}
              >
                <ShoppingBag size={18} />
                <span>Thêm vào giỏ ({Number(product.price * quantity).toLocaleString("vi-VN")}₫)</span>
              </button>

              <button
                className="detail-wishlist-btn"
                onClick={() => toggleWishlist(product)}
                title="Lưu yêu thích"
              >
                <Heart
                  size={20}
                  fill={isFav ? "#e74c3c" : "none"}
                  color={isFav ? "#e74c3c" : "#2d3830"}
                />
              </button>
            </div>

            {/* PERKS */}
            <div className="detail-perks-box">
              <div className="detail-perk">
                <Truck size={17} />
                <span>Miễn phí vận chuyển & lắp đặt tận phòng cho đơn từ 2.000.000₫</span>
              </div>
              <div className="detail-perk">
                <ShieldCheck size={17} />
                <span>Bảo hành chính hãng 5 năm, hỗ trợ bảo dưỡng định kỳ</span>
              </div>
              <div className="detail-perk">
                <RotateCcw size={17} />
                <span>30 ngày đổi trả miễn phí nếu sản phẩm có lỗi kỹ thuật</span>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <section className="detail-related-section">
          <h2>Sản phẩm cùng phong cách thiết kế</h2>
          <div className="showcase-grid">
            {related.map((item) => (
              <article
                className="showcase-card"
                key={item.id}
                onClick={() => navigate(`/products/${item.id}`)}
              >
                <div className="showcase-image">
                  <img src={item.primary_image} alt={item.name} loading="lazy" />
                  <button
                    className="quick-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item, 1);
                    }}
                  >
                    <ShoppingBag size={16} /> Thêm vào giỏ
                  </button>
                </div>
                <div className="showcase-info">
                  <span style={{ fontSize: "11px", color: "#888" }}>{item.material}</span>
                  <h3 className="showcase-title">{item.name}</h3>
                  <strong className="current-price">
                    {Number(item.price).toLocaleString("vi-VN")}₫
                  </strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProductDetail;
