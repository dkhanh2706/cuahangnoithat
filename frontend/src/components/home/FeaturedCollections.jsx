import { useNavigate } from "react-router-dom";

import "../../styles/home/FeaturedCollections.css";

function FeaturedCollections() {
  const navigate = useNavigate();

  return (
    <section className="featured-collection-section" id="featured-collections">
      <div className="home-section-heading">
        <span>BỘ SƯU TẬP NỔI BẬT</span>

        <h2>Phong cách tạo nên cảm xúc cho không gian.</h2>
      </div>

      <div className="collection-showcase">
        <div
          className="collection-main"
          onClick={() => navigate("/collections/bac-au")}
        >
          <img
            src="/images/collections/scandinavian-main.jpg"
            alt="Phong cách Bắc Âu"
          />

          <div className="collection-main-overlay" />

          <div className="collection-main-copy">
            <span>BỘ SƯU TẬP</span>

            <h3>Phong cách Bắc Âu</h3>

            <p>Sự kết hợp giữa tối giản, ấm áp và tiện nghi.</p>
          </div>
        </div>

        <div className="collection-side">
          <div className="collection-mini">
            <img
              src="/images/collections/minimal-1.jpg"
              alt="Không gian tối giản"
            />
          </div>

          <div className="collection-mini">
            <img
              src="/images/collections/minimal-2.jpg"
              alt="Phong cách tối giản"
            />
          </div>

          <div className="collection-description">
            <span>PHONG CÁCH TỐI GIẢN</span>

            <h3>Ít hơn, nhưng tốt hơn.</h3>

            <p>
              Những đường nét tinh gọn, bảng màu nhẹ nhàng và công năng được đặt
              lên hàng đầu.
            </p>

            <button onClick={() => navigate("/collections")}>
              Xem toàn bộ bộ sưu tập
              <b>→</b>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedCollections;
