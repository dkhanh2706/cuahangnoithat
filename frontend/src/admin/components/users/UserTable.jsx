import { UserX, Edit2, Trash2, Lock, Unlock, Key, Eye, Crown, Briefcase, User as UserIcon } from "lucide-react";

function UserTable({ actionLoading, formatDate, handleOpenDeleteModal, handleOpenEditModal, handleOpenPasswordModal, handleToggleStatus, loading, roleFilter, searchQuery, setIsDetailModalOpen, setRoleFilter, setSearchQuery, setSelectedUser, setStatusFilter, statusFilter, users }) {
  return (
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
                item.role === "ADMIN";

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
  );
}

export default UserTable;
