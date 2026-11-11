import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  Phone,
  Mail,
  MapPin,
  ArrowUp,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "../styles/Footer.css";
import "../styles/Policies.css";
import api from "../services/api";

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
    </svg>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (busy || !consent) return;
    setBusy(true); setFeedback(""); setFailed(false);
    try {
      const { data } = await api.post("/api/newsletter/subscriptions", { email: email.trim(), consent });
      setSubscribed(true);
      setFeedback(data.message);
      setEmail("");
    } catch (failure) {
      setFailed(true);
      setFeedback(typeof failure.response?.data?.detail === "string" ? failure.response.data.detail : "Chưa đăng ký được. Vui lòng kiểm tra email và thử lại.");
    } finally { setBusy(false); }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="main-footer">
      {/* NEWSLETTER BANNER */}
      <div className="newsletter-banner">
        <div className="newsletter-container">
          <div className="newsletter-text">
            <span className="newsletter-eyebrow">
              <Sparkles size={14} /> BẢN TIN NỘI THẤT
            </span>
            <h3>Đăng ký nhận cẩm nang không gian sống & ưu đãi 10%</h3>
            <p>
              Cập nhật sớm nhất các bộ sưu tập mới, mẹo bài trí nhà cửa phong cách Bắc Âu và các chương trình ưu đãi mới nhất.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input
              type="email"
              maxLength={254}
              aria-label="Email đăng ký nhận tin"
              disabled={busy}
              placeholder="Nhập địa chỉ email của bạn..."
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSubscribed(false); setFeedback(""); }}
              required
            />
            <button type="submit" className="newsletter-submit-btn" disabled={busy || !consent}>
              <span>{busy ? "Đang lưu..." : subscribed ? "Đã đăng ký!" : "Đăng ký ngay"}</span>
              <Send size={15} />
            </button>
            <label className="newsletter-consent"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} disabled={busy} /><span>Tôi đồng ý để CHNT lưu email liên hệ theo <Link to="/policies/privacy">chính sách thông tin</Link>.</span></label>
            {feedback && <p className="newsletter-feedback" role={failed ? "alert" : "status"}>{feedback}</p>}
          </form>
        </div>
      </div>

      {/* MAIN FOOTER COLUMNS */}
      <div className="footer-container">
        {/* BRAND INFO */}
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo">
            <div className="footer-logo-badge">C</div>
            <div className="footer-logo-text">
              <h3>CHNT</h3>
              <span>Interior Living</span>
            </div>
          </Link>

          <p className="footer-brand-desc">
            CHNT kiến tạo không gian sống bền vững, mang vẻ đẹp tinh tế của thiết kế Bắc Âu và vật liệu gỗ tự nhiên vào từng ngôi nhà Việt Nam.
          </p>

          <div className="footer-social-row">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link" title="Instagram">
              <InstagramIcon size={17} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link" title="Facebook">
              <FacebookIcon size={17} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-link" title="Youtube">
              <YoutubeIcon size={17} />
            </a>
          </div>
        </div>

        {/* EXPLORE LINKS */}
        <div className="footer-column">
          <h4>Khám phá</h4>
          <Link to="/">Trang chủ</Link>
          <Link to="/products">Tất cả sản phẩm</Link>
          <Link to="/orders">Lịch sử đơn hàng</Link>
          <a href="/#featured-collections">Bộ sưu tập tiêu biểu</a>
          <Link to="/reviews">Đánh giá khách hàng</Link>
        </div>

        {/* CUSTOMER SUPPORT */}
        <div className="footer-column">
          <h4>Hỗ trợ khách hàng</h4>
          <Link to="/cart">Giỏ hàng của bạn</Link>
          <Link to="/orders">Tra cứu đơn hàng</Link>
          <Link to="/policies/warranty">Chính sách bảo hành</Link>
          <Link to="/policies/returns">Chính sách đổi trả 30 ngày</Link>
          <Link to="/policies/shipping">Vận chuyển & thanh toán</Link>
          <Link to="/policies/privacy">Thông tin & nhận tin</Link>
        </div>

        {/* CONTACT INFO */}
        <div className="footer-column footer-contact-col">
          <h4>Liên hệ chúng tôi</h4>
          <div className="contact-item">
            <MapPin size={17} className="contact-icon" />
            <span>Showroom: 180 Nguyễn Thị Minh Khai, Q.3, TP. Hồ Chí Minh</span>
          </div>
          <div className="contact-item">
            <Phone size={17} className="contact-icon" />
            <span>Hotline tư vấn: 1900 6868 (8:00 - 21:00)</span>
          </div>
          <div className="contact-item">
            <Mail size={17} className="contact-icon" />
            <span>Email hỗ trợ: support@furnihome.vn</span>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© 2026 CHNT Vietnam. Bản quyền thuộc về HTTT05 - Furniture Management System.</p>

          <div className="footer-trust-badges">
            <span className="trust-badge">
              <ShieldCheck size={14} /> Thanh toán an toàn 100%
            </span>
            <button className="back-top-trigger" onClick={scrollToTop} title="Lên đầu trang">
              <span>Lên đầu trang</span>
              <ArrowUp size={15} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
