import { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

function UserFormModal({ isOpen, onClose, onSubmit, editingUser = null, loading = false }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "CUSTOMER",
    status: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(editingUser);
  const isMainAdmin = editingUser?.email?.toLowerCase() === "adminhdk@gmail.com";

  useEffect(() => {
    if (editingUser) {
      setFormData({
        full_name: editingUser.full_name || "",
        email: editingUser.email || "",
        password: "",
        phone: editingUser.phone || "",
        address: editingUser.address || "",
        role: editingUser.role || "CUSTOMER",
        status: editingUser.status ?? true,
      });
    } else {
      setFormData({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "CUSTOMER",
        status: true,
      });
    }
    setError("");
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      setError("Họ và tên không được để trống");
      return;
    }

    if (!isEditing) {
      if (!formData.email.trim()) {
        setError("Email không được để trống");
        return;
      }
      if (formData.email.trim().toLowerCase() === "adminhdk@gmail.com") {
        setError("Không thể dùng email adminhdk@gmail.com vì đã là Admin hệ thống");
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự");
        return;
      }
    }

    if (formData.role === "ADMIN" && !isMainAdmin) {
      setError("Không thể thiết lập vai trò ADMIN. Hệ thống chỉ cho phép 1 Admin duy nhất.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-box animate-scale-in">
        <div className="admin-modal-header">
          <div>
            <h3>{isEditing ? "Cập Nhật Tài Khoản" : "Thêm Người Dùng Mới"}</h3>
            <p className="admin-modal-subtitle">
              {isEditing
                ? `Chỉnh sửa thông tin tài khoản #${editingUser.id}`
                : "Tạo tài khoản Khách hàng hoặc Nhân viên mới"}
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

        {/* Security Rule Badge */}
        <div className="admin-security-note">
          <Shield size={16} />
          <span>
            <strong>Quy tắc bảo mật:</strong> Không thể tạo thêm hoặc thăng cấp tài khoản ADMIN. Chỉ duy nhất <code>adminhdk@gmail.com</code> có quyền Quản trị viên.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-form-group">
            <label>Họ và tên <span className="req">*</span></label>
            <div className="admin-input-wrap">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Ví dụ: Nguyễn Văn A"
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Địa chỉ Email <span className="req">*</span></label>
            <div className="admin-input-wrap">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@furnihome.vn"
                disabled={isEditing}
                required
              />
            </div>
            {isEditing && (
              <small className="admin-field-hint">Email tài khoản không thể chỉnh sửa</small>
            )}
          </div>

          {!isEditing && (
            <div className="admin-form-group">
              <label>Mật khẩu ban đầu <span className="req">*</span></label>
              <div className="admin-input-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 6 ký tự"
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
          )}

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Số điện thoại</label>
              <div className="admin-input-wrap">
                <Phone size={18} className="input-icon" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912345678"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Vai trò (Role)</label>
              <div className="admin-input-wrap">
                <Shield size={18} className="input-icon" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isMainAdmin}
                >
                  <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                  <option value="STAFF">Nhân viên (STAFF)</option>
                  {isMainAdmin && <option value="ADMIN">Quản trị viên (ADMIN)</option>}
                </select>
              </div>
              {isMainAdmin && (
                <small className="admin-field-hint">Tài khoản Admin chính không thể đổi vai trò</small>
              )}
            </div>
          </div>

          <div className="admin-form-group">
            <label>Địa chỉ</label>
            <div className="admin-input-wrap">
              <MapPin size={18} className="input-icon" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Số nhà, tên đường, quận/huyện, tỉnh/thành"
              />
            </div>
          </div>

          <div className="admin-checkbox-group">
            <label className="admin-custom-toggle">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                disabled={isMainAdmin}
              />
              <span className="toggle-slider" />
              <span className="toggle-label">
                {formData.status ? "Kích hoạt (Cho phép đăng nhập)" : "Khóa tài khoản (Chặn truy cập)"}
              </span>
            </label>
            {isMainAdmin && (
              <small className="admin-field-hint">Tài khoản Quản trị viên tối cao luôn ở trạng thái hoạt động</small>
            )}
          </div>

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-btn secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="admin-btn primary"
              disabled={loading}
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{isEditing ? "Lưu Thay Đổi" : "Tạo Tài Khoản"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFormModal;
