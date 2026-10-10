import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Shield, Award } from "lucide-react";
import "../../styles/home/HeroSlider.css";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=85",
    eyebrow: "BỘ SƯU TẬP XUÂN HÈ 2026",
    title: "Không gian sống mang dấu ấn riêng biệt.",
    description: "Những tuyệt tác nội thất gỗ sồi tự nhiên tinh tế, hòa quyện giữa chủ nghĩa tối giản Bắc Âu và nét ấm cúng cho ngôi nhà hiện đại.",
    tag: "Phong cách Scandinavian",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1920&q=85",
    eyebrow: "PHÒNG KHÁCH ĐƯƠNG ĐẠI",
    title: "Nơi mọi câu chuyện đong đầy cảm hứng.",
    description: "Khám phá bộ sưu tập sofa da bò Ý nhập khẩu và bàn trà mặt đá cẩm thạch nguyên khối được chế tác thủ công hoàn mỹ.",
    tag: "Độc bản & Sang trọng",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1920&q=85",
    eyebrow: "PHÒNG NGỦ YÊN BÌNH",
    title: "Khoảng lặng để tâm hồn thật sự nghỉ ngơi.",
    description: "Thiết kế giường ngủ phong cách Zen Nhật Bản mang lại giấc ngủ trọn vẹn với chất liệu gỗ tự nhiên không mùi, an toàn tuyệt đối.",
    tag: "Phong cách Japandi",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1920&q=85",
    eyebrow: "KHÔNG GIAN ẨM THỰC",
    title: "Ấm áp từng khoảnh khắc sum vầy.",
    description: "Bàn ăn thông minh mở rộng và ghế ăn công thái học ôm trọn vóc dáng, nâng niu từng bữa cơm đầm ấm của gia đình.",
    tag: "Thiết kế Đa năng",
  },
];

function HeroSlider() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const distance = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(distance) > 40) {
      if (distance > 0) nextSlide();
      else previousSlide();
    }
    touchStartX.current = null;
  };

  return (
    <section
      className="hero-slider"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => {
        const isActive = currentSlide === index;
        return (
          <div
            key={slide.id}
            className={`hero-slide ${isActive ? "active" : ""}`}
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(14, 23, 18, 0.85) 0%, rgba(14, 23, 18, 0.45) 55%, rgba(14, 23, 18, 0.1) 100%), url("${slide.image}")`,
            }}
          >
            <div className="hero-inner">
              <div className="hero-copy">
                <div className="hero-tag-row">
                  <span className="hero-eyebrow">
                    <Sparkles size={13} className="eyebrow-icon" />
                    {slide.eyebrow}
                  </span>
                  <span className="hero-badge">{slide.tag}</span>
                </div>

                <h1 className="hero-title">{slide.title}</h1>

                <p className="hero-description">{slide.description}</p>

                <div className="hero-buttons">
                  <button
                    className="hero-primary-btn"
                    onClick={() =>
                      document.getElementById("featured-collections")?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                  >
                    <span>Khám phá bộ sưu tập</span>
                    <ArrowRight size={17} />
                  </button>

                  <button
                    className="hero-outline-btn"
                    onClick={() => navigate("/products")}
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>

                {/* Trust mini badges */}
                <div className="hero-trust-row">
                  <div className="hero-trust-item">
                    <Shield size={15} />
                    <span>Bảo hành chính hãng 5 năm</span>
                  </div>
                  <div className="hero-trust-item">
                    <Award size={15} />
                    <span>Gỗ tự nhiên tuyển chọn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows with Glassmorphism */}
      <button
        className="hero-arrow hero-arrow-left"
        onClick={previousSlide}
        aria-label="Slide trước"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        className="hero-arrow hero-arrow-right"
        onClick={nextSlide}
        aria-label="Slide tiếp theo"
      >
        <ChevronRight size={24} />
      </button>

      {/* Modern Slide Indicators with Progress Animation */}
      <div className="hero-indicators-container">
        {slides.map((slide, index) => {
          const isActive = currentSlide === index;
          return (
            <button
              key={slide.id}
              className={`hero-indicator-bar ${isActive ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Chuyển đến Slide ${index + 1}`}
            >
              <div
                className="hero-progress-fill"
                style={{
                  animationDuration: isActive && !isPaused ? "6s" : "0s",
                }}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default HeroSlider;
