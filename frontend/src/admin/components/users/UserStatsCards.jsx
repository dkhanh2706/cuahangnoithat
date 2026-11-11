import { Users, UserCheck, UserX, Shield } from "lucide-react";

function UserStatsCards({ stats, statsLoading }) {
  return (
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
  );
}

export default UserStatsCards;
