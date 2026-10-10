import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";
import "../styles/Auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (formData.full_name.trim().length < 2) {
      return "Họ và tên phải có ít nhất 2 ký tự.";
    }
    if (!formData.email.trim()) {
      return "Vui lòng nhập địa chỉ email hợp lệ.";
    }
    if (formData.password.length < 6) {
      return "Mật khẩu phải có tối thiểu 6 ký tự.";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Mật khẩu xác nhận không khớp.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.post("/api/auth/register", {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
      });

      setSuccess("Đăng ký thành công! Đang chuyển hướng sang trang đăng nhập...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1400);
    } catch (err) {
      console.error("Register error:", err);
      const message =
        err.response?.data?.detail || "Không thể tạo tài khoản. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container register-container">
        {/* LEFT VISUAL SIDE */}
        <div className="auth-visual register-visual">
          <div className="auth-visual-overlay" />
          <div className="auth-visual-content">
            <div className="auth-brand-pill">
              <Sparkles size={14} /> GIA NHẬP FURNIHOME
            </div>

            <h1>
              Tạo nên không gian
              <br />
              mang dấu ấn
              <span className="gold-text"> của riêng bạn.</span>
            </h1>

            <p className="auth-visual-description">
              Đăng ký thành viên để trải nghiệm hệ sinh thái nội thất cao cấp, nhận ngay voucher giảm 10% và tích điểm đổi quà giá trị.
            </p>

            <div className="auth-visual-perks">
              <div className="auth-perk-item">
                <CheckCircle2 size={16} />
                <span>Nhận ngay mã giảm 10% cho đơn hàng đầu tiên</span>
              </div>
              <div className="auth-perk-item">
                <CheckCircle2 size={16} />
                <span>Bảo hành tận nhà và hỗ trợ bảo trì trọn đời</span>
              </div>
              <div className="auth-perk-item">
                <CheckCircle2 size={16} />
                <span>Đổi trả thuận tiện trong 30 ngày nếu không hài lòng</span>
              </div>
            </div>
          </div>

          <div className="auth-visual-footer">
            <ShieldCheck size={16} />
            <span>Cam kết tuyệt đối bảo mật dữ liệu khách hàng</span>
          </div>
        </div>

        {/* RIGHT FORM SIDE */}
        <div className="auth-form-side">
          <div className="auth-form-box register-box">
            <div className="auth-heading">
              <span className="auth-step-tag">TẠO TÀI KHOẢN MỚI</span>
              <h2>Đăng ký thành viên</h2>
              <p>Điền thông tin bên dưới để bắt đầu trải nghiệm cùng FurniHome.</p>
            </div>

            {error && (
              <div className="auth-error-banner animate-slide-down">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-success-banner animate-slide-down">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="full_name">Họ và tên của bạn</label>
                <div className="input-with-icon">
                  <User size={18} className="field-icon" />
                  <input
                    id="full_name"
                    type="text"
                    name="full_name"
                    placeholder="Nguyễn Văn An"
                    value={formData.full_name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="email">Địa chỉ Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-grid-2">
                <div className="auth-field">
                  <label htmlFor="phone">Số điện thoại</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="field-icon" />
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="0912 345 678"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="address">Địa chỉ giao hàng</label>
                  <div className="input-with-icon">
                    <MapPin size={18} className="field-icon" />
                    <input
                      id="address"
                      type="text"
                      name="address"
                      placeholder="Quận / Thành phố"
                      value={formData.address}
                      onChange={handleChange}
                      autoComplete="street-address"
                    />
                  </div>
                </div>
              </div>

              <div className="auth-grid-2">
                <div className="auth-field">
                  <label htmlFor="password">Mật khẩu</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="field-icon" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Tối thiểu 6 ký tự"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
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

                <div className="auth-field">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="field-icon" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading-spinner">Đang tạo tài khoản...</span>
                ) : (
                  "Đăng ký tài khoản"
                )}
              </button>
            </form>

            <div className="auth-switch-prompt">
              <span>Đã có tài khoản FurniHome?</span>
              <Link to="/login">Đăng nhập tại đây</Link>
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

export default Register;
