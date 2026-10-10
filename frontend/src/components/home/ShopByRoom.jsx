import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Compass } from "lucide-react";
import "../../styles/home/ShopByRoom.css";

const rooms = [
  {
    name: "Phòng khách",
    slug: "phong-khach",
    category_id: 1,
    count: 24,
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
    tag: "Tâm điểm ngôi nhà",
  },
  {
    name: "Phòng ngủ",
    slug: "phong-ngu",
    category_id: 2,
    count: 18,
    image: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=800&q=80",
    tag: "Bình yên & Thư thái",
  },
  {
    name: "Phòng ăn & Bếp",
    slug: "phong-an",
    category_id: 3,
    count: 16,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
    tag: "Khoảnh khắc sum vầy",
  },
  {
    name: "Phòng làm việc",
    slug: "phong-lam-viec",
    category_id: 4,
    count: 12,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
    tag: "Khơi nguồn sáng tạo",
  },
  {
    name: "Góc thư giãn",
    slug: "thu-gian",
    category_id: 1,
    count: 10,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
    tag: "Tận hưởng cuộc sống",
  },
];

function ShopByRoom() {
  const navigate = useNavigate();

  return (
    <section className="shop-room-section" id="rooms">
      <div className="section-header-row">
        <div className="home-section-heading">
          <span className="section-eyebrow">
            <Compass size={14} /> MUA SẮM THEO KHÔNG GIAN
          </span>
          <h2>Chọn nội thất tinh tế cho từng góc sống.</h2>
        </div>
        <button
          className="section-explore-btn"
          onClick={() => navigate("/products")}
        >
          <span>Xem tất cả không gian</span>
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="shop-room-grid">
        {rooms.map((room, index) => (
          <article
            key={room.slug}
            className={`shop-room-card ${index === 0 ? "card-featured" : ""}`}
            onClick={() => navigate(`/products?category=${room.category_id}`)}
          >
            <div className="card-image-wrapper">
              <img src={room.image} alt={room.name} loading="lazy" />
              <div className="shop-room-overlay" />
            </div>

            <div className="card-top-tag">
              <span>{room.tag}</span>
            </div>

            <div className="shop-room-info">
              <div className="room-text">
                <span className="room-count">{room.count} sản phẩm tuyển chọn</span>
                <h3 className="room-title">{room.name}</h3>
              </div>

              <div className="room-action-circle">
                <ArrowUpRight size={20} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ShopByRoom;
