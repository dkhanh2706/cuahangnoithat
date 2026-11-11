import { useState, useEffect, useCallback } from "react";
import { UserPlus, RefreshCw, CheckCircle2, AlertCircle, X, Sparkles } from "lucide-react";
import adminService from "../services/adminService";
import UserFormModal from "../components/UserFormModal";
import UserDetailModal from "../components/UserDetailModal";
import ResetPasswordModal from "../components/ResetPasswordModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import UserPagination from "../components/users/UserPagination";
import UserTable from "../components/users/UserTable";
import UserTableControls from "../components/users/UserTableControls";
import UserStatsCards from "../components/users/UserStatsCards";


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

  // Tải dữ liệu ban đầu và tải lại khi bộ lọc đổi.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    if (user.role === "ADMIN") {
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
    if (user.role === "ADMIN") {
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
            Xem, phân quyền, quản lý trạng thái và bảo mật cho tất cả tài khoản trong hệ thống CHNT.
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
            Hệ thống tuân thủ nghiêm ngặt quy định: Duy nhất tài khoản Admin hệ thống có quyền Quản trị viên (ADMIN).
            Không một ai có thể đăng ký hoặc tạo thêm tài khoản Admin mới. Mọi tài khoản mới chỉ được phép nhận quyền <em>Khách hàng (CUSTOMER)</em> hoặc <em>Nhân viên (STAFF)</em>.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStatsCards stats={stats} statsLoading={statsLoading} />

      {/* Main Table Card */}
      <div className="admin-table-card">
        <UserTableControls roleFilter={roleFilter} searchQuery={searchQuery} setPage={setPage} setRoleFilter={setRoleFilter} setSearchQuery={setSearchQuery} setStatusFilter={setStatusFilter} statusFilter={statusFilter} />

        <UserTable actionLoading={actionLoading} formatDate={formatDate} handleOpenDeleteModal={handleOpenDeleteModal} handleOpenEditModal={handleOpenEditModal} handleOpenPasswordModal={handleOpenPasswordModal} handleToggleStatus={handleToggleStatus} loading={loading} roleFilter={roleFilter} searchQuery={searchQuery} setIsDetailModalOpen={setIsDetailModalOpen} setRoleFilter={setRoleFilter} setSearchQuery={setSearchQuery} setSelectedUser={setSelectedUser} setStatusFilter={setStatusFilter} statusFilter={statusFilter} users={users} />

        <UserPagination limit={limit} loading={loading} page={page} setLimit={setLimit} setPage={setPage} total={total} totalPages={totalPages} users={users} />
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
