import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  Truck,
  ShieldCheck,
  Tag,
  Gift,
  ChevronRight,
  Plus,
  Minus,
  Heart,
  Star,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import "../styles/Cart.css";

const TRUST_BADGES = [
  { icon: Truck, label: "Miễn phí vận chuyển", sub: "Đơn từ 2.000.000₫" },
  { icon: ShieldCheck, label: "Bảo hành 5 năm", sub: "Tại nhà toàn quốc" },
  { icon: Gift, label: "Đổi trả 30 ngày", sub: "Không điều kiện" },
  { icon: Star, label: "Chất lượng cao cấp", sub: "Kiểm định nghiêm ngặt" },
];

function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, showToast, toggleWishlist, isWishlisted } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const checkoutLock = useRef(false);
  const [shipping, setShipping] = useState({ receiver_name: "", receiver_phone: "", shipping_address: "" });
  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "FURNI10") {
      setDiscountPercent(0.1);
      showToast("Áp dụng thành công mã FURNI10: Giảm 10%!", "success");
    } else if (promoCode.trim().toUpperCase() === "FURNI20") {
      setDiscountPercent(0.2);
      showToast("Áp dụng thành công mã FURNI20: Giảm 20%!", "success");
    } else {
      showToast("Mã ưu đãi không hợp lệ. Thử: FURNI10 hoặc FURNI20", "info");
    }
  };

  const freeShippingThreshold = 2000000;
  const isFreeShipping = cartTotal >= freeShippingThreshold || cartTotal === 0;
  const shippingFee = isFreeShipping ? 0 : 150000;
  const discountAmount = cartTotal * discountPercent;
  const finalTotal = cartTotal - discountAmount + shippingFee;
  const progressPercent = Math.min((cartTotal / freeShippingThreshold) * 100, 100);

  const handleCheckout = async (event) => {
    event.preventDefault();
    if (checkoutLock.current || orderModalOpen || cart.length === 0) return;
    if (!localStorage.getItem("access_token")) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    checkoutLock.current = true;
    setCheckingOut(true);
    try {
      const { data } = await api.post("/api/orders/demo", {
        ...shipping,
        items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
        promo_code: discountPercent ? (discountPercent === 0.1 ? "FURNI10" : "FURNI20") : "",
      });
      setOrderCode(data.code);
      setOrderModalOpen(true);
      clearCart();
      navigate("/orders", { state: { checkoutSuccess: true } });
    } catch (err) {
      showToast(typeof err.response?.data?.detail === "string" ? err.response.data.detail : "Không thể thanh toán. Vui lòng thử lại.", "error");
    } finally {
      checkoutLock.current = false;
      setCheckingOut(false);
    }
  };

  const handleFinishOrder = () => {
    setOrderModalOpen(false);
    clearCart();
    navigate("/");
  };

  // EMPTY CART STATE
  if (cart.length === 0 && !orderModalOpen) {
    return (
      <div className="cart-page">
        {/* Page Hero */}
        <div className="cart-hero">
          <div className="cart-hero-content">
            <div className="cart-breadcrumb">
              <Link to="/">Trang chủ</Link>
              <ChevronRight size={14} />
              <span>Giỏ hàng</span>
            </div>
            <h1>Giỏ hàng</h1>
          </div>
        </div>

        <div className="cart-container">
          <div className="empty-cart-view">
            <div className="empty-cart-icon">
              <ShoppingBag size={40} />
            </div>
            <h2>Giỏ hàng đang trống</h2>
            <p>Khám phá bộ sưu tập nội thất cao cấp của FurniHome và thêm những sản phẩm yêu thích vào giỏ hàng của bạn.</p>
            <Link to="/products" className="empty-cart-cta">
              <ArrowLeft size={16} />
              <span>Khám phá sản phẩm</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="cart-trust-row">
            {TRUST_BADGES.map((b, i) => (
              <div key={i} className="cart-trust-badge">
                <b.icon size={22} className="trust-icon" />
                <div>
                  <strong>{b.label}</strong>
                  <span>{b.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* PAGE HERO HEADER */}
      <div className="cart-hero">
        <div className="cart-hero-content">
          <div className="cart-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link to="/products">Sản phẩm</Link>
            <ChevronRight size={14} />
            <span>Giỏ hàng</span>
          </div>
          <div className="cart-hero-row">
            <div>
              <h1>Giỏ hàng của bạn</h1>
              <p>{cart.length} sản phẩm đang chờ thanh toán</p>
            </div>
            <div className="cart-hero-actions">
              <Link to="/products" className="back-to-shop-btn">
                <ArrowLeft size={15} />
                <span>Mua thêm</span>
              </Link>
              <button
                className="clear-all-btn"
                onClick={() => {
                  if (window.confirm("Xóa toàn bộ giỏ hàng?")) {
                    clearCart();
                    showToast("Đã xóa toàn bộ sản phẩm.", "info");
                  }
                }}
              >
                <RotateCcw size={14} />
                <span>Xóa tất cả</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="cart-container">
        {/* FREE SHIPPING PROGRESS BAR */}
        <div className={`shipping-progress-bar ${isFreeShipping ? "done" : ""}`}>
          <div className="shipping-bar-top">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Truck size={17} />
              {isFreeShipping ? (
                <strong>🎉 Đơn hàng đã đủ điều kiện MIỄN PHÍ vận chuyển!</strong>
              ) : (
                <span>
                  Mua thêm <strong>{Number(freeShippingThreshold - cartTotal).toLocaleString("vi-VN")}₫</strong> để được miễn phí vận chuyển
                </span>
              )}
            </div>
            <span className="shipping-threshold-label">
              {isFreeShipping ? "Miễn phí" : "150.000₫"}
            </span>
          </div>
          <div className="shipping-bar-track">
            <div className="shipping-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* MAIN CART LAYOUT */}
        <div className="cart-layout">
          {/* LEFT: ITEMS LIST */}
          <div className="cart-items-box">
            <div className="cart-items-header">
              <span>Sản phẩm</span>
              <span className="items-header-right">
                <span>Số lượng</span>
                <span>Thành tiền</span>
              </span>
            </div>

            {cart.map((item) => {
              const p = item.product;
              const imgUrl =
                p.primary_image ||
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80";
              const isFav = isWishlisted?.(p.id);

              return (
                <div key={item.id} className="cart-item-card">
                  {/* Product Image */}
                  <div
                    className="cart-item-img"
                    onClick={() => navigate(`/products/${p.id}`)}
                  >
                    <img src={imgUrl} alt={p.name} />
                    {p.badge && (
                      <span className="cart-item-badge">{p.badge}</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="cart-item-details">
                    <div className="cart-item-meta">
                      {p.room_name && (
                        <span className="cart-item-room">{p.room_name}</span>
                      )}
                    </div>
                    <h4
                      className="cart-item-name"
                      onClick={() => navigate(`/products/${p.id}`)}
                    >
                      {p.name}
                    </h4>
                    <p className="cart-item-material">
                      {p.material || "Nội thất cao cấp"}
                      {p.color && ` • ${p.color}`}
                    </p>
                    <span className="cart-item-unit-price">
                      {Number(p.price).toLocaleString("vi-VN")}₫ / sản phẩm
                    </span>

                    {/* Mobile: qty + subtotal */}
                    <div className="cart-item-mobile-row">
                      <div className="cart-item-qty">
                        <button
                          onClick={() => updateQuantity(p.id, -1)}
                          aria-label="Giảm 1"
                        >
                          <Minus size={13} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(p.id, 1)}
                          aria-label="Tăng 1"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <strong className="cart-item-subtotal-mobile">
                        {Number(p.price * item.quantity).toLocaleString("vi-VN")}₫
                      </strong>
                    </div>

                    {/* Action Row */}
                    <div className="cart-item-actions">
                      {toggleWishlist && (
                        <button
                          className={`cart-wishlist-btn ${isFav ? "active" : ""}`}
                          onClick={() => toggleWishlist(p)}
                        >
                          <Heart
                            size={14}
                            fill={isFav ? "#e74c3c" : "none"}
                            color={isFav ? "#e74c3c" : "#9ba49d"}
                          />
                          {isFav ? "Đã yêu thích" : "Yêu thích"}
                        </button>
                      )}
                      <button
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(p.id)}
                      >
                        <Trash2 size={14} />
                        Xóa
                      </button>
                    </div>
                  </div>

                  {/* Desktop: Qty control */}
                  <div className="cart-item-qty cart-item-qty-desktop">
                    <button
                      onClick={() => updateQuantity(p.id, -1)}
                      aria-label="Giảm 1"
                    >
                      <Minus size={13} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(p.id, 1)}
                      aria-label="Tăng 1"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Desktop: Subtotal */}
                  <div className="cart-item-subtotal">
                    <strong>{Number(p.price * item.quantity).toLocaleString("vi-VN")}₫</strong>
                    {p.original_price && (
                      <span className="cart-item-original">
                        {Number(p.original_price * item.quantity).toLocaleString("vi-VN")}₫
                      </span>
                    )}
                  </div>

                  {/* Desktop: Remove */}
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(p.id)}
                    title="Xóa sản phẩm"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="cart-summary-box">
            <h3>Tóm tắt đơn hàng</h3>

            {/* PROMO CODE */}
            <form onSubmit={handleApplyPromo} className="promo-box">
              <div className="promo-input-wrap">
                <Tag size={15} className="promo-icon" />
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá..."
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>
              <button type="submit" className="promo-apply-btn">
                Áp dụng
              </button>
            </form>
            <p className="promo-hint">Thử mã: <code>FURNI10</code> hoặc <code>FURNI20</code></p>

            {/* SUMMARY ROWS */}
            <div className="summary-rows">
              <div className="summary-row">
                <span>Tạm tính ({cart.length} sp)</span>
                <strong>{Number(cartTotal).toLocaleString("vi-VN")}₫</strong>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong style={{ color: "#27ae60" }}>Miễn phí</strong>
                  ) : (
                    `${Number(shippingFee).toLocaleString("vi-VN")}₫`
                  )}
                </span>
              </div>

              {discountPercent > 0 && (
                <div className="summary-row discount">
                  <span>Voucher ({(discountPercent * 100).toFixed(0)}%)</span>
                  <span>−{Number(discountAmount).toLocaleString("vi-VN")}₫</span>
                </div>
              )}
            </div>

            <div className="summary-total-row">
              <span>Tổng thanh toán</span>
              <strong>{Number(finalTotal).toLocaleString("vi-VN")}₫</strong>
            </div>

            {discountPercent > 0 && (
              <div className="summary-saving-note">
                🎉 Bạn tiết kiệm được{" "}
                <strong>{Number(discountAmount).toLocaleString("vi-VN")}₫</strong>
              </div>
            )}

            <form className="checkout-shipping-form" onSubmit={handleCheckout}>
              <h4>Thông tin nhận hàng</h4>
              <label>Họ tên<input required maxLength={100} autoComplete="name" value={shipping.receiver_name} onChange={e => setShipping({ ...shipping, receiver_name: e.target.value })} disabled={checkingOut} /></label>
              <label>Số điện thoại<input required type="tel" maxLength={20} autoComplete="tel" value={shipping.receiver_phone} onChange={e => setShipping({ ...shipping, receiver_phone: e.target.value })} disabled={checkingOut} /></label>
              <label>Địa chỉ nhận hàng<textarea required maxLength={2000} autoComplete="street-address" value={shipping.shipping_address} onChange={e => setShipping({ ...shipping, shipping_address: e.target.value })} disabled={checkingOut} /></label>
            <p>Thanh toán giả lập: không thu tiền, lưu đơn để xem lịch sử và đánh giá.</p>
            <button className="checkout-btn" type="submit" disabled={orderModalOpen || checkingOut}>
              <PackageCheck size={18} />
              <span>{checkingOut ? "Đang xử lý..." : "Thanh toán giả lập"}</span>
              <ArrowRight size={16} />
            </button>
            </form>

            {/* Trust micro-badges */}
            <div className="summary-trust-mini">
              <div className="trust-mini-item">
                <ShieldCheck size={14} color="#27ae60" />
                <span>Thanh toán bảo mật SSL</span>
              </div>
              <div className="trust-mini-item">
                <Truck size={14} color="#1e3428" />
                <span>Giao hàng toàn quốc</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRUST BADGES ROW */}
        <div className="cart-trust-row">
          {TRUST_BADGES.map((b, i) => (
            <div key={i} className="cart-trust-badge">
              <b.icon size={22} className="trust-icon" />
              <div>
                <strong>{b.label}</strong>
                <span>{b.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ORDER SUCCESS MODAL */}
      {orderModalOpen && (
        <div className="order-success-modal-overlay">
          <div className="order-success-box">
            <div className="success-check-icon">
              <CheckCircle2 size={44} />
            </div>
            <h2>Đặt hàng thành công!</h2>
            <p>
              Cảm ơn quý khách đã tin tưởng FurniHome. Mã đơn hàng:{" "}
              <strong className="order-code-text">{orderCode}</strong>
              <br />Thanh toán giả lập thành công. Đơn đã được lưu vào lịch sử, không thu tiền thật.
            </p>
            <div className="success-modal-actions">
              <Link to="/orders" className="success-shop-btn" onClick={() => setOrderModalOpen(false)}>
                Xem lịch sử và đánh giá
              </Link>
              <button className="success-home-btn" onClick={handleFinishOrder}>
                Về trang chủ
              </button>
              <Link to="/products" className="success-shop-btn" onClick={() => { clearCart(); setOrderModalOpen(false); }}>
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
