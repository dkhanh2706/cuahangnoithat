import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Heart,
  Star,
  Check,
  Palette,
  Camera,
  Layers,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  Package,
  Compass,
} from "lucide-react";
import {
  getCollectionBySlug,
  getCollectionProducts,
  calculateCollectionBundlePricing,
  getRelatedCollections,
} from "../data/mockCollections";
import CollectionHotspots from "../components/collections/CollectionHotspots";
import CollectionLightbox from "../components/collections/CollectionLightbox";
import { useCart } from "../context/CartContext";
import "../styles/Collections.css";

function CollectionDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  const collection = useMemo(() => {
    return getCollectionBySlug(slug);
  }, [slug]);

  // Pricing & calculations
  const bundlePricing = useMemo(() => {
    return calculateCollectionBundlePricing(collection);
  }, [collection]);

  const allProducts = useMemo(() => {
    return getCollectionProducts(collection);
  }, [collection]);

  const relatedCollections = useMemo(() => {
    return getRelatedCollections(slug, 3);
  }, [slug]);

  // Product categories in this collection for quick filter
  const categories = useMemo(() => {
    if (!allProducts) return [];
    const map = new Map();
    allProducts.forEach((p) => {
      if (p.category && !map.has(p.category)) {
        map.set(p.category, p.category_name || p.category);
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [allProducts]);

  // Filtering & Sorting products inside collection
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [visibleCount, setVisibleCount] = useState(8);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Copy color hex state
  const [copiedHex, setCopiedHex] = useState(null);

  // Bundle adding animation state
  const [isAddingBundle, setIsAddingBundle] = useState(false);
  const [bundleAdded, setBundleAdded] = useState(false);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedCategory("all");
    setSortBy("default");
    setVisibleCount(8);
  }, [slug]);

  if (!collection) {
    return (
      <div className="collection-not-found">
        <div className="collections-container">
          <h2>Không tìm thấy bộ sưu tập</h2>
          <p>Bộ sưu tập bạn tìm kiếm không tồn tại hoặc đã được chuyển dời.</p>
          <Link to="/collections" className="empty-reset-btn">
            Xem tất cả bộ sưu tập
          </Link>
        </div>
      </div>
    );
  }

  // Filtered & Sorted products
  const displayedProducts = allProducts
    .filter((p) => {
      if (selectedCategory === "all") return true;
      return p.category === selectedCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      return 0;
    });

  const visibleProducts = displayedProducts.slice(0, visibleCount);

  const formatPrice = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  const handleCopyHex = (hex) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleAddBundleToCart = () => {
    if (!allProducts.length) return;
    setIsAddingBundle(true);

    // Add each product to cart
    allProducts.forEach((product) => {
      addToCart(product, 1);
    });

    setTimeout(() => {
      setIsAddingBundle(false);
      setBundleAdded(true);
      setTimeout(() => setBundleAdded(false), 3000);
    }, 600);
  };

  return (
    <div className="collection-detail-page">
      {/* 1. Breadcrumb */}
      <div className="detail-breadcrumb-bar">
        <div className="collections-container">
          <nav className="collections-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="bc-item">
              Trang chủ
            </Link>
            <ChevronRight size={14} className="bc-sep" />
            <Link to="/collections" className="bc-item">
              Bộ sưu tập
            </Link>
            <ChevronRight size={14} className="bc-sep" />
            <span className="bc-item current">{collection.title}</span>
          </nav>
        </div>
      </div>

      {/* 2 & 3. Banner phòng toàn chiều rộng + Điểm gắn sản phẩm (Hotspots) */}
      <section className="detail-hero-section">
        <div className="collections-container">
          <div className="detail-hero-header">
            <div className="detail-hero-meta">
              <span className="meta-badge style">{collection.style}</span>
              <span className="meta-badge room">{collection.room}</span>
              {collection.badge && (
                <span className="meta-badge offer">{collection.badge}</span>
              )}
            </div>

            <h1 className="detail-hero-title">{collection.title}</h1>
            <p className="detail-hero-tagline">{collection.tagline}</p>

            {/* Quick Summary Pill Bar */}
            <div className="detail-summary-strip">
              <div className="summary-item">
                <Package size={17} />
                <span>
                  <strong>{allProducts.length}</strong> Sản phẩm trong bộ
                </span>
              </div>
              <div className="summary-item">
                <Tag size={17} />
                <span>
                  Trọn bộ:{" "}
                  <strong className="text-gold">
                    {formatPrice(bundlePricing.bundlePrice)}
                  </strong>
                  <span className="original-strike">
                    {formatPrice(bundlePricing.totalPrice)}
                  </span>
                </span>
              </div>
              <div className="summary-item saving">
                <Sparkles size={17} />
                <span>
                  Tiết kiệm{" "}
                  <strong>{formatPrice(bundlePricing.savings)}</strong> khi mua trọn gói (-{bundlePricing.discountPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* 3. Interactive Room Image with Hotspots */}
          <div className="detail-interactive-room">
            <CollectionHotspots
              bannerImage={collection.banner_image}
              title={collection.title}
              hotspots={collection.hotspots}
              offerTag={collection.offer_tag}
            />
          </div>
        </div>
      </section>

      {/* 7. Khối "Mua Trọn Bộ Tiết Kiệm" (Combo Bundle Box) */}
      <section className="bundle-purchase-section">
        <div className="collections-container">
          <div className="bundle-purchase-card">
            <div className="bundle-card-left">
              <div className="bundle-header-tag">
                <Sparkles size={14} /> GÓI NỘI THẤT TRỌN BỘ
              </div>
              <h3>Sở hữu trọn vẹn không gian {collection.title}</h3>
              <p>
                Tiết kiệm thời gian phối đồ và chi phí với gói nội thất đồng bộ từ FurniHome. Cam kết chuẩn tỷ lệ, đồng nhất màu sắc và hỗ trợ lắp đặt miễn phí tại nhà.
              </p>
              <div className="bundle-perks-list">
                <span>
                  <CheckCircle2 size={16} /> Bảo hành chính hãng 5 năm
                </span>
                <span>
                  <CheckCircle2 size={16} /> Giao hàng & lắp đặt tận phòng
                </span>
                <span>
                  <CheckCircle2 size={16} /> Tư vấn 3D điều chỉnh kích thước
                </span>
              </div>
            </div>

            <div className="bundle-card-right">
              <div className="bundle-pricing-box">
                <span className="bundle-box-title">Tổng chi phí gói trọn bộ:</span>
                <div className="bundle-numbers">
                  <span className="final-price">
                    {formatPrice(bundlePricing.bundlePrice)}
                  </span>
                  <span className="strike-price">
                    {formatPrice(bundlePricing.totalPrice)}
                  </span>
                </div>
                <div className="discount-tag-pill">
                  Tiết kiệm {formatPrice(bundlePricing.savings)} (-{bundlePricing.discountPercent}%)
                </div>
              </div>

              <button
                className={`add-bundle-cart-btn ${bundleAdded ? "added" : ""}`}
                onClick={handleAddBundleToCart}
                disabled={isAddingBundle}
              >
                {bundleAdded ? (
                  <>
                    <Check size={18} />
                    <span>Đã thêm toàn bộ {allProducts.length} sản phẩm vào giỏ!</span>
                  </>
                ) : isAddingBundle ? (
                  <span>Đang xử lý gói nội thất...</span>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Thêm cả bộ vào giỏ ({allProducts.length} sản phẩm)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Giới thiệu phong cách & Cảm hứng thiết kế (Moodboard & Color Palette) */}
      <section className="design-story-section">
        <div className="collections-container">
          <div className="design-story-grid">
            <div className="story-content-col">
              <span className="story-eyebrow">
                <Palette size={16} /> CẢM HỨNG THIẾT KẾ
              </span>
              <h2>Triết lý & Ngôn ngữ không gian</h2>
              <p className="story-lead-p">{collection.design_story}</p>

              {/* Color Palette Swatches */}
              <div className="palette-wrapper">
                <span className="palette-header">
                  Bảng màu chủ đạo của bộ sưu tập (Click để sao chép mã màu):
                </span>
                <div className="palette-swatches">
                  {collection.color_palette?.map((color, idx) => (
                    <div
                      key={idx}
                      className="color-swatch-item"
                      onClick={() => handleCopyHex(color.hex)}
                      title={`Sao chép ${color.hex}`}
                    >
                      <div
                        className="color-circle"
                        style={{ backgroundColor: color.hex }}
                      >
                        {copiedHex === color.hex && (
                          <Check size={14} className="copied-check" />
                        )}
                      </div>
                      <span className="color-name">{color.name}</span>
                      <span className="color-hex">
                        {copiedHex === color.hex ? "Đã copy!" : color.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials Highlight */}
              {collection.materials && (
                <div className="materials-box">
                  <span className="materials-title">Vật liệu tinh tuyển:</span>
                  <div className="materials-tags">
                    {collection.materials.map((mat, i) => (
                      <span key={i} className="material-pill">
                        <Check size={13} /> {mat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Side Detail Images */}
            <div className="story-images-col">
              {collection.detail_images?.map((imgUrl, i) => (
                <div key={i} className={`story-img-card card-${i}`}>
                  <img
                    src={imgUrl}
                    alt={`${collection.title} góc chi tiết ${i + 1}`}
                    loading="lazy"
                  />
                  <div className="story-img-tag">Chi tiết #{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Thư viện ảnh bộ sưu tập (Masonry Gallery + Lightbox) */}
      {collection.gallery?.length > 0 && (
        <section className="gallery-section">
          <div className="collections-container">
            <div className="section-header-centered">
              <span className="section-eyebrow">
                <Camera size={16} /> GÓC PHÒNG THỰC TẾ
              </span>
              <h2>Thư Viện Ảnh Không Gian</h2>
              <p>Bấm vào từng bức ảnh để xem cận cảnh kích thước lớn trong lightbox.</p>
            </div>

            <div className="gallery-masonry-grid">
              {collection.gallery.map((img, index) => (
                <div
                  key={index}
                  className={`gallery-item item-${(index % 5) + 1}`}
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={img}
                    alt={`${collection.title} góc ${index + 1}`}
                    loading="lazy"
                  />
                  <div className="gallery-item-overlay">
                    <span className="zoom-label">Xem ảnh lớn</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Danh sách sản phẩm trong bộ sưu tập */}
      <section className="collection-products-section" id="products">
        <div className="collections-container">
          <div className="products-section-header">
            <div>
              <span className="section-eyebrow">
                <Layers size={16} /> DANH MỤC THIẾT KẾ
              </span>
              <h2>Các Sản Phẩm Trong Bộ Sưu Tập</h2>
            </div>

            {/* Quick Category Filter & Sort Toolbar */}
            <div className="products-filter-toolbar">
              <div className="category-chips-list">
                <button
                  className={`cat-chip-btn ${
                    selectedCategory === "all" ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory("all")}
                >
                  Tất cả ({allProducts.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    className={`cat-chip-btn ${
                      selectedCategory === cat.slug ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(cat.slug)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="sort-select-wrapper">
                <SlidersHorizontal size={14} className="sort-icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="product-sort-select"
                >
                  <option value="default">Sắp xếp: Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="name-asc">Tên: A - Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="products-cards-grid">
            {visibleProducts.map((product) => {
              const wishlisted = isWishlisted(product.id);

              return (
                <div key={product.id} className="coll-product-card">
                  <div className="product-media-box">
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={product.primary_image || product.images?.[0]}
                        alt={product.name}
                        loading="lazy"
                        className="product-main-thumb"
                      />
                    </Link>

                    {product.original_price > product.price && (
                      <span className="product-sale-pill">
                        -
                        {Math.round(
                          ((product.original_price - product.price) /
                            product.original_price) *
                            100
                        )}
                        %
                      </span>
                    )}

                    <button
                      className={`product-wishlist-toggle ${
                        wishlisted ? "active" : ""
                      }`}
                      onClick={() => toggleWishlist(product)}
                      title={
                        wishlisted ? "Bỏ yêu thích" : "Thêm vào yêu thích"
                      }
                    >
                      <Heart size={16} fill={wishlisted ? "#e11d48" : "none"} />
                    </button>
                  </div>

                  <div className="product-card-body">
                    <div className="product-meta-row">
                      <span className="product-category-name">
                        {product.category_name || product.category}
                      </span>
                      {product.rating && (
                        <span className="product-rating">
                          <Star size={13} fill="#facc15" color="#facc15" />
                          <span>{product.rating}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="product-name">
                      <Link to={`/products/${product.id}`}>
                        {product.name}
                      </Link>
                    </h4>

                    <div className="product-card-bottom">
                      <div className="product-price-block">
                        <span className="current-price">
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price > product.price && (
                          <span className="original-price">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>

                      <button
                        className="quick-cart-btn"
                        onClick={() => addToCart(product, 1)}
                        title="Thêm vào giỏ hàng"
                      >
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More Products Button if list is long */}
          {visibleCount < displayedProducts.length && (
            <div className="show-more-wrap">
              <button
                className="show-more-btn"
                onClick={() => setVisibleCount((prev) => prev + 4)}
              >
                <span>
                  Xem thêm ({displayedProducts.length - visibleCount} sản phẩm còn lại)
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 8. Bộ sưu tập liên quan (Related Collections) */}
      {relatedCollections.length > 0 && (
        <section className="related-collections-section">
          <div className="collections-container">
            <div className="section-header-row">
              <div>
                <span className="section-eyebrow">
                  <Compass size={16} /> GỢI Ý CHO BẠN
                </span>
                <h2>Khám Phá Các Bộ Sưu Tập Khác</h2>
              </div>
              <Link to="/collections" className="view-all-link">
                <span>Xem tất cả</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="related-cards-grid">
              {relatedCollections.map((col) => {
                const pricing = calculateCollectionBundlePricing(col);

                return (
                  <article
                    key={col.id}
                    className="related-col-card"
                    onClick={() => navigate(`/collections/${col.slug}`)}
                  >
                    <div className="related-img-wrap">
                      <img src={col.thumbnail} alt={col.title} loading="lazy" />
                      <span className="related-room-badge">{col.room}</span>
                      <span className="related-style-badge">{col.style}</span>
                    </div>

                    <div className="related-info-box">
                      <h4>{col.title}</h4>
                      <p>{col.description}</p>
                      <div className="related-pricing-row">
                        <span className="related-price">
                          Trọn bộ: <strong>{formatPrice(pricing.bundlePrice)}</strong>
                        </span>
                        <span className="related-explore-arrow">
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      <CollectionLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={collection.gallery || []}
        currentIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
        collectionTitle={collection.title}
      />
    </div>
  );
}

export default CollectionDetail;
