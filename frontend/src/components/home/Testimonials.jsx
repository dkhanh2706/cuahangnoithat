import { Star, Quote, BadgeCheck, Truck, ShieldCheck, RotateCcw, Palette } from "lucide-react";
import "../../styles/home/Testimonials.css";

const reviews = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    role: "Kiến trúc sư nội thất, TP.HCM",
    product: "Sofa Scandinavia Nord",
    rating: 5,
    content:
      "Chất lượng hoàn thiện của FurniHome vượt xa mong đợi trong tầm giá. Màu vải linen tự nhiên và khung gỗ sồi rất chắc chắn, đặt vào căn hộ cao cấp tạo nên điểm nhấn cực kỳ sang trọng.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 2,
    name: "Trần Quốc Huy",
    role: "Giám đốc sáng tạo, Hà Nội",
    product: "Bàn ăn mở rộng OAK",
    rating: 5,
    content:
      "Cơ chế mở rộng của bàn ăn thông minh hoạt động cực kỳ mượt mà. Lúc bình thường gọn gàng 4 người, cuối tuần bạn bè đến có thể kéo dài lên 8 người thoải mái mà không hề rung lắc.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 3,
    name: "Lê Ngọc Hà",
    role: "Chủ thương hiệu thời trang, Đà Nẵng",
    product: "Giường ngủ Muji Zen",
    rating: 5,
    content:
      "Tôi ấn tượng nhất là gỗ không có mùi hóa chất độc hại, các góc cạnh bo tròn an toàn cho con nhỏ. Dịch vụ giao hàng và lắp đặt tại nhà rất đúng giờ và chu đáo.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  },
];

const guarantees = [
  {
    icon: <Truck size={24} />,
    title: "Vận chuyển tận nhà",
    desc: "Miễn phí lắp đặt đơn từ 2.000.000₫",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Bảo hành 5 năm",
    desc: "Bảo trì trọn đời, hỗ trợ 24/7",
  },
  {
    icon: <RotateCcw size={24} />,
    title: "30 ngày đổi trả",
    desc: "Đổi mới nếu phát sinh lỗi kỹ thuật",
  },
  {
    icon: <Palette size={24} />,
    title: "Tư vấn thiết kế",
    desc: "Phối cảnh 3D không gian miễn phí",
  },
];

function Testimonials() {
  return (
    <section className="testimonial-section" id="reviews">
      <div className="testimonial-header">
        <span className="testimonial-eyebrow">ĐÁNH GIÁ THỰC TẾ</span>
        <h2>Trải nghiệm hài lòng từ hơn 10.000+ gia đình.</h2>
        <p className="testimonial-subtitle">
          Sự tin tưởng và nụ cười của quý khách khi bước vào không gian sống mới chính là niềm tự hào lớn nhất của FurniHome.
        </p>
      </div>

      <div className="testimonial-grid">
        {reviews.map((review) => (
          <article className="testimonial-card" key={review.id}>
            <div className="testimonial-card-top">
              <div className="testimonial-stars">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={15} fill="#c49a62" color="#c49a62" />
                ))}
              </div>
              <Quote size={28} className="quote-watermark" />
            </div>

            <p className="testimonial-quote">“{review.content}”</p>

            <div className="testimonial-product-tag">
              <span>Đã mua: {review.product}</span>
            </div>

            <div className="testimonial-user">
              <img
                src={review.avatar}
                alt={review.name}
                className="testimonial-avatar"
              />
              <div className="user-details">
                <div className="user-name-row">
                  <strong>{review.name}</strong>
                  <BadgeCheck size={16} className="verified-badge" title="Đã xác thực mua hàng" />
                </div>
                <span>{review.role}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Trust & Guarantees Bar */}
      <div className="guarantees-bar">
        {guarantees.map((item, index) => (
          <div className="guarantee-item" key={index}>
            <div className="guarantee-icon">{item.icon}</div>
            <div className="guarantee-text">
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
