import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ currentPage, setCurrentPage, totalPages }) {
  if (totalPages <= 1) return null;

  return (
    <div className="catalog-pagination">
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => {
          setCurrentPage((p) => Math.max(1, p - 1));
          window.scrollTo({ top: 380, behavior: "smooth" });
        }}
      >
        <ChevronLeft size={18} />
      </button>

      {[...Array(totalPages)].map((_, i) => {
        const pageNum = i + 1;
        return (
          <button
            key={pageNum}
            className={`pagination-btn ${currentPage === pageNum ? "active" : ""}`}
            onClick={() => {
              setCurrentPage(pageNum);
              window.scrollTo({ top: 380, behavior: "smooth" });
            }}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => {
          setCurrentPage((p) => Math.min(totalPages, p + 1));
          window.scrollTo({ top: 380, behavior: "smooth" });
        }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default Pagination;
