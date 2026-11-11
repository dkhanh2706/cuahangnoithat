import { ChevronLeft, ChevronRight } from "lucide-react";

function UserPagination({ limit, loading, page, setLimit, setPage, total, totalPages, users }) {
  return (
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
  );
}

export default UserPagination;
