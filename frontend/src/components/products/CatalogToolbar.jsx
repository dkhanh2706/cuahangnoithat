import { Search, SlidersHorizontal, LayoutGrid, List, X } from "lucide-react";

function CatalogToolbar({ viewMode, setViewMode, setMobileDrawerOpen, setCurrentPage, activeFiltersCount, filters }) {
  const { searchQuery, setSearchQuery, selectedSort, setSelectedSort } = filters;
  return (
    <div className="catalog-toolbar">
      {/* Search Input with Clear Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCurrentPage(1);
        }}
        className="toolbar-search-form"
      >
        <Search size={17} className="toolbar-search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, chất liệu..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
            }}
          >
            <X size={15} />
          </button>
        )}
      </form>

      <div className="toolbar-controls">
        {/* Mobile Filter Button */}
        <button
          className="mobile-filter-open-btn"
          onClick={() => setMobileDrawerOpen(true)}
        >
          <SlidersHorizontal size={15} />
          <span>Bộ lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
        </button>

        {/* Sort Dropdown */}
        <div className="sort-dropdown">
          <span>Sắp xếp:</span>
          <select
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="newest">Mới nhất</option>
            <option value="bestseller">Bán chạy nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
        </div>

        {/* Grid / List View Toggle */}
        <div className="view-mode-toggle">
          <button
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Hiển thị dạng lưới"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="Hiển thị dạng danh sách"
          >
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CatalogToolbar;
