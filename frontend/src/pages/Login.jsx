import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim()) {
      setError("Vui lòng nhập email.");
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

      navigate(redirectPath, {
        replace: true,
      });

      // Header đang đọc user từ localStorage.
      // Reload để Header cập nhật ngay sau login.
      window.location.reload();
    } catch (err) {
      console.error("Login error:", err);

      const message =
        err.response?.data?.detail || "Không thể đăng nhập. Vui lòng thử lại.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        {/* LEFT */}

        <div className="auth-visual">
          <div className="auth-visual-content">
            <p className="auth-overline">FURNIHOME</p>

            <h1>
              Không gian đẹp
              <br />
              bắt đầu từ
              <span> những lựa chọn đúng.</span>
            </h1>

            <p className="auth-visual-description">
              Đăng nhập để mua sắm, quản lý đơn hàng và lưu lại những lựa chọn
              phù hợp cho không gian sống của bạn.
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
          <div className="auth-form-box">
            <div className="auth-heading">
              <p>CHÀO MỪNG TRỞ LẠI</p>

              <h2>Đăng nhập</h2>

              <span>Đăng nhập vào tài khoản FurniHome của bạn.</span>
            </div>

            {error && (
              <div className="auth-error">
                <span>!</span>

                <p>{error}</p>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
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

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Mật khẩu</label>
                </div>

                <div className="password-field">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
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

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="auth-switch">
              <span>Chưa có tài khoản?</span>

              <Link to="/register">Đăng ký ngay</Link>
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

export default Login;
