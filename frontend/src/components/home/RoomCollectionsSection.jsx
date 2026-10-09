import { useNavigate } from "react-router-dom";
import "../../styles/home/RoomCollectionsSection.css";

const rooms = [
  {
    name: "Phòng khách",
    slug: "phong-khach",
    count: 24,
    className: "living-room",
  },
  {
    name: "Phòng ngủ",
    slug: "phong-ngu",
    count: 18,
    className: "bedroom",
  },
  {
    name: "Phòng bếp",
    slug: "phong-bep",
    count: 15,
    className: "kitchen",
  },
  {
    name: "Phòng làm việc",
    slug: "phong-lam-viec",
    count: 12,
    className: "workspace",
  },
  {
    name: "Phòng tắm",
    slug: "phong-tam",
    count: 8,
    className: "bathroom",
  },
];

function RoomCollectionsSection() {
  const navigate = useNavigate();

  return (
    <section className="room-section" id="room-collections">
      <div className="room-section-heading">
        <div>
          <p>BỘ SƯU TẬP THEO PHÒNG</p>

          <h2>Tìm cảm hứng cho từng không gian</h2>
        </div>
      </div>

      <div className="room-grid">
        {rooms.map((room, index) => (
          <article
            key={room.slug}
            className={[
              "room-card",
              room.className,
              index === 0 ? "room-card-large" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => navigate(`/collections/${room.slug}`)}
          >
            <div className="room-card-background" />

            <div className="room-card-overlay" />

            <div className="room-card-content">
              <div>
                <p>Bộ sưu tập</p>

                <h3>{room.name}</h3>
              </div>

              <div className="room-product-count">{room.count} sản phẩm</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RoomCollectionsSection;
