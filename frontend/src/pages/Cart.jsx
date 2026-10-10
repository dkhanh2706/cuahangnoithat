import { useState } from "react";
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
} from "lucide-react";
import { useCart } from "../context/CartContext";
import "../styles/Cart.css";

function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, showToast } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderCode, setOrderCode] = useState("");

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "FURNI10") {
      setDiscountPercent(0.1);
      showToast("Áp dụng thành công mã FURNI10: Giảm 10%!", "success");
    } else {
      showToast("Mã ưu đãi không hợp lệ. Hãy thử: FURNI10", "info");
    }
  };

  const freeShippingThreshold = 2000000;
  const isFreeShipping = cartTotal >= freeShippingThreshold || cartTotal === 0;
  const shippingFee = isFreeShipping ? 0 : 150000;
  const discountAmount = cartTotal * discountPercent;
  const finalTotal = cartTotal - discountAmount + shippingFee;

  const handleCheckout = () => {
    const generatedCode = "FH-" + Math.floor(100000 + Math.random() * 900000);
    setOrderCode(generatedCode);
    setOrderModalOpen(true);
  };

  const handleFinishOrder = () => {
    setOrderModalOpen(false);
    clearCart();
    navigate("/");
  };

  if (cart.length === 0 && !orderModalOpen) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="empty-cart-view">
            <div className="empty-cart-icon">
              <ShoppingBag size={36} />
            </div>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy khám phá các thiết kế nội thất mới nhất và thêm sản phẩm yêu thích vào giỏ hàng.</p>
            <Link to="/products" className="continue-shopping-btn">
              <span>Khám phá sản phẩm ngay</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1>Giỏ hàng của bạn</h1>
            <p>Bạn đang có {cart.length} sản phẩm nội thất trong giỏ hàng</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link to="/products" style={{ fontSize: "13px", color: "#1e3428", fontWeight: "600", textDecoration: "underline" }}>
              + Tiếp tục mua sắm
            </Link>
            <button
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
                  clearCart();
                  showToast("Đã xóa toàn bộ sản phẩm khỏi giỏ hàng.", "info");
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "#c0392b",
                fontWeight: "500",
                background: "#fdf2f2",
                padding: "6px 12px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={14} /> Xóa tất cả
            </button>
          </div>
        </div>

        {/* FREE SHIPPING PROGRESS NOTICE */}
        <div style={{
          background: isFreeShipping ? "#f0fbf4" : "#fbf7ed",
          border: `1px solid ${isFreeShipping ? "#c8edd5" : "#ede2cc"}`,
          borderRadius: "12px",
          padding: "12px 18px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "13.5px",
          color: isFreeShipping ? "#27ae60" : "#a87d46",
        }}>
          <Truck size={18} />
          <span>
            {isFreeShipping ? (
              <strong>Tuyệt vời! Đơn hàng của bạn đã đủ điều kiện MIỄN PHÍ VẬN CHUYỂN toàn quốc.</strong>
            ) : (
              <>
                Mua thêm <strong>{Number(freeShippingThreshold - cartTotal).toLocaleString("vi-VN")}₫</strong> để được <strong>Miễn phí vận chuyển</strong> (tiết kiệm 150.000₫).
              </>
            )}
          </span>
        </div>

        <div className="cart-layout">
          {/* ITEMS LIST */}
          <div className="cart-items-box">
            {cart.map((item) => {
              const p = item.product;
              const imgUrl =
                p.primary_image ||
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80";

              return (
                <div key={item.id} className="cart-item-card">
                  <div className="cart-item-img" onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: "pointer" }}>
                    <img src={imgUrl} alt={p.name} />
                  </div>

                  <div className="cart-item-details">
                    <h4
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/products/${p.id}`)}
                    >
                      {p.name}
                    </h4>
                    <p className="cart-item-material">
                      {p.material || "Nội thất cao cấp"} {p.dimensions ? `• ${p.dimensions}` : ""}
                    </p>
                    <span className="cart-item-price">
                      {Number(p.price).toLocaleString("vi-VN")}₫
                    </span>
                  </div>

                  <div className="cart-item-qty">
                    <button
                      onClick={() => updateQuantity(p.id, -1)}
                      title="Giảm 1"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(p.id, 1)}
                      title="Tăng 1"
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    {Number(p.price * item.quantity).toLocaleString("vi-VN")}₫
                  </div>

                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(p.id)}
                    title="Xóa sản phẩm này"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="cart-summary-box">
            <h3>Tóm tắt đơn hàng</h3>

            {/* PROMO VOUCHER */}
            <form onSubmit={handleApplyPromo} className="promo-box">
              <input
                type="text"
                placeholder="Mã giảm giá (Thử: FURNI10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button type="submit" className="promo-apply-btn">
                Áp dụng
              </button>
            </form>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Tạm tính ({cart.length} sản phẩm)</span>
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
                  <span>Ưu đãi voucher (10%)</span>
                  <span>-{Number(discountAmount).toLocaleString("vi-VN")}₫</span>
                </div>
              )}
            </div>

            <div className="summary-total-row">
              <span>Tổng thanh toán</span>
              <strong>{Number(finalTotal).toLocaleString("vi-VN")}₫</strong>
            </div>

            <button className="checkout-btn" onClick={handleCheckout}>
              <PackageCheck size={18} />
              <span>Tiến hành đặt hàng ngay</span>
            </button>

            <div style={{ marginTop: "18px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#7a877e", fontSize: "12px" }}>
              <ShieldCheck size={15} color="#27ae60" />
              <span>Bảo mật thanh toán & Bảo hành 5 năm tại nhà</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT SUCCESS MODAL */}
      {orderModalOpen && (
        <div className="order-success-modal-overlay">
          <div className="order-success-box">
            <div className="success-check-icon">
              <CheckCircle2 size={42} />
            </div>
            <h2>Đặt hàng thành công!</h2>
            <p>
              Cảm ơn quý khách đã tin tưởng FurniHome. Mã đơn hàng của quý khách là{" "}
              <strong style={{ color: "#1e3428" }}>{orderCode}</strong>. Nhân viên chăm sóc khách hàng sẽ liên hệ xác nhận trong vòng 15 phút.
            </p>
            <button className="continue-shopping-btn" onClick={handleFinishOrder}>
              Quay lại trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
