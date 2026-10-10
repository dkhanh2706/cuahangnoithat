import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import "../styles/Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }
    if (!formData.password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/api/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const { access_token, user } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      const redirectPath = location.state?.from || "/";
      navigate(redirectPath, { replace: true });
      window.location.reload();
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.detail || "Email hoặc mật khẩu không chính xác.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        {/* LEFT VISUAL SIDE */}
        <div className="auth-visual">
          <div className="auth-visual-overlay" />
          <div className="auth-visual-content">
            <div className="auth-brand-pill">
              <Sparkles size={14} /> FURNIHOME LIVING
            </div>

            <h1>
              Không gian sống đẹp
              <br />
              bắt đầu từ
              <span className="gold-text"> những lựa chọn đúng.</span>
            </h1>

            <p className="auth-visual-description">
              Đăng nhập tài khoản để nhận ưu đãi độc quyền 10%, theo dõi tình trạng đơn hàng và lưu trữ những thiết kế yêu thích.
            </p>

            <div className="auth-visual-perks">
              <div className="auth-perk-item">
                <CheckCircle2 size={16} />
                <span>Bảo hành chính hãng 5 năm tại nhà</span>
              </div>
              <div className="auth-perk-item">
                <CheckCircle2 size={16} />
                <span>Tư vấn bài trí không gian 3D miễn phí</span>
              </div>
              <div className="auth-perk-item">
                <CheckCircle2 size={16} />
                <span>Giao hàng và lắp đặt tận phòng</span>
              </div>
            </div>
          </div>

          <div className="auth-visual-footer">
            <ShieldCheck size={16} />
            <span>Cam kết bảo mật thông tin chuẩn quốc tế</span>
          </div>
        </div>

        {/* RIGHT FORM SIDE */}
        <div className="auth-form-side">
          <div className="auth-form-box">
            <div className="auth-heading">
              <span className="auth-step-tag">CHÀO MỪNG TRỞ LẠI</span>
              <h2>Đăng nhập</h2>
              <p>Nhập thông tin tài khoản FurniHome của bạn để tiếp tục.</p>
            </div>

            {error && (
              <div className="auth-error-banner animate-slide-down">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="email">Địa chỉ Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="tenban@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Mật khẩu</label>
                  <a href="#forgot" className="forgot-password-link">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Nhập mật khẩu của bạn"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading-spinner">Đang đăng nhập...</span>
                ) : (
                  "Đăng nhập ngay"
                )}
              </button>
            </form>

            <div className="auth-switch-prompt">
              <span>Chưa có tài khoản FurniHome?</span>
              <Link to="/register">Tạo tài khoản mới</Link>
            </div>

            <div className="auth-back-link">
              <Link to="/">
                <ArrowLeft size={15} /> Quay lại trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
