import { useState, useEffect } from "react";
import { X, Key, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

function ResetPasswordModal({ isOpen, onClose, onSubmit, user, loading = false }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      setError("Mật khẩu mới phải có tối thiểu 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không trùng khớp");
      return;
    }

    onSubmit(newPassword);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-box animate-scale-in" style={{ maxWidth: "440px" }}>
        <div className="admin-modal-header">
          <div>
            <h3>Đặt Lại Mật Khẩu</h3>
            <p className="admin-modal-subtitle">
              Cập nhật mật khẩu mới cho: <strong>{user.email}</strong>
            </p>
          </div>
          <button className="admin-modal-close-btn" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="admin-banner error animate-fade">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-form-group">
            <label>Mật khẩu mới <span className="req">*</span></label>
            <div className="admin-input-wrap">
              <Key size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                required
              />
              <button
                type="button"
                className="password-peek-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="admin-form-group">
            <label>Xác nhận mật khẩu mới <span className="req">*</span></label>
            <div className="admin-input-wrap">
              <Key size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>
          </div>

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-btn secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="admin-btn primary"
              disabled={loading}
            >
              {loading ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Xác Nhận Đổi Mật Khẩu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordModal;
