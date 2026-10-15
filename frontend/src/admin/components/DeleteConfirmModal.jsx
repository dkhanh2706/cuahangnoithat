import { AlertTriangle, Trash2, X } from "lucide-react";

function DeleteConfirmModal({ isOpen, onClose, onConfirm, user, loading = false }) {
  if (!isOpen || !user) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-box animate-scale-in" style={{ maxWidth: "440px" }}>
        <div className="admin-modal-header danger-header">
          <div className="danger-icon-circle">
            <AlertTriangle size={24} />
          </div>
          <button className="admin-modal-close-btn" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
          <h3 style={{ fontSize: "19px", color: "#f87171", marginBottom: "8px" }}>
            Xác Nhận Xóa Tài Khoản
          </h3>
          <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: "1.5" }}>
            Bạn có chắc chắn muốn xóa tài khoản của người dùng:
            <br />
            <strong style={{ color: "#ffffff", fontSize: "15px" }}>{user.full_name}</strong>
            <br />
            <span style={{ color: "#c59b6c" }}>({user.email})</span>?
          </p>
          <div className="admin-banner danger" style={{ marginTop: "16px", textAlign: "left" }}>
            <span>Hành động này không thể hoàn tác. Mọi dữ liệu liên kết với tài khoản này sẽ bị xóa khỏi cơ sở dữ liệu.</span>
          </div>
        </div>

        <div className="admin-modal-actions" style={{ justifyContent: "center" }}>
          <button
            type="button"
            className="admin-btn secondary"
            onClick={onClose}
            disabled={loading}
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            className="admin-btn danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span>Đang xóa...</span>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Xóa Tài Khoản</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
