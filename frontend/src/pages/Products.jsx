import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Star,
  ShoppingBag,
  Heart,
  Check,
  Eye,
  X,
  RotateCcw,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import {
  ROOM_BANNERS,
  FILTER_ROOMS,
  FILTER_CATEGORIES,
  FILTER_MATERIALS,
  FILTER_COLORS,
  FILTER_STYLES,
} from "../data/mockProducts";
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
  const [quickViewImage, setQuickViewImage] = useState("");
  const [quickViewQty, setQuickViewQty] = useState(1);
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
        const res = await api.get("/api/products");
        if (res.data && res.data.length > 0) {
          // Merge images for backend products
          const backendProducts = await Promise.all(
            res.data.map(async (p) => {
              try {
                const imgRes = await api.get(`/api/products/${p.id}/images`);
                const imgs = imgRes.data;
                const primary = imgs.find((i) => i.is_primary) || imgs[0];
                return {
                  ...p,
                  primary_image: primary?.image_url || null,
                  secondary_image: imgs[1]?.image_url || primary?.image_url || null,
                  _source: "backend",
                };
              } catch {
                return { ...p, primary_image: null, secondary_image: null, _source: "backend" };
              }
            })
          );

          setProducts(backendProducts);
        } else {
          setProducts([]);
        }
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

  // Open Quick View Modal
  const handleOpenQuickView = (e, product) => {
    e.stopPropagation();
    setQuickViewProduct(product);
    setQuickViewImage(product.primary_image || "");
    setQuickViewQty(1);
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
      eyebrow: "FURNIHOME LIVING",
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
        {/* DESKTOP FILTER SIDEBAR */}
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

        {/* RIGHT CATALOG CONTAINER */}
        <main className="catalog-content-main">
          {/* TOOLBAR */}

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

          {/* ACTIVE FILTER CHIPS & COUNT */}
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
              {paginatedProducts.map((product) => {
                const isFav = isWishlisted(product.id);
                const isJustAdded = addedIds.includes(product.id);
                const primaryImg =
                  product.primary_image ||
                  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";
                const secondaryImg = product.secondary_image || primaryImg;
                const isOutOfStock = product.stock === 0 || product.badge === "Hết hàng";

                return (
                  <article
                    key={product.id}
                    className="catalog-product-card"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="card-image-box">
                      {/* Dual Images with Hover Swap */}
                      <img
                        src={primaryImg}
                        alt={product.name}
                        className="card-img-primary"
                        loading="lazy"
                      />
                      <img
                        src={secondaryImg}
                        alt={`${product.name} góc khác`}
                        className="card-img-secondary"
                        loading="lazy"
                      />

                      {/* Badge Tag */}
                      {product.badge && (
                        <div
                          className={`card-badge-pill ${isOutOfStock ? "out-of-stock" : ""}`}
                        >
                          <span>{product.badge}</span>
                        </div>
                      )}

                      {/* Wishlist Heart Icon */}
                      <button
                        className={`card-wishlist-btn ${isFav ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        aria-label="Yêu thích"
                      >
                        <Heart
                          size={17}
                          fill={isFav ? "#e74c3c" : "none"}
                          color={isFav ? "#e74c3c" : "#3b473f"}
                        />
                      </button>

                      {/* Quick View Button */}
                      <button
                        className="card-quick-view-btn"
                        onClick={(e) => handleOpenQuickView(e, product)}
                      >
                        <Eye size={15} />
                        <span>Xem nhanh</span>
                      </button>

                      {/* Add to Cart Button */}
                      {!isOutOfStock && (
                        <button
                          className={`card-add-cart-btn ${isJustAdded ? "added" : ""}`}
                          onClick={(e) => handleAddToCart(e, product, 1)}
                        >
                          {isJustAdded ? (
                            <>
                              <Check size={16} /> Đã thêm vào giỏ
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={16} /> Thêm vào giỏ
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="card-info-box">
                      <div className="card-meta-row">
                        <span className="card-material-text">
                          {product.material || "Nội thất cao cấp"}
                        </span>
                        <div className="card-rating-badge">
                          <Star size={13} fill="#c49a62" color="#c49a62" />
                          <span>{product.rating || "4.9"}</span>
                        </div>
                      </div>

                      <h3 className="card-title-text">{product.name}</h3>

                      <div className="card-price-row">
                        <strong className="card-current-price">
                          {Number(product.price).toLocaleString("vi-VN")}₫
                        </strong>
                        {product.original_price && (
                          <span className="card-orig-price">
                            {Number(product.original_price).toLocaleString("vi-VN")}₫
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW MODE */
            <div className="products-list-view">
              {paginatedProducts.map((product) => {
                const isFav = isWishlisted(product.id);
                const isJustAdded = addedIds.includes(product.id);
                const primaryImg =
                  product.primary_image ||
                  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";

                return (
                  <article
                    key={product.id}
                    className="catalog-product-card-list"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="list-card-img-box">
                      <img src={primaryImg} alt={product.name} loading="lazy" />
                      {product.badge && (
                        <div className="card-badge-pill">
                          <span>{product.badge}</span>
                        </div>
                      )}
                    </div>

                    <div className="list-card-info-box">
                      <div>
                        <div className="card-meta-row">
                          <span className="card-material-text">
                            {product.room_name} • {product.material}
                          </span>
                          <div className="card-rating-badge">
                            <Star size={14} fill="#c49a62" color="#c49a62" />
                            <span>{product.rating || "4.9"} ({product.reviews_count || 24})</span>
                          </div>
                        </div>

                        <h3 style={{ fontSize: "18px", margin: "6px 0", color: "#17241c" }}>
                          {product.name}
                        </h3>

                        <p className="list-card-desc">{product.description}</p>
                      </div>

                      <div className="list-card-bottom">
                        <div className="card-price-row">
                          <strong style={{ fontSize: "20px", color: "#1e3428" }}>
                            {Number(product.price).toLocaleString("vi-VN")}₫
                          </strong>
                          {product.original_price && (
                            <span className="card-orig-price">
                              {Number(product.original_price).toLocaleString("vi-VN")}₫
                            </span>
                          )}
                        </div>

                        <div className="list-action-btns">
                          <button
                            className={`card-wishlist-btn ${isFav ? "active" : ""}`}
                            style={{ position: "static" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product);
                            }}
                          >
                            <Heart
                              size={18}
                              fill={isFav ? "#e74c3c" : "none"}
                              color={isFav ? "#e74c3c" : "#3b473f"}
                            />
                          </button>

                          <button
                            className="list-add-cart-btn"
                            onClick={(e) => handleAddToCart(e, product, 1)}
                          >
                            {isJustAdded ? (
                              <>
                                <Check size={16} /> Đã thêm
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={16} /> Thêm vào giỏ
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* 6. PAGINATION */}
          {totalPages > 1 && (
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
          )}
        </main>
      </div>

      {/* QUICK VIEW POPUP MODAL */}
      {quickViewProduct && (
        <div
          className="quick-view-overlay"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="quick-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="quick-view-close-btn"
              onClick={() => setQuickViewProduct(null)}
            >
              <X size={20} />
            </button>

            <div className="quick-view-grid">
              {/* GALLERY */}
              <div className="quick-view-gallery">
                <div className="quick-view-main-img">
                  <img src={quickViewImage} alt={quickViewProduct.name} />
                </div>
                {quickViewProduct.images && quickViewProduct.images.length > 1 && (
                  <div className="quick-view-thumbs">
                    {quickViewProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        className={`quick-thumb-btn ${quickViewImage === img ? "active" : ""}`}
                        onClick={() => setQuickViewImage(img)}
                      >
                        <img src={img} alt={`Thumb ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* DETAILS */}
              <div className="quick-view-info">
                <span className="quick-view-category">
                  {quickViewProduct.room_name} • {quickViewProduct.style}
                </span>

                <h2 className="quick-view-title">{quickViewProduct.name}</h2>

                <div className="card-rating-badge" style={{ marginBottom: "12px" }}>
                  <Star size={15} fill="#c49a62" color="#c49a62" />
                  <span>{quickViewProduct.rating || "4.9"} ({quickViewProduct.reviews_count || 30} nhận xét)</span>
                </div>

                <div className="quick-view-price">
                  {Number(quickViewProduct.price).toLocaleString("vi-VN")}₫
                </div>

                <p className="quick-view-desc">{quickViewProduct.description}</p>

                <div className="quick-view-specs">
                  <div>
                    <span>Chất liệu:</span>
                    <strong>{quickViewProduct.material || "Gỗ tự nhiên"}</strong>
                  </div>
                  <div>
                    <span>Kích thước:</span>
                    <strong>{quickViewProduct.dimensions || "Tiêu chuẩn"}</strong>
                  </div>
                  <div>
                    <span>Bảo hành:</span>
                    <strong>{quickViewProduct.warranty || "3 năm"}</strong>
                  </div>
                  <div>
                    <span>Tình trạng:</span>
                    <strong style={{ color: "#27ae60" }}>
                      {quickViewProduct.stock > 0 ? "Còn hàng" : "Hết hàng"}
                    </strong>
                  </div>
                </div>

                <div className="quick-view-actions">
                  <div className="qty-picker">
                    <button
                      className="qty-btn"
                      onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                    >
                      -
                    </button>
                    <span className="qty-value">{quickViewQty}</span>
                    <button
                      className="qty-btn"
                      onClick={() => setQuickViewQty((q) => q + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="detail-add-cart-btn"
                    onClick={(e) => {
                      handleAddToCart(e, quickViewProduct, quickViewQty);
                      setQuickViewProduct(null);
                    }}
                  >
                    <ShoppingBag size={18} />
                    <span>Thêm vào giỏ</span>
                  </button>

                  <button
                    className="section-explore-btn"
                    onClick={() => {
                      navigate(`/products/${quickViewProduct.id}`);
                      setQuickViewProduct(null);
                    }}
                  >
                    <span>Chi tiết</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE FILTER DRAWER */}
      {mobileDrawerOpen && (
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
      )}
    </div>
  );
}

export default Products;
