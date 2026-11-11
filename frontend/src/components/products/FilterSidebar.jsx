import { SlidersHorizontal, ChevronRight } from "lucide-react";
import { FILTER_ROOMS, FILTER_CATEGORIES, FILTER_MATERIALS, FILTER_COLORS, FILTER_STYLES } from "../../data/catalogFilters";

function FilterSidebar({ setCurrentPage, openSections, toggleSection, handleResetFilters, activeFiltersCount, filters }) {
  const { selectedRoom, setSelectedRoom, selectedCat, setSelectedCat, maxPrice, setMaxPrice, selectedMaterial, setSelectedMaterial, selectedColor, setSelectedColor, selectedStyle, setSelectedStyle, onlyInStock, setOnlyInStock } = filters;
  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar-header">
        <h3>
          <SlidersHorizontal size={17} /> Bộ lọc
        </h3>
        {activeFiltersCount > 0 && (
          <button
            className="reset-all-filters-btn"
            onClick={handleResetFilters}
          >
            Xóa ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Filter: Room / Collection — Accordion */}
      <div className="filter-group accordion-group">
        <button
          className={`accordion-toggle ${openSections.room ? "open" : ""}`}
          onClick={() => toggleSection("room")}
        >
          <span>Không gian sống</span>
          <ChevronRight size={14} className="accordion-chevron" />
        </button>
        {openSections.room && (
          <div className="filter-options-list accordion-body">
            {FILTER_ROOMS.map((r) => (
              <label
                key={r.slug}
                className={`filter-radio-item ${selectedRoom === r.slug ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="room"
                  checked={selectedRoom === r.slug}
                  onChange={() => {
                    setSelectedRoom(r.slug);
                    setCurrentPage(1);
                  }}
                />
                <span>{r.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filter: Category — Accordion */}
      <div className="filter-group accordion-group">
        <button
          className={`accordion-toggle ${openSections.category ? "open" : ""}`}
          onClick={() => toggleSection("category")}
        >
          <span>Danh mục</span>
          <ChevronRight size={14} className="accordion-chevron" />
        </button>
        {openSections.category && (
          <div className="filter-options-list accordion-body">
            {FILTER_CATEGORIES.map((c) => (
              <label
                key={c.slug}
                className={`filter-radio-item ${selectedCat === c.slug ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="category"
                  checked={selectedCat === c.slug}
                  onChange={() => {
                    setSelectedCat(c.slug);
                    setCurrentPage(1);
                  }}
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filter: Price — Accordion */}
      <div className="filter-group accordion-group">
        <button
          className={`accordion-toggle ${openSections.price ? "open" : ""}`}
          onClick={() => toggleSection("price")}
        >
          <span>Khoảng giá</span>
          <ChevronRight size={14} className="accordion-chevron" />
        </button>
        {openSections.price && (
          <div className="accordion-body">
            <div className="price-slider-box">
              <input
                type="range"
                className="price-slider-range"
                min="3000000"
                max="30000000"
                step="1000000"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
              />
              <div className="price-slider-labels">
                <span>0₫</span>
                <strong>{Number(maxPrice).toLocaleString("vi-VN")}₫</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter: Material — Accordion */}
      <div className="filter-group accordion-group">
        <button
          className={`accordion-toggle ${openSections.material ? "open" : ""}`}
          onClick={() => toggleSection("material")}
        >
          <span>Chất liệu{selectedMaterial !== "Tất cả" && <em className="filter-dot" />}</span>
          <ChevronRight size={14} className="accordion-chevron" />
        </button>
        {openSections.material && (
          <div className="filter-options-list accordion-body">
            {FILTER_MATERIALS.map((mat) => (
              <label
                key={mat}
                className={`filter-radio-item ${selectedMaterial === mat ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="material"
                  checked={selectedMaterial === mat}
                  onChange={() => {
                    setSelectedMaterial(mat);
                    setCurrentPage(1);
                  }}
                />
                <span>{mat}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filter: Color — Accordion */}
      <div className="filter-group accordion-group">
        <button
          className={`accordion-toggle ${openSections.color ? "open" : ""}`}
          onClick={() => toggleSection("color")}
        >
          <span>Màu sắc{selectedColor !== "Tất cả" && <em className="filter-dot" />}</span>
          <ChevronRight size={14} className="accordion-chevron" />
        </button>
        {openSections.color && (
          <div className="accordion-body">
            <div className="color-swatches-grid">
              {FILTER_COLORS.map((col) => (
                <button
                  key={col.name}
                  className={`color-swatch-btn ${selectedColor === col.name ? "active" : ""}`}
                  style={{
                    backgroundColor: col.hex === "transparent" ? "#ffffff" : col.hex,
                  }}
                  title={col.name}
                  onClick={() => {
                    setSelectedColor(col.name);
                    setCurrentPage(1);
                  }}
                >
                  {col.name === "Tất cả" && (
                    <span style={{ fontSize: "10px", color: "#666" }}>ALL</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter: Style — Accordion */}
      <div className="filter-group accordion-group">
        <button
          className={`accordion-toggle ${openSections.style ? "open" : ""}`}
          onClick={() => toggleSection("style")}
        >
          <span>Phong cách{selectedStyle !== "Tất cả" && <em className="filter-dot" />}</span>
          <ChevronRight size={14} className="accordion-chevron" />
        </button>
        {openSections.style && (
          <div className="filter-options-list accordion-body">
            {FILTER_STYLES.map((st) => (
              <label
                key={st}
                className={`filter-radio-item ${selectedStyle === st ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="style"
                  checked={selectedStyle === st}
                  onChange={() => {
                    setSelectedStyle(st);
                    setCurrentPage(1);
                  }}
                />
                <span>{st}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filter: In Stock Only Toggle */}
      <div className="stock-toggle-box">
        <span className="stock-toggle-label">Còn hàng</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => {
              setOnlyInStock(e.target.checked);
              setCurrentPage(1);
            }}
          />
          <span className="toggle-slider" />
        </label>
      </div>
    </aside>
  );
}

export default FilterSidebar;
