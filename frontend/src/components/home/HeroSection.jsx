import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/home/HeroSection.css";

function HeroSection() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const value = keyword.trim();

    if (!value) {
      return;
    }

    navigate(`/products?search=${encodeURIComponent(value)}`);
  };

  return (
    <section className="home-hero">
      <div className="home-hero-content">
        <p className="home-hero-label">KHÔNG GIAN SỐNG HIỆN ĐẠI</p>

        <h1>
          Nội thất tạo nên
          <br />
          <span>chất riêng của bạn.</span>
        </h1>

        <p className="home-hero-description">
          Khám phá những sản phẩm nội thất hiện đại, tinh tế và phù hợp cho từng
          không gian sống.
        </p>

        {/* SEARCH */}

        <form className="home-search" onSubmit={handleSearch}>
          <span className="home-search-icon">⌕</span>

          <input
            type="text"
            placeholder="Tìm sofa, bàn, ghế..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />

          <button type="submit">Tìm kiếm</button>
        </form>

        <div className="home-hero-actions">
          <button
            className="home-primary-btn"
            onClick={() => navigate("/products")}
          >
            Khám phá sản phẩm
          </button>

          <button
            className="home-secondary-btn"
            onClick={() => {
              document.getElementById("room-collections")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            Xem bộ sưu tập
          </button>
        </div>
      </div>

      <div className="home-hero-visual">
        <div className="home-room">
          <div className="home-room-frame" />

          <div className="home-room-sofa">
            <div />
            <div />
          </div>

          <div className="home-room-table" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
