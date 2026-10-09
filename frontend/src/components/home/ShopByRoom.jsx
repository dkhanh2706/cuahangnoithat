import { useNavigate } from "react-router-dom";

import "../../styles/home/ShopByRoom.css";

const rooms = [
  {
    name: "Phòng khách",
    slug: "phong-khach",
    count: 24,
    image: "/images/rooms/living-room.jpg",
  },
  {
    name: "Phòng ngủ",
    slug: "phong-ngu",
    count: 18,
    image: "/images/rooms/bedroom.jpg",
  },
  {
    name: "Phòng bếp",
    slug: "phong-bep",
    count: 15,
    image: "/images/rooms/kitchen.jpg",
  },
  {
    name: "Phòng làm việc",
    slug: "phong-lam-viec",
    count: 12,
    image: "/images/rooms/workspace.jpg",
  },
  {
    name: "Phòng ăn",
    slug: "phong-an",
    count: 14,
    image: "/images/rooms/dining-room.jpg",
  },
];

function ShopByRoom() {
  const navigate = useNavigate();

  return (
    <section className="shop-room-section" id="rooms">
      <div className="home-section-heading">
        <span>MUA SẮM THEO PHÒNG</span>

        <h2>Chọn nội thất theo từng không gian sống.</h2>
      </div>

      <div className="shop-room-grid">
        {rooms.map((room, index) => (
          <article
            key={room.slug}
            className={index === 0 ? "shop-room-card large" : "shop-room-card"}
            onClick={() => navigate(`/collections/${room.slug}`)}
          >
            <img src={room.image} alt={room.name} />

            <div className="shop-room-overlay" />

            <div className="shop-room-info">
              <div>
                <span>{room.count} sản phẩm</span>

                <h3>{room.name}</h3>
              </div>

              <strong>→</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ShopByRoom;
