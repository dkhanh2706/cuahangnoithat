import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { RotateCcw, PackageOpen, Sparkles } from "lucide-react";
import api from "../services/api";
import { toCatalogProduct } from "../services/catalog";
import { useCart } from "../context/CartContext";
import { ROOM_BANNERS } from "../data/catalogFilters";
import FilterSidebar from "../components/products/FilterSidebar";
import CatalogToolbar from "../components/products/CatalogToolbar";
import CatalogMeta from "../components/products/CatalogMeta";
import ProductGridCard from "../components/products/ProductGridCard";
import ProductListCard from "../components/products/ProductListCard";
import Pagination from "../components/products/Pagination";
import QuickViewModal from "../components/products/QuickViewModal";
import MobileFilterDrawer from "../components/products/MobileFilterDrawer";
import "../styles/Products.css";

const ITEMS_PER_PAGE = 8;

function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  // URL Query Parameters
  const roomParam = searchParams.get("room") || searchParams.get("category") || "all";
  const catParam = searchParams.get("type") || "all";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "newest";

  // State Management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Filters State
  const [selectedRoom, setSelectedRoom] = useState(roomParam);
  const [selectedCat, setSelectedCat] = useState(catParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [maxPrice, setMaxPrice] = useState(30000000);
  const [selectedMaterial, setSelectedMaterial] = useState("Tất cả");
  const [selectedColor, setSelectedColor] = useState("Tất cả");
  const [selectedStyle, setSelectedStyle] = useState("Tất cả");
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Pagination & Quick View State
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [addedIds, setAddedIds] = useState([]);

  // Accordion state for filter sidebar sections
  const [openSections, setOpenSections] = useState({
    room: true,
    category: true,
    price: true,
    material: false,
    color: false,
    style: false,
  });
  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // Sync state when URL params change
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setSelectedRoom(searchParams.get("room") || searchParams.get("category") || "all");
    setSelectedCat(searchParams.get("type") || "all");
    setSearchQuery(searchParams.get("search") || "");
    setSelectedSort(searchParams.get("sort") || "newest");
    setCurrentPage(1);
  }, [searchParams]);

  // Only database products can be ordered.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Danh sách sản phẩm đã kèm ảnh, không cần gọi API ảnh riêng cho từng sản phẩm.
        const res = await api.get("/api/products");
        setProducts((res.data || []).map(toCatalogProduct));
      } catch (err) {
        console.error("Không thể tải sản phẩm:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  // Reset all filters
  const handleResetFilters = () => {
    setSelectedRoom("all");
    setSelectedCat("all");
    setSearchQuery("");
    setSelectedSort("newest");
    setMaxPrice(30000000);
    setSelectedMaterial("Tất cả");
    setSelectedColor("Tất cả");
    setSelectedStyle("Tất cả");
    setOnlyInStock(false);
    setCurrentPage(1);
    setSearchParams({});
  };

  // Add to cart with visual feedback
  const handleAddToCart = (e, product, qty = 1) => {
    e.stopPropagation();
    addToCart(product, qty);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  const openProduct = (product) => navigate(`/products/${product.id}`);

  // Filters bundle passed down to the filter components
  const filters = {
    selectedRoom, setSelectedRoom,
    selectedCat, setSelectedCat,
    searchQuery, setSearchQuery,
    selectedSort, setSelectedSort,
    maxPrice, setMaxPrice,
    selectedMaterial, setSelectedMaterial,
    selectedColor, setSelectedColor,
    selectedStyle, setSelectedStyle,
    onlyInStock, setOnlyInStock,
  };

  // Open Quick View Modal
  const handleOpenQuickView = (e, product) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Room / Collection
    if (selectedRoom !== "all") {
      result = result.filter(
        (p) =>
          p.room_slug === selectedRoom ||
          String(p.category_id) === String(selectedRoom)
      );
    }

    // Category / Type
    if (selectedCat !== "all") {
      result = result.filter((p) => p.category === selectedCat);
    }

    // Keyword Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.style?.toLowerCase().includes(q)
      );
    }

    // Price Filter
    if (maxPrice < 30000000) {
      result = result.filter((p) => Number(p.price) <= maxPrice);
    }

    // Material
    if (selectedMaterial !== "Tất cả") {
      result = result.filter((p) => p.material === selectedMaterial);
    }

    // Color
    if (selectedColor !== "Tất cả") {
      result = result.filter((p) => p.color === selectedColor);
    }

    // Style
    if (selectedStyle !== "Tất cả") {
      result = result.filter((p) => p.style === selectedStyle);
    }

    // In Stock Only
    if (onlyInStock) {
      result = result.filter((p) => (p.stock || 0) > 0 && p.badge !== "Hết hàng");
    }

    // Sorting
    if (selectedSort === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (selectedSort === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (selectedSort === "bestseller") {
      result.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    } else if (selectedSort === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // "newest"
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [
    products,
    selectedRoom,
    selectedCat,
    searchQuery,
    maxPrice,
    selectedMaterial,
    selectedColor,
    selectedStyle,
    onlyInStock,
    selectedSort,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Current Banner info
  const bannerInfo = useMemo(() => {
    if (selectedRoom && ROOM_BANNERS[selectedRoom]) {
      return ROOM_BANNERS[selectedRoom];
    }
    return {
      name: "Tất cả sản phẩm",
      eyebrow: "CHNT LIVING",
      title: "Bộ Sưu Tập Nội Thất Tinh Tế & Hiện Đại",
      description:
        "Khám phá những thiết kế nội thất Scandinavia & Japandi được chế tác từ gỗ sồi tự nhiên, đá cẩm thạch và vải dệt cao cấp.",
      image:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85",
    };
  }, [selectedRoom]);

  const activeFiltersCount = [
    selectedRoom !== "all",
    selectedCat !== "all",
    searchQuery.trim() !== "",
    maxPrice < 30000000,
    selectedMaterial !== "Tất cả",
    selectedColor !== "Tất cả",
    selectedStyle !== "Tất cả",
    onlyInStock,
  ].filter(Boolean).length;

  return (
    <div className="products-page">
      {/* 1. ROOM / COLLECTION DYNAMIC BANNER */}
      <section
        className="room-hero-banner"
        style={{ backgroundImage: `url("${bannerInfo.image}")` }}
      >
        <div className="room-hero-overlay" />
        <div className="room-hero-content">
          <div className="banner-breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/products">Sản phẩm</Link>
            {selectedRoom !== "all" && (
              <>
                <span>/</span>
                <span>{bannerInfo.name}</span>
              </>
            )}
          </div>

          <div className="banner-eyebrow">
            <Sparkles size={13} /> {bannerInfo.eyebrow}
          </div>

          <h1>{bannerInfo.title}</h1>
          <p>{bannerInfo.description}</p>
        </div>
      </section>

      {/* 2. MAIN LAYOUT: SIDEBAR + PRODUCTS CATALOG */}
      <div className="products-main-layout">
        <FilterSidebar setCurrentPage={setCurrentPage} openSections={openSections} toggleSection={toggleSection} handleResetFilters={handleResetFilters} activeFiltersCount={activeFiltersCount} filters={filters} />

        {/* RIGHT CATALOG CONTAINER */}
        <main className="catalog-content-main">
          <CatalogToolbar viewMode={viewMode} setViewMode={setViewMode} setMobileDrawerOpen={setMobileDrawerOpen} setCurrentPage={setCurrentPage} activeFiltersCount={activeFiltersCount} filters={filters} />

          <CatalogMeta filteredProducts={filteredProducts} activeFiltersCount={activeFiltersCount} filters={filters} />

          {/* SKELETON LOADING STATE */}
          {loading ? (
            <div className="products-grid-view">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="catalog-product-card skeleton-card">
                  <div
                    className="skeleton-image shimmer-loading"
                    style={{ aspectRatio: "1/1" }}
                  />
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div className="skeleton-line shimmer-loading" style={{ width: "40%", height: "14px" }} />
                    <div className="skeleton-line shimmer-loading" style={{ width: "80%", height: "18px" }} />
                    <div className="skeleton-line shimmer-loading" style={{ width: "50%", height: "16px" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* EMPTY RESULTS STATE */
            <div className="catalog-empty-state">
              <div className="empty-icon">
                <PackageOpen size={36} />
              </div>
              <h3>Không tìm thấy sản phẩm phù hợp</h3>
              <p>
                Rất tiếc, không có sản phẩm nào khớp với bộ lọc hiện tại của bạn. Bạn hãy thử nới lỏng các tiêu chí lọc nhé.
              </p>
              <button className="reset-filter-btn" onClick={handleResetFilters}>
                <RotateCcw size={15} style={{ marginRight: "6px" }} />
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* GRID VIEW MODE (4 COLS DESKTOP, 3 TABLET, 2 MOBILE) */
            <div className="products-grid-view">
              {paginatedProducts.map((product) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  isFav={isWishlisted(product.id)}
                  isJustAdded={addedIds.includes(product.id)}
                  onOpen={openProduct}
                  onToggleWishlist={toggleWishlist}
                  onQuickView={handleOpenQuickView}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            /* LIST VIEW MODE */
            <div className="products-list-view">
              {paginatedProducts.map((product) => (
                <ProductListCard
                  key={product.id}
                  product={product}
                  isFav={isWishlisted(product.id)}
                  isJustAdded={addedIds.includes(product.id)}
                  onOpen={openProduct}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        </main>
      </div>

      {/* QUICK VIEW POPUP MODAL */}
      {quickViewProduct && (
        <QuickViewModal
          key={quickViewProduct.id}
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          onOpenDetail={openProduct}
        />
      )}

      {/* MOBILE FILTER DRAWER */}
      {mobileDrawerOpen && (
        <MobileFilterDrawer setMobileDrawerOpen={setMobileDrawerOpen} filteredProducts={filteredProducts} filters={filters} />
      )}
    </div>
  );
}

export default Products;
