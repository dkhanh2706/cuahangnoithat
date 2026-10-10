import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import "../../styles/home/FeaturedCollections.css";

function FeaturedCollections() {
  const navigate = useNavigate();

  return (
    <section className="featured-collection-section" id="featured-collections">
      <div className="collection-header">
        <span className="collection-eyebrow">
          <Sparkles size={14} /> BỘ SƯU TẬP TIÊU BIỂU
        </span>
        <h2>Phong cách kiến tạo cảm xúc cho không gian sống.</h2>
        <p className="collection-subtitle">
          Sự kết hợp hài hòa giữa công năng hiện đại và vẻ đẹp mộc mạc của vật liệu tự nhiên, mang đến hơi thở thư thái cho tổ ấm của bạn.
        </p>
      </div>

      <div className="collection-showcase">
        {/* MAIN LARGE CARD */}
        <div
          className="collection-main"
          onClick={() => navigate("/products?category=1")}
        >
          <div className="collection-img-box">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
              alt="Phong cách Bắc Âu Scandinavian"
              loading="lazy"
            />
            <div className="collection-main-overlay" />
          </div>

          <div className="collection-tag">
            <span>Bộ sưu tập 2026</span>
          </div>

          <div className="collection-main-copy">
            <span className="collection-label">SCANDINAVIAN LIVING</span>
            <h3>Phong cách Bắc Âu Thuần Khiết</h3>
            <p>
              Tối giản nhưng ấm áp, đề cao ánh sáng tự nhiên cùng các chi tiết gỗ sồi sáng màu và vải dệt thủ công.
            </p>
            <div className="collection-perks">
              <span className="perk-item">
                <CheckCircle2 size={14} /> 100% Gỗ sồi tự nhiên
              </span>
              <span className="perk-item">
                <CheckCircle2 size={14} /> Đệm bọc linen tháo giặt
              </span>
            </div>
          </div>
        </div>

        {/* SIDE CARDS */}
        <div className="collection-side">
          <div
            className="collection-mini"
            onClick={() => navigate("/products?category=2")}
          >
            <img
              src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
              alt="Phong cách Japandi"
              loading="lazy"
            />
            <div className="mini-overlay" />
            <div className="mini-info">
              <span>JAPANDI STYLE</span>
              <h4>Giao thoa Nhật - Bắc Âu</h4>
            </div>
          </div>

          <div
            className="collection-mini"
            onClick={() => navigate("/products?category=3")}
          >
            <img
              src="https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80"
              alt="Phong cách Tối giản Hiện đại"
              loading="lazy"
            />
            <div className="mini-overlay" />
            <div className="mini-info">
              <span>MINIMALIST DINING</span>
              <h4>Không gian Bếp Đương đại</h4>
            </div>
          </div>

          <div className="collection-description">
            <span className="philosophy-tag">TRIẾT LÝ THIẾT KẾ</span>
            <h3>Ít hơn, nhưng tốt hơn và bền lâu hơn.</h3>
            <p>
              Mỗi sản phẩm tại FurniHome là một bản giao hưởng giữa tỷ lệ hoàn hảo, vật liệu thân thiện môi trường và giá trị sử dụng lâu dài qua năm tháng.
            </p>

            <button
              className="collection-cta-btn"
              onClick={() => navigate("/products")}
            >
              <span>Khám phá toàn bộ danh mục</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedCollections;
