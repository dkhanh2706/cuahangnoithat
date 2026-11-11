import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../services/api";
import "../styles/Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/api/auth/forgot-password", { email: email.trim() });
      setMessage(data.message);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Địa chỉ email không hợp lệ hoặc có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container auth-container-single">
        <div className="auth-form-side">
          <div className="auth-form-box">
            <div className="auth-heading">
              <span className="auth-step-tag">KHÔI PHỤC TÀI KHOẢN</span>
              <h2>Quên mật khẩu</h2>
              <p>Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết để bạn tạo mật khẩu mới.</p>
            </div>

            {error && (
              <div className="auth-error-banner animate-slide-down" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {message ? (
              <div className="auth-success-banner" role="status">
                <CheckCircle2 size={18} />
                <span>{message} Vui lòng kiểm tra cả hộp thư rác.</span>
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label htmlFor="forgot-email">Địa chỉ Email</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="field-icon" />
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="tenban@gmail.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
                </button>
              </form>
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

export default ForgotPassword;
