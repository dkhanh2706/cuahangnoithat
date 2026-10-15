import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Check,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { MOCK_PRODUCTS } from "../../data/mockProducts";

function CollectionHotspots({
  bannerImage,
  title,
  hotspots = [],
  offerTag,
}) {
  const [activeHotspotId, setActiveHotspotId] = useState(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [mobileDrawerProduct, setMobileDrawerProduct] = useState(null);
  const [addedIds, setAddedIds] = useState([]);
  const containerRef = useRef(null);
  const { addToCart } = useCart();

  // Close popup when clicking outside on desktop
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !e.target.closest(".hotspot-popover")
      ) {
        setActiveHotspotId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const formatPrice = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  const handleHotspotClick = (hotspot, e) => {
    e.stopPropagation();
    const product = MOCK_PRODUCTS.find((p) => p.id === hotspot.product_id);

    // On mobile screens (< 768px), open bottom drawer for ergonomic tapping
    if (window.innerWidth < 768) {
      setMobileDrawerProduct(product);
      setActiveHotspotId(hotspot.id);
    } else {
      setActiveHotspotId((prev) => (prev === hotspot.id ? null : hotspot.id));
    }
  };

  const handleAddToCart = (product, e) => {
    e?.stopPropagation();
    if (!product) return;
    addToCart(product, 1);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 2000);
  };

  return (
    <div className="collection-hotspot-container" ref={containerRef}>
      {/* Interactive Room Image */}
      <div className="hotspot-image-wrapper">
        <img
          src={bannerImage}
          alt={title}
          className="hotspot-main-image"
          loading="eager"
        />

        <div className="hotspot-overlay-gradient" />

        {/* Toggle hotspot visibility pill */}
        <button
          className="hotspot-toggle-btn"
          onClick={() => setShowHotspots(!showHotspots)}
          title={showHotspots ? "Ẩn điểm sản phẩm" : "Hiện điểm sản phẩm"}
        >
          {showHotspots ? <EyeOff size={15} /> : <Eye size={15} />}
          <span>{showHotspots ? "Ẩn điểm gắn sản phẩm" : "Hiện điểm gắn sản phẩm"}</span>
        </button>

        {offerTag && (
          <div className="hotspot-offer-badge">
            <Sparkles size={14} />
            <span>{offerTag}</span>
          </div>
        )}

        {/* Interactive Hotspot Pins */}
        {showHotspots &&
          hotspots.map((hotspot, index) => {
            const product = MOCK_PRODUCTS.find((p) => p.id === hotspot.product_id);
            const isActive = activeHotspotId === hotspot.id;

            return (
              <div
                key={hotspot.id}
                className={`hotspot-pin-wrapper ${isActive ? "active" : ""}`}
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                }}
              >
                {/* Glowing Pulsing Pin */}
                <button
                  className="hotspot-pulse-btn"
                  onClick={(e) => handleHotspotClick(hotspot, e)}
                  aria-label={`Sản phẩm: ${product?.name || hotspot.label}`}
                >
                  <span className="pulse-ring" />
                  <span className="pulse-dot">{index + 1}</span>
                </button>

                {/* Desktop Floating Card Popover */}
                {isActive && product && (
                  <div
                    className="hotspot-popover animate-scale-up"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      // Adjust position if pin is close to edges
                      left: hotspot.x > 70 ? "auto" : "50%",
                      right: hotspot.x > 70 ? "0" : "auto",
                      transform:
                        hotspot.x > 70
                          ? "translateY(12px)"
                          : "translateX(-50%) translateY(12px)",
                    }}
                  >
                    <button
                      className="popover-close-btn"
                      onClick={() => setActiveHotspotId(null)}
                    >
                      <X size={14} />
                    </button>

                    <div className="popover-content">
                      <div className="popover-thumb">
                        <img
                          src={product.primary_image || product.images?.[0]}
                          alt={product.name}
                        />
                      </div>
                      <div className="popover-info">
                        <span className="popover-category">
                          {product.category_name || product.room_name}
                        </span>
                        <h4 className="popover-title">{product.name}</h4>
                        <div className="popover-price-row">
                          <span className="popover-price">
                            {formatPrice(product.price)}
                          </span>
                          {product.original_price > product.price && (
                            <span className="popover-original-price">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                        </div>

                        <div className="popover-actions">
                          <Link
                            to={`/products/${product.id}`}
                            className="popover-view-btn"
                          >
                            <span>Chi tiết</span>
                            <ArrowRight size={13} />
                          </Link>

                          <button
                            className="popover-cart-btn"
                            onClick={(e) => handleAddToCart(product, e)}
                            title="Thêm nhanh vào giỏ"
                          >
                            {addedIds.includes(product.id) ? (
                              <Check size={14} />
                            ) : (
                              <ShoppingBag size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Mobile Drawer Sheet when tapping pin on small screen */}
      {mobileDrawerProduct && (
        <div
          className="hotspot-mobile-backdrop"
          onClick={() => setMobileDrawerProduct(null)}
        >
          <div
            className="hotspot-mobile-drawer animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-handle" />
            <div className="mobile-drawer-header">
              <span className="mobile-drawer-tag">SẢN PHẨM TRÊN ẢNH</span>
              <button
                className="mobile-drawer-close"
                onClick={() => setMobileDrawerProduct(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mobile-drawer-body">
              <img
                src={
                  mobileDrawerProduct.primary_image ||
                  mobileDrawerProduct.images?.[0]
                }
                alt={mobileDrawerProduct.name}
                className="mobile-drawer-img"
              />
              <div className="mobile-drawer-details">
                <h4>{mobileDrawerProduct.name}</h4>
                <div className="mobile-drawer-prices">
                  <span className="current-price">
                    {formatPrice(mobileDrawerProduct.price)}
                  </span>
                  {mobileDrawerProduct.original_price >
                    mobileDrawerProduct.price && (
                    <span className="old-price">
                      {formatPrice(mobileDrawerProduct.original_price)}
                    </span>
                  )}
                </div>
                <p className="mobile-drawer-desc">
                  {mobileDrawerProduct.description?.slice(0, 100)}...
                </p>
              </div>
            </div>

            <div className="mobile-drawer-footer">
              <Link
                to={`/products/${mobileDrawerProduct.id}`}
                className="mobile-view-link"
                onClick={() => setMobileDrawerProduct(null)}
              >
                Xem chi tiết
              </Link>
              <button
                className="mobile-add-btn"
                onClick={() => handleAddToCart(mobileDrawerProduct)}
              >
                <ShoppingBag size={16} />
                <span>
                  {addedIds.includes(mobileDrawerProduct.id)
                    ? "Đã thêm vào giỏ!"
                    : "Thêm vào giỏ hàng"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectionHotspots;
