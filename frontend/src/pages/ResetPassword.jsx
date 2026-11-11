import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../services/api";
import "../styles/Auth.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (password.length < 6) {
      setError("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/api/auth/reset-password", { token, new_password: password });
      setMessage(data.message);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const invalidLink = !token;

  return (
    <section className="auth-page">
      <div className="auth-container auth-container-single">
        <div className="auth-form-side">
          <div className="auth-form-box">
            <div className="auth-heading">
              <span className="auth-step-tag">KHÔI PHỤC TÀI KHOẢN</span>
              <h2>Đặt lại mật khẩu</h2>
              <p>Tạo mật khẩu mới cho tài khoản CHNT của bạn.</p>
            </div>

            {invalidLink && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle size={18} />
                <span>Liên kết không hợp lệ. Vui lòng yêu cầu gửi lại liên kết mới.</span>
              </div>
            )}

            {error && (
              <div className="auth-error-banner animate-slide-down" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {message ? (
              <>
                <div className="auth-success-banner" role="status">
                  <CheckCircle2 size={18} />
                  <span>{message}</span>
                </div>
                <Link to="/login" className="auth-submit-btn" style={{ textAlign: "center", display: "block" }}>
                  Đến trang đăng nhập
                </Link>
              </>
            ) : (
              !invalidLink && (
                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="auth-field">
                    <label htmlFor="new-password">Mật khẩu mới</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="field-icon" />
                      <input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Tối thiểu 6 ký tự"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError("");
                        }}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="confirm-password">Nhập lại mật khẩu mới</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="field-icon" />
                      <input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        value={confirm}
                        onChange={(e) => {
                          setConfirm(e.target.value);
                          if (error) setError("");
                        }}
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? "Đang lưu..." : "Đặt lại mật khẩu"}
                  </button>
                </form>
              )
            )}

            {(invalidLink || error) && !message && (
              <div className="auth-back-link">
                <Link to="/forgot-password">Gửi lại liên kết đặt lại mật khẩu</Link>
              </div>
            )}

            <div className="auth-back-link">
              <Link to="/login"><ArrowLeft size={15} /> Quay lại đăng nhập</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResetPassword;
