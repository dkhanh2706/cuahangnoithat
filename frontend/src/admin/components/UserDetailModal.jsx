import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Crown,
} from "lucide-react";

function UserDetailModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  const isMainAdmin = user.email?.toLowerCase() === "adminhdk@gmail.com";

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa cập nhật";
    try {
      return new Date(dateStr).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-box animate-scale-in">
        <div className="admin-modal-header">
          <div>
            <h3>Chi Tiết Tài Khoản</h3>
            <p className="admin-modal-subtitle">Thông tin định danh người dùng #{user.id}</p>
          </div>
          <button className="admin-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-user-detail-card">
          <div className="detail-avatar-wrapper">
            <div className={`detail-avatar ${isMainAdmin ? "admin-avatar-crown" : ""}`}>
              {user.full_name?.charAt(0)?.toUpperCase() || "U"}
              {isMainAdmin && <Crown size={18} className="crown-badge" />}
            </div>
            <div className="detail-headline">
              <h4>{user.full_name}</h4>
              <p>{user.email}</p>
              <div className="detail-tags">
                <span className={`admin-role-badge ${user.role.toLowerCase()}`}>
                  {user.role === "ADMIN" ? "Quản Trị Viên" : user.role === "STAFF" ? "Nhân Viên" : "Khách Hàng"}
                </span>
                <span className={`admin-status-badge ${user.status ? "active" : "locked"}`}>
                  {user.status ? "Đang hoạt động" : "Bị khóa"}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">
                <User size={15} /> ID Hệ thống
              </span>
              <span className="detail-value">#{user.id}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Mail size={15} /> Email
              </span>
              <span className="detail-value">{user.email}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Phone size={15} /> Số điện thoại
              </span>
              <span className="detail-value">{user.phone || "Chưa có"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Shield size={15} /> Quyền hạn (Role)
              </span>
              <span className="detail-value">{user.role}</span>
            </div>

            <div className="detail-item full-width">
              <span className="detail-label">
                <MapPin size={15} /> Địa chỉ
              </span>
              <span className="detail-value">{user.address || "Chưa cập nhật địa chỉ"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Calendar size={15} /> Ngày đăng ký
              </span>
              <span className="detail-value">{formatDate(user.created_at)}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Clock size={15} /> Cập nhật lần cuối
              </span>
              <span className="detail-value">{formatDate(user.updated_at)}</span>
            </div>
          </div>

          {isMainAdmin && (
            <div className="admin-banner info" style={{ marginTop: "16px" }}>
              <Crown size={18} />
              <span>
                Đây là <strong>Quản trị viên duy nhất</strong> của hệ thống. Tài khoản này được bảo vệ chống khóa hoặc xóa ngoài ý muốn.
              </span>
            </div>
          )}
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="admin-btn primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDetailModal;
