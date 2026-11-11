import { X } from "lucide-react";
import { FILTER_ROOMS, FILTER_CATEGORIES } from "../../data/catalogFilters";

function CatalogMeta({ filteredProducts, activeFiltersCount, filters }) {
  const { selectedRoom, setSelectedRoom, selectedCat, setSelectedCat, selectedMaterial, setSelectedMaterial, selectedColor, setSelectedColor, onlyInStock, setOnlyInStock } = filters;
  return (
    <div className="catalog-meta-row">
      <span>
        Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm phù hợp
      </span>

      {activeFiltersCount > 0 && (
        <div className="active-filter-chips">
          {selectedRoom !== "all" && (
            <span className="active-chip">
              {FILTER_ROOMS.find((r) => r.slug === selectedRoom)?.name}
              <button onClick={() => setSelectedRoom("all")}>
                <X size={13} />
              </button>
            </span>
          )}
          {selectedCat !== "all" && (
            <span className="active-chip">
              {FILTER_CATEGORIES.find((c) => c.slug === selectedCat)?.name}
              <button onClick={() => setSelectedCat("all")}>
                <X size={13} />
              </button>
            </span>
          )}
          {selectedMaterial !== "Tất cả" && (
            <span className="active-chip">
              {selectedMaterial}
              <button onClick={() => setSelectedMaterial("Tất cả")}>
                <X size={13} />
              </button>
            </span>
          )}
          {selectedColor !== "Tất cả" && (
            <span className="active-chip">
              Màu {selectedColor}
              <button onClick={() => setSelectedColor("Tất cả")}>
                <X size={13} />
              </button>
            </span>
          )}
          {onlyInStock && (
            <span className="active-chip">
              Còn hàng
              <button onClick={() => setOnlyInStock(false)}>
                <X size={13} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default CatalogMeta;
