import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    if (formData.full_name.trim().length < 2) {
      return "Họ và tên phải có ít nhất 2 ký tự.";
    }

    if (!formData.email.trim()) {
      return "Vui lòng nhập email.";
    }

    if (formData.password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Mật khẩu xác nhận không khớp.";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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

      setSuccess("Đăng ký thành công. Đang chuyển đến trang đăng nhập...");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (err) {
      console.error("Register error:", err);

      const message =
        err.response?.data?.detail || "Không thể đăng ký. Vui lòng thử lại.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container register-container">
        {/* LEFT */}

        <div className="auth-visual register-visual">
          <div className="auth-visual-content">
            <p className="auth-overline">FURNIHOME</p>

            <h1>
              Tạo một không gian
              <br />
              <span>mang dấu ấn của riêng bạn.</span>
            </h1>

            <p className="auth-visual-description">
              Tạo tài khoản để mua sản phẩm, quản lý đơn hàng và sử dụng các
              dịch vụ dành riêng cho khách hàng FurniHome.
            </p>
          </div>

          <div className="auth-room">
            <div className="auth-wall-art" />

            <div className="auth-sofa">
              <div />
              <div />
            </div>

            <div className="auth-table" />
          </div>
        </div>

        {/* RIGHT */}

        <div className="auth-form-side">
          <div className="auth-form-box register-box">
            <div className="auth-heading">
              <p>TẠO TÀI KHOẢN</p>

              <h2>Đăng ký</h2>

              <span>Điền thông tin để bắt đầu sử dụng FurniHome.</span>
            </div>

            {error && (
              <div className="auth-error">
                <span>!</span>

                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="auth-success">
                <span>✓</span>

                <p>{success}</p>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="full_name">Họ và tên</label>

                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  placeholder="Nguyễn Văn A"
                  value={formData.full_name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="auth-grid">
                <div className="auth-field">
                  <label htmlFor="phone">Số điện thoại</label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="address">Địa chỉ</label>

                  <input
                    id="address"
                    type="text"
                    name="address"
                    placeholder="TP.HCM"
                    value={formData.address}
                    onChange={handleChange}
                    autoComplete="street-address"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">Mật khẩu</label>

                <div className="password-field">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>

                <div className="password-field">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </button>
            </form>

            <div className="auth-switch">
              <span>Đã có tài khoản?</span>

              <Link to="/login">Đăng nhập</Link>
            </div>

            <div className="auth-back">
              <Link to="/">← Quay lại trang chủ</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
