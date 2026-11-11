import { Search, Filter, X } from "lucide-react";

function UserTableControls({ roleFilter, searchQuery, setPage, setRoleFilter, setSearchQuery, setStatusFilter, statusFilter }) {
  return (
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
  );
}

export default UserTableControls;
