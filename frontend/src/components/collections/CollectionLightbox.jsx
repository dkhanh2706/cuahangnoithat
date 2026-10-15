import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

function CollectionLightbox({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onIndexChange,
  collectionTitle = "",
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        onIndexChange((currentIndex - 1 + images.length) % images.length);
      }
      if (e.key === "ArrowRight") {
        onIndexChange((currentIndex + 1) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handlePrev = (e) => {
    e.stopPropagation();
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    onIndexChange((currentIndex + 1) % images.length);
  };

  return (
    <div className="collection-lightbox-overlay" onClick={onClose}>
      {/* Lightbox Topbar */}
      <div className="lightbox-topbar" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-info">
          <span className="lightbox-title">{collectionTitle}</span>
          <span className="lightbox-counter">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <button className="lightbox-close-btn" onClick={onClose}>
          <X size={22} />
        </button>
      </div>

      {/* Main Large Display Area */}
      <div
        className="lightbox-main-stage"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="lightbox-nav-btn prev"
          onClick={handlePrev}
          aria-label="Ảnh trước"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="lightbox-image-container">
          <img
            key={currentImage}
            src={currentImage}
            alt={`${collectionTitle} góc phòng ${currentIndex + 1}`}
            className="lightbox-active-img animate-fade"
          />
        </div>

        <button
          className="lightbox-nav-btn next"
          onClick={handleNext}
          aria-label="Ảnh tiếp"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Thumbnails strip */}
      <div
        className="lightbox-thumbs-strip"
        onClick={(e) => e.stopPropagation()}
      >
        {images.map((img, idx) => (
          <button
            key={idx}
            className={`lightbox-thumb-btn ${idx === currentIndex ? "active" : ""}`}
            onClick={() => onIndexChange(idx)}
          >
            <img src={img} alt={`Thumbnail ${idx + 1}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default CollectionLightbox;
