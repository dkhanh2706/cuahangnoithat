import api from "../../services/api";

const adminService = {
  // Lấy thống kê tổng quan
  getStats: async () => {
    const response = await api.get("/api/admin/stats");
    return response.data;
  },

  // Lấy danh sách người dùng có phân trang, tìm kiếm, lọc
  getUsers: async ({
    page = 1,
    limit = 10,
    q = "",
    role = "",
    status = "",
    sortBy = "created_at",
    order = "desc",
  } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (q && q.trim()) params.append("q", q.trim());
    if (role) params.append("role", role);
    if (status !== "" && status !== null && status !== undefined) {
      params.append("status", status);
    }
    if (sortBy) params.append("sort_by", sortBy);
    if (order) params.append("order", order);

    const response = await api.get(`/api/admin/users?${params.toString()}`);
    return response.data;
  },

  // Lấy chi tiết 1 người dùng
  getUserDetail: async (userId) => {
    const response = await api.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Tạo người dùng mới (chỉ CUSTOMER hoặc STAFF)
  createUser: async (userData) => {
    const response = await api.post("/api/admin/users", userData);
    return response.data;
  },

  // Cập nhật thông tin người dùng
  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/admin/users/${userId}`, userData);
    return response.data;
  },

  // Bật/tắt trạng thái người dùng
  toggleStatus: async (userId, nextStatus) => {
    const payload = nextStatus !== undefined ? { status: nextStatus } : undefined;
    const response = await api.patch(`/api/admin/users/${userId}/status`, payload);
    return response.data;
  },

  // Đặt lại mật khẩu người dùng
  resetPassword: async (userId, newPassword) => {
    const response = await api.patch(`/api/admin/users/${userId}/reset-password`, {
      new_password: newPassword,
    });
    return response.data;
  },

  // Xóa tài khoản người dùng
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  },
};

export default adminService;
