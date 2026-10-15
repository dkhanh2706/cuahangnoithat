import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Key,
  Eye,
  Crown,
  Shield,
  Briefcase,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import adminService from "../services/adminService";
import UserFormModal from "../components/UserFormModal";
import UserDetailModal from "../components/UserDetailModal";
import ResetPasswordModal from "../components/ResetPasswordModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const ADMIN_EMAIL = "adminhdk@gmail.com";

function UserManagement() {
  // State data
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Filter & Search states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Lỗi tải thống kê:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch user list
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers({
        page,
        limit,
        q: searchQuery,
        role: roleFilter,
        status: statusFilter,
        sortBy: "created_at",
        order: "desc",
      });
      setUsers(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error("Lỗi tải danh sách người dùng:", err);
      showToast(
        err.response?.data?.detail || "Không thể tải danh sách người dùng",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers for Add/Edit
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  const handleSaveUser = async (formData) => {
    try {
      setActionLoading(true);
      if (editingUser) {
        await adminService.updateUser(editingUser.id, formData);
        showToast(`Đã cập nhật thông tin người dùng ${editingUser.email}`);
      } else {
        await adminService.createUser(formData);
        showToast("Đã tạo người dùng mới thành công");
      }
      setIsFormModalOpen(false);
      setEditingUser(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.detail || "Đã xảy ra lỗi khi lưu người dùng";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for Toggle Status
  const handleToggleStatus = async (user) => {
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      showToast("Không thể khóa tài khoản Quản trị viên tối cao", "error");
      return;
    }

    try {
      setActionLoading(true);
      const nextStatus = !user.status;
      await adminService.toggleStatus(user.id, nextStatus);
      showToast(
        `Đã ${nextStatus ? "kích hoạt" : "khóa"} tài khoản ${user.email}`
      );
      fetchUsers();
      fetchStats();
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Không thể thay đổi trạng thái",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for Reset Password
  const handleOpenPasswordModal = (user) => {
    setPasswordUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = async (newPassword) => {
    if (!passwordUser) return;
    try {
      setActionLoading(true);
      await adminService.resetPassword(passwordUser.id, newPassword);
      showToast(`Đã đặt lại mật khẩu cho ${passwordUser.email}`);
      setIsPasswordModalOpen(false);
      setPasswordUser(null);
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Không thể đặt lại mật khẩu",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for Delete
  const handleOpenDeleteModal = (user) => {
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      showToast("Không thể xóa tài khoản Quản trị viên tối cao", "error");
      return;
    }
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      setActionLoading(true);
      await adminService.deleteUser(deletingUser.id);
      showToast(`Đã xóa tài khoản ${deletingUser.email}`);
      setIsDeleteModalOpen(false);
      setDeletingUser(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Không thể xóa tài khoản",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="admin-page-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`admin-floating-toast ${toast.type} animate-slide-left`}>
          {toast.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header Title Section */}
      <div className="admin-page-header">
        <div>
          <span className="admin-section-tag">HỆ THỐNG QUẢN TRỊ NGƯỜI DÙNG</span>
          <h1>Quản Lý Tài Khoản</h1>
          <p>
            Xem, phân quyền, quản lý trạng thái và bảo mật cho tất cả tài khoản trong hệ thống FurniHome.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            className="admin-btn secondary"
            onClick={() => {
              fetchUsers();
              fetchStats();
            }}
            disabled={loading}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={16} className={loading ? "spin-icon" : ""} />
            <span>Làm mới</span>
          </button>

          <button className="admin-btn primary" onClick={handleOpenAddModal}>
            <UserPlus size={16} />
            <span>Thêm Người Dùng</span>
          </button>
        </div>
      </div>

      {/* Security Rule Information Card */}
      <div className="admin-rule-card">
        <div className="rule-card-icon">
          <Sparkles size={20} />
        </div>
        <div className="rule-card-text">
          <h4>Chính Sách Bảo Mật Tài Khoản Quản Trị</h4>
          <p>
            Hệ thống tuân thủ nghiêm ngặt quy định: Duy nhất <strong>adminhdk@gmail.com</strong> có quyền Quản trị viên (ADMIN).
            Không một ai có thể đăng ký hoặc tạo thêm tài khoản Admin mới. Mọi tài khoản mới chỉ được phép nhận quyền <em>Khách hàng (CUSTOMER)</em> hoặc <em>Nhân viên (STAFF)</em>.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Tổng người dùng</span>
            <div className="stat-icon-pill gold">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-number">
            {statsLoading ? "..." : stats?.total_users ?? 0}
          </div>
          <div className="stat-subtext">
            <span>+{stats?.recent_users_count || 0} mới trong 30 ngày qua</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Đang hoạt động</span>
            <div className="stat-icon-pill green">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="stat-number text-green">
            {statsLoading ? "..." : stats?.active_users ?? 0}
          </div>
          <div className="stat-subtext">
            <span>Đủ điều kiện đăng nhập mua sắm</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Tài khoản bị khóa</span>
            <div className="stat-icon-pill red">
              <UserX size={20} />
            </div>
          </div>
          <div className="stat-number text-red">
            {statsLoading ? "..." : stats?.locked_users ?? 0}
          </div>
          <div className="stat-subtext">
            <span>Tạm ngưng quyền truy cập</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Phân bố vai trò</span>
            <div className="stat-icon-pill blue">
              <Shield size={20} />
            </div>
          </div>
          <div className="stat-roles-breakdown">
            <div className="role-mini-item">
              <span className="dot admin" />
              <span>Admin: <strong>{stats?.admin_count ?? 1}</strong></span>
            </div>
            <div className="role-mini-item">
              <span className="dot staff" />
              <span>Nhân viên: <strong>{stats?.staff_count ?? 0}</strong></span>
            </div>
            <div className="role-mini-item">
              <span className="dot customer" />
              <span>Khách hàng: <strong>{stats?.customer_count ?? 0}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-table-card">
        {/* Table Controls (Search & Filters) */}
        <div className="admin-table-controls">
          <div className="table-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="table-filters-row">
            <div className="filter-select-wrap">
              <Filter size={15} className="filter-icon" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tất cả vai trò</option>
                <option value="CUSTOMER">Khách hàng</option>
                <option value="STAFF">Nhân viên</option>
                <option value="ADMIN">Quản trị viên (Admin)</option>
              </select>
            </div>

            <div className="filter-select-wrap">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Đã bị khóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-responsive">
          <table className="admin-custom-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>ID</th>
                <th>Người dùng</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: "right", width: "170px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="table-loading-row">
                    <div className="table-spinner" />
                    <span>Đang tải danh sách người dùng...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-empty-row">
                    <div className="table-empty-box">
                      <UserX size={36} />
                      <p>Không tìm thấy người dùng nào phù hợp với bộ lọc</p>
                      {(searchQuery || roleFilter || statusFilter) && (
                        <button
                          className="admin-btn secondary"
                          onClick={() => {
                            setSearchQuery("");
                            setRoleFilter("");
                            setStatusFilter("");
                          }}
                        >
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const isMainAdmin =
                    item.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

                  return (
                    <tr
                      key={item.id}
                      className={isMainAdmin ? "admin-row-highlight" : ""}
                    >
                      <td className="col-id">#{item.id}</td>

                      <td className="col-user">
                        <div className="user-profile-cell">
                          <div
                            className={`user-avatar-badge ${
                              isMainAdmin ? "gold-avatar" : ""
                            }`}
                          >
                            {item.full_name?.charAt(0)?.toUpperCase() || "U"}
                            {isMainAdmin && (
                              <Crown size={12} className="avatar-crown-icon" />
                            )}
                          </div>
                          <div className="user-text-info">
                            <span className="user-full-name">
                              {item.full_name}
                              {isMainAdmin && (
                                <span className="super-admin-pill">
                                  ADMIN DUY NHẤT
                                </span>
                              )}
                            </span>
                            <span className="user-email">{item.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="col-phone">
                        {item.phone || <span className="text-muted">Chưa có</span>}
                      </td>

                      <td className="col-address">
                        <span className="address-truncate" title={item.address || ""}>
                          {item.address || <span className="text-muted">Chưa cập nhật</span>}
                        </span>
                      </td>

                      <td className="col-role">
                        <span className={`admin-role-badge ${item.role?.toLowerCase()}`}>
                          {item.role === "ADMIN" && <Crown size={13} />}
                          {item.role === "STAFF" && <Briefcase size={13} />}
                          {item.role === "CUSTOMER" && <UserIcon size={13} />}
                          <span>
                            {item.role === "ADMIN"
                              ? "Quản Trị Viên"
                              : item.role === "STAFF"
                              ? "Nhân Viên"
                              : "Khách Hàng"}
                          </span>
                        </span>
                      </td>

                      <td className="col-status">
                        <span
                          className={`admin-status-badge ${
                            item.status ? "active" : "locked"
                          }`}
                        >
                          <span className="status-dot" />
                          <span>{item.status ? "Hoạt động" : "Bị khóa"}</span>
                        </span>
                      </td>

                      <td className="col-date">{formatDate(item.created_at)}</td>

                      <td className="col-actions">
                        <div className="row-action-buttons">
                          {/* View detail button */}
                          <button
                            className="action-btn view"
                            title="Xem chi tiết"
                            onClick={() => {
                              setSelectedUser(item);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit user button */}
                          <button
                            className="action-btn edit"
                            title="Chỉnh sửa thông tin"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Lock / Unlock button (Disabled for main admin) */}
                          <button
                            className={`action-btn ${
                              item.status ? "lock" : "unlock"
                            }`}
                            title={
                              isMainAdmin
                                ? "Không thể khóa tài khoản Admin tối cao"
                                : item.status
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"
                            }
                            disabled={isMainAdmin || actionLoading}
                            onClick={() => handleToggleStatus(item)}
                          >
                            {item.status ? <Lock size={15} /> : <Unlock size={15} />}
                          </button>

                          {/* Reset password button */}
                          <button
                            className="action-btn key"
                            title="Đặt lại mật khẩu"
                            onClick={() => handleOpenPasswordModal(item)}
                          >
                            <Key size={15} />
                          </button>

                          {/* Delete user button (Disabled for main admin) */}
                          <button
                            className="action-btn delete"
                            title={
                              isMainAdmin
                                ? "Không thể xóa tài khoản Admin tối cao"
                                : "Xóa tài khoản"
                            }
                            disabled={isMainAdmin || actionLoading}
                            onClick={() => handleOpenDeleteModal(item)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="admin-pagination-bar">
          <div className="pagination-info">
            <span>
              Hiển thị <strong>{users.length}</strong> trong tổng số{" "}
              <strong>{total}</strong> tài khoản
            </span>
            <div className="limit-selector">
              <label>Mỗi trang:</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="pagination-buttons">
            <button
              className="page-nav-btn"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              title="Trang trước"
            >
              <ChevronLeft size={16} />
              <span>Trước</span>
            </button>

            <span className="current-page-tag">
              Trang {page} / {totalPages}
            </span>

            <button
              className="page-nav-btn"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              title="Trang sau"
            >
              <span>Sau</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSaveUser}
        editingUser={editingUser}
        loading={actionLoading}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUser}
      />

      <ResetPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleSavePassword}
        user={passwordUser}
        loading={actionLoading}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        user={deletingUser}
        loading={actionLoading}
      />
    </div>
  );
}

export default UserManagement;
