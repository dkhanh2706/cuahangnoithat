import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Compass,
  Sparkles,
  ArrowRight,
  Search,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  X,
  Package,
} from "lucide-react";
import {
  COLLECTION_ROOMS,
  COLLECTION_STYLES,
  getFeaturedCollection,
  calculateCollectionBundlePricing,
} from "../data/collections";
import "../styles/Collections.css";
import useCollections from "../hooks/useCollections";

function Collections() {
  const { collections, loading: catalogLoading, error, reload } = useCollections();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeRoom = searchParams.get("room") || "all";
  const activeStyle = searchParams.get("style") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const loading = catalogLoading;

  const featuredCollection = useMemo(() => {
    return getFeaturedCollection(collections);
  }, [collections]);

  const featuredPricing = useMemo(() => {
    return calculateCollectionBundlePricing(featuredCollection);
  }, [featuredCollection]);

  const handleRoomSelect = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug === "all") {
      newParams.delete("room");
    } else {
      newParams.set("room", slug);
    }
    setSearchParams(newParams);
  };

  const handleStyleSelect = (style) => {
    const newParams = new URLSearchParams(searchParams);
    if (style === "all") {
      newParams.delete("style");
    } else {
      newParams.set("style", style);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  // Filtered collections
  const filteredCollections = useMemo(() => {
    return collections.filter((col) => {
      const matchRoom =
        activeRoom === "all" || col.room_slug === activeRoom;
      const matchStyle =
        activeStyle === "all" || col.style === activeStyle;
      const matchQuery =
        !searchQuery.trim() ||
        col.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        col.description.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        col.room.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        col.style.toLowerCase().includes(searchQuery.trim().toLowerCase());

      return matchRoom && matchStyle && matchQuery;
    });
  }, [collections, activeRoom, activeStyle, searchQuery]);

  const formatPrice = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  if (catalogLoading) return <div className="collections-container" role="status">Đang tải bộ sưu tập...</div>;
  if (error) return <div className="collections-container" role="alert">{error} <button onClick={reload}>Thử lại</button></div>;
  return (
    <div className="collections-page">
      {/* 1. Breadcrumb & Page Header */}
      <div className="collections-top-bar">
        <div className="collections-container">
          <nav className="collections-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="bc-item">
              Trang chủ
            </Link>
            <ChevronRight size={14} className="bc-sep" />
            <span className="bc-item current">Bộ sưu tập</span>
          </nav>

          <div className="collections-title-wrapper">
            <div className="collections-eyebrow">
              <Compass size={16} />
              <span>KHÔNG GIAN SỐNG NGHỆ THUẬT</span>
            </div>
            <h1 className="collections-main-heading">
              Bộ Sưu Tập Không Gian Sống
            </h1>
            <p className="collections-lead-text">
              Chọn không gian bạn muốn thiết kế. Mỗi bộ sưu tập là một bản giao hưởng trọn vẹn giữa tỷ lệ, màu sắc, công năng và chất liệu cao cấp.
            </p>
          </div>
        </div>
      </div>

      <div className="collections-container">
        {/* 4. Bộ sưu tập nổi bật (Hero Featured Collection Banner) */}
        {featuredCollection && activeRoom === "all" && activeStyle === "all" && !searchQuery && (
          <section className="featured-hero-block animate-fade">
            <div className="featured-hero-card">
              <div className="featured-hero-img-wrap">
                <img
                  src={featuredCollection.banner_image}
                  alt={featuredCollection.title}
                  className="featured-hero-img"
                />
                <div className="featured-hero-gradient" />
              </div>

              <div className="featured-hero-badge-pill">
                <Sparkles size={14} />
                <span>BỘ SƯU TẬP TIÊU BIỂU 2026</span>
              </div>

              <div className="featured-hero-content">
                <div className="featured-hero-tags">
                  <span className="style-tag">{featuredCollection.style}</span>
                  <span className="room-tag">{featuredCollection.room}</span>
                  <span className="offer-tag">{featuredCollection.offer_tag}</span>
                </div>

                <h2 className="featured-hero-title">
                  {featuredCollection.title}
                </h2>

                <p className="featured-hero-desc">
                  {featuredCollection.description}
                </p>

                <div className="featured-hero-pricing">
                  <div className="price-item">
                    <span className="price-label">Tổng giá sản phẩm hiện tại:</span>
                    <span className="price-val highlight">
                      {featuredPricing.productsCount ? formatPrice(featuredPricing.bundlePrice) : "Đang cập nhật sản phẩm"}
                    </span>
                  </div>

                  <div className="meta-pill">
                    <Package size={15} />
                    <span>{featuredCollection.product_ids?.length || 6} sản phẩm đồng bộ</span>
                  </div>
                </div>

                <div className="featured-hero-actions">
                  <button
                    className="explore-hero-btn"
                    onClick={() => navigate(`/collections/${featuredCollection.slug}`)}
                  >
                    <span>Khám phá bộ sưu tập ngay</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. Thanh lọc nhanh (Filter & Chips) */}
        <section className="collections-filter-section">
          {/* Room Filter Chips */}
          <div className="filter-chips-header">
            <span className="filter-label">
              <Layers size={16} /> Chọn không gian phòng:
            </span>
            <span className="filter-count-badge">
              {filteredCollections.length} bộ sưu tập
            </span>
          </div>

          <div className="filter-chips-scroll">
            {COLLECTION_ROOMS.map((room) => {
              const count =
                room.id === "all"
                  ? collections.length
                  : collections.filter((c) => c.room_slug === room.slug).length;

              return (
                <button
                  key={room.id}
                  className={`room-chip-btn ${
                    activeRoom === room.slug ? "active" : ""
                  }`}
                  onClick={() => handleRoomSelect(room.slug)}
                >
                  <span>{room.name}</span>
                  <span className="chip-counter">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-toolbar: Filter by Style + Live Search */}
          <div className="filter-sub-bar">
            <div className="style-filter-group">
              <span className="style-filter-title">
                <SlidersHorizontal size={15} /> Phong cách:
              </span>
              <div className="style-pills-list">
                {COLLECTION_STYLES.map((st) => (
                  <button
                    key={st.id}
                    className={`style-pill-btn ${
                      activeStyle === st.id ? "active" : ""
                    }`}
                    onClick={() => handleStyleSelect(st.id)}
                  >
                    {st.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="collections-search-box">
              <Search size={17} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm bộ sưu tập, phòng, phong cách..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Active Filters Bar if any */}
        {(activeRoom !== "all" || activeStyle !== "all" || searchQuery) && (
          <div className="active-filters-bar animate-fade">
            <span className="active-filter-label">Đang lọc theo:</span>
            {activeRoom !== "all" && (
              <span className="active-tag">
                Phòng: {COLLECTION_ROOMS.find((r) => r.slug === activeRoom)?.name}
                <button onClick={() => handleRoomSelect("all")}>
                  <X size={12} />
                </button>
              </span>
            )}
            {activeStyle !== "all" && (
              <span className="active-tag">
                Phong cách: {activeStyle}
                <button onClick={() => handleStyleSelect("all")}>
                  <X size={12} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="active-tag">
                Từ khóa: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")}>
                  <X size={12} />
                </button>
              </span>
            )}
            <button className="clear-all-link" onClick={handleClearFilters}>
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

        {/* 3 & 5. Lưới bộ sưu tập (Collection Grid & Skeletons) */}
        <section className="collections-grid-section">
          {loading ? (
            /* 5. Skeleton Loading State */
            <div className="collections-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="collection-card-skeleton">
                  <div className="skeleton-img" />
                  <div className="skeleton-info">
                    <div className="skeleton-line sm" />
                    <div className="skeleton-line lg" />
                    <div className="skeleton-line md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCollections.length === 0 ? (
            /* 5. Empty State */
            <div className="collections-empty-state animate-fade">
              <div className="empty-icon-box">
                <Compass size={48} />
              </div>
              <h3>Không tìm thấy bộ sưu tập phù hợp</h3>
              <p>
                Rất tiếc chúng tôi chưa tìm thấy bộ sưu tập nào theo tiêu chí tìm kiếm của bạn. Hãy thử thay đổi bộ lọc hoặc xem tất cả bộ sưu tập.
              </p>
              <button
                className="empty-reset-btn"
                onClick={handleClearFilters}
              >
                <span>Xem tất cả bộ sưu tập</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            /* 3. Lưới thẻ ảnh lớn (3 cột desktop, 2 tablet, 1 mobile) */
            <div className="collections-grid">
              {filteredCollections.map((col, idx) => {
                const pricing = calculateCollectionBundlePricing(col);

                return (
                  <article
                    key={col.id}
                    className="collection-room-card"
                    onClick={() => navigate(`/collections/${col.slug}`)}
                  >
                    {/* Fixed aspect ratio large image */}
                    <div className="card-media-wrapper">
                      <img
                        src={col.thumbnail || col.banner_image}
                        alt={col.title}
                        loading={idx < 4 ? "eager" : "lazy"}
                        className="card-room-image"
                      />
                      <div className="card-glass-overlay" />

                      {/* Top Badges */}
                      <div className="card-top-badges">
                        <span className="card-style-pill">{col.style}</span>
                        {col.badge && (
                          <span className="card-promo-pill">{col.badge}</span>
                        )}
                      </div>

                      {/* Hover Overlay with Description & Discover Button */}
                      <div className="card-hover-overlay">
                        <p className="hover-description">{col.description}</p>
                        <div className="hover-cta-row">
                          <span className="hover-explore-text">
                            Khám phá không gian
                          </span>
                          <span className="hover-explore-icon">
                            <ArrowRight size={18} />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content Footer */}
                    <div className="card-details-footer">
                      <div className="card-room-meta">
                        <span className="room-name">{col.room}</span>
                        <span className="dot-sep">•</span>
                        <span className="item-count">
                          {col.product_ids?.length || 0} sản phẩm
                        </span>
                      </div>

                      <h3 className="card-collection-title">
                        {col.title}
                      </h3>

                      <div className="card-pricing-row">
                        <div>
                          <span className="bundle-tag">Tổng giá hiện tại:</span>
                          <span className="bundle-price">
                            {pricing.productsCount ? formatPrice(pricing.bundlePrice) : "Đang cập nhật"}
                          </span>
                        </div>

                        <Link
                          to={`/collections/${col.slug}`}
                          className="card-action-arrow"
                          onClick={(e) => e.stopPropagation()}
                          title="Xem chi tiết bộ sưu tập"
                        >
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Collections;
