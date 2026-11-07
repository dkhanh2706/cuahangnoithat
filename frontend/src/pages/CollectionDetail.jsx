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
} from "../data/collections";
import CollectionHotspots from "../components/collections/CollectionHotspots";
import CollectionLightbox from "../components/collections/CollectionLightbox";
import { useCart } from "../context/CartContext";
import "../styles/Collections.css";
import useCollections from "../hooks/useCollections";
import { checkCollectionItems } from "../services/collectionCart";

function CollectionDetailContent() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { cart, addToCartBatch, showToast, toggleWishlist, isWishlisted } = useCart();
  const { collections, loading, error, reload } = useCollections();

  const collection = useMemo(() => {
    return getCollectionBySlug(slug, collections);
  }, [slug, collections]);

  // Pricing & calculations
  const bundlePricing = useMemo(() => {
    return calculateCollectionBundlePricing(collection);
  }, [collection]);

  const allProducts = useMemo(() => {
    return getCollectionProducts(collection);
  }, [collection]);

  const relatedCollections = useMemo(() => {
    return getRelatedCollections(slug, 3, collections);
  }, [slug, collections]);

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
  }, [slug]);

  if (loading) return <div className="collections-container" role="status">Đang tải bộ sưu tập...</div>;
  if (error) return <div className="collections-container" role="alert">{error} <button onClick={reload}>Thử lại</button></div>;
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

  const addProducts = async (products) => {
    if (!products.length || isAddingBundle) return;
    setIsAddingBundle(true);
    try {
      const items = await checkCollectionItems(products, cart);
      const result = addToCartBatch(items);
      if (!result.ok) throw new Error(result.error);
      setBundleAdded(products.length > 1);
      setTimeout(() => setBundleAdded(false), 3000);
      return true;
    } catch (failure) {
      showToast(typeof failure.response?.data?.detail === "string" ? failure.response.data.detail : failure.message, "error");
      reload();
      return false;
    } finally {
      setIsAddingBundle(false);
    }
  };
  const handleAddBundleToCart = () => addProducts(allProducts);

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
                    {allProducts.length ? formatPrice(bundlePricing.bundlePrice) : "Đang cập nhật sản phẩm"}
                  </strong>
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
              products={allProducts}
              onAdd={product => addProducts([product])}
              busy={isAddingBundle}
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
                Chọn nhanh các sản phẩm thật trong bộ sưu tập. Tổng giá là tổng từng món; mã ưu đãi được áp dụng tại giỏ hàng. Giá và tồn kho được kiểm tra lại trước khi thêm.
              </p>
              <div className="bundle-perks-list">
                <span>
                  <CheckCircle2 size={16} /> Bảo hành theo từng sản phẩm
                </span>
                <span>
                  <CheckCircle2 size={16} /> Thanh toán khi nhận hàng
                </span>
                <span>
                  <CheckCircle2 size={16} /> Tư vấn phối nội thất
                </span>
              </div>
            </div>

            <div className="bundle-card-right">
              <div className="bundle-pricing-box">
                <span className="bundle-box-title">Tổng chi phí gói trọn bộ:</span>
                <div className="bundle-numbers">
                  <span className="final-price">
                    {allProducts.length ? formatPrice(bundlePricing.bundlePrice) : "Chưa có sản phẩm"}
                  </span>
                </div>
              </div>

              <button
                className={`add-bundle-cart-btn ${bundleAdded ? "added" : ""}`}
                onClick={handleAddBundleToCart}
                disabled={isAddingBundle || !allProducts.length || allProducts.some(product => product.stock_quantity < 1)}
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
              {allProducts.some(product => product.stock_quantity < 1) && <p role="status">Một số món đang hết hàng. Bạn có thể chọn các món còn hàng ở danh sách bên dưới.</p>}
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
          {!allProducts.length && <p role="status">Bộ sưu tập đang được cập nhật. <Link to="/products">Xem các sản phẩm hiện có</Link>.</p>}
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
                        onClick={() => addProducts([product])}
                        disabled={isAddingBundle || product.stock_quantity < 1}
                        title="Thêm vào giỏ hàng"
                      >
                        {product.stock_quantity < 1 ? "Hết hàng" : <ShoppingBag size={16} />}
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

export default function CollectionDetail() {
  const { slug } = useParams();
  return <CollectionDetailContent key={slug} />;
}
