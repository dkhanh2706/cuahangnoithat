import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import "../../styles/home/HeroSlider.css";

const slides = [
  {
    id: 1,
    image: "/images/home/hero-1.jpg",
    eyebrow: "BỘ SƯU TẬP MỚI",
    title: "Không gian sống mang dấu ấn riêng.",
    description: "Những thiết kế tinh tế dành cho ngôi nhà hiện đại.",
  },
  {
    id: 2,
    image: "/images/home/hero-2.jpg",
    eyebrow: "PHÒNG KHÁCH",
    title: "Nơi mọi câu chuyện bắt đầu.",
    description: "Khám phá nội thất phòng khách hiện đại và đầy cảm hứng.",
  },
  {
    id: 3,
    image: "/images/home/hero-3.jpg",
    eyebrow: "PHÒNG NGỦ",
    title: "Một khoảng riêng để thật sự nghỉ ngơi.",
    description: "Tạo nên không gian yên bình bằng những lựa chọn tinh tế.",
  },
  {
    id: 4,
    image: "/images/home/hero-4.jpg",
    eyebrow: "FURNIHOME",
    title: "Đơn giản. Tinh tế. Khác biệt.",
    description: "Nội thất phù hợp với phong cách sống của chính bạn.",
  },
];

function HeroSlider() {
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);

  const touchStartX = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) {
      return;
    }

    const endX = event.changedTouches[0].clientX;

    const distance = touchStartX.current - endX;

    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        nextSlide();
      } else {
        previousSlide();
      }
    }

    touchStartX.current = null;
  };

  return (
    <section
      className="hero-slider"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={
            currentSlide === index ? "hero-slide active" : "hero-slide"
          }
          style={{
            backgroundImage: `
              linear-gradient(
                90deg,
                rgba(16, 22, 18, 0.70),
                rgba(16, 22, 18, 0.10)
              ),
              url("${slide.image}")
            `,
          }}
        >
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="hero-eyebrow">{slide.eyebrow}</span>

              <h1>{slide.title}</h1>

              <p>{slide.description}</p>

              <div className="hero-buttons">
                <button
                  className="hero-primary"
                  onClick={() =>
                    document
                      .getElementById("featured-collections")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                >
                  Khám phá bộ sưu tập
                </button>

                <button
                  className="hero-outline"
                  onClick={() => navigate("/products")}
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        className="hero-arrow hero-arrow-left"
        onClick={previousSlide}
        aria-label="Slide trước"
      >
        ‹
      </button>

      <button
        className="hero-arrow hero-arrow-right"
        onClick={nextSlide}
        aria-label="Slide sau"
      >
        ›
      </button>

      <div className="hero-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={currentSlide === index ? "active" : ""}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroSlider;
