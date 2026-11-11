import { X } from "lucide-react";
import { FILTER_ROOMS, FILTER_CATEGORIES, FILTER_MATERIALS } from "../../data/catalogFilters";

function MobileFilterDrawer({ setMobileDrawerOpen, filteredProducts, filters }) {
  const { selectedRoom, setSelectedRoom, selectedCat, setSelectedCat, selectedMaterial, setSelectedMaterial } = filters;
  return (
    <div
      className="mobile-filter-drawer-overlay"
      onClick={() => setMobileDrawerOpen(false)}
    >
      <div
        className="mobile-filter-drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-drawer-top">
          <h3>Bộ lọc sản phẩm</h3>
          <button
            className="mobile-drawer-close-btn"
            onClick={() => setMobileDrawerOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Filter Options */}
        <div className="filter-group">
          <span className="filter-group-title">Không gian sống</span>
          <div className="filter-options-list">
            {FILTER_ROOMS.map((r) => (
              <label key={r.slug} className="filter-radio-item">
                <input
                  type="radio"
                  name="m_room"
                  checked={selectedRoom === r.slug}
                  onChange={() => setSelectedRoom(r.slug)}
                />
                <span>{r.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-title">Danh mục</span>
          <div className="filter-options-list">
            {FILTER_CATEGORIES.map((c) => (
              <label key={c.slug} className="filter-radio-item">
                <input
                  type="radio"
                  name="m_cat"
                  checked={selectedCat === c.slug}
                  onChange={() => setSelectedCat(c.slug)}
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-title">Chất liệu</span>
          <div className="filter-options-list">
            {FILTER_MATERIALS.map((mat) => (
              <label key={mat} className="filter-radio-item">
                <input
                  type="radio"
                  name="m_mat"
                  checked={selectedMaterial === mat}
                  onChange={() => setSelectedMaterial(mat)}
                />
                <span>{mat}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          className="continue-shopping-btn"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          Xem {filteredProducts.length} kết quả
        </button>
      </div>
    </div>
  );
}

export default MobileFilterDrawer;
