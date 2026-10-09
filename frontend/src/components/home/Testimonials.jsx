import "../../styles/home/Testimonials.css";

const reviews = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    rating: 5,
    content:
      "Sản phẩm đẹp, chắc chắn và rất hợp với căn hộ của mình. Màu sắc thực tế gần như hình ảnh.",
  },
  {
    id: 2,
    name: "Trần Quốc Huy",
    rating: 5,
    content:
      "Nhân viên tư vấn nhiệt tình, lựa chọn sản phẩm phù hợp với diện tích phòng khách.",
  },
  {
    id: 3,
    name: "Lê Ngọc Hà",
    rating: 5,
    content:
      "Mình thích cách FurniHome gợi ý sản phẩm theo từng không gian, rất dễ hình dung.",
  },
];

function Testimonials() {
  return (
    <section className="testimonial-section" id="reviews">
      <div className="testimonial-heading">
        <span>ĐÁNH GIÁ KHÁCH HÀNG</span>

        <h2>Những trải nghiệm từ không gian thực tế.</h2>
      </div>

      <div className="testimonial-grid">
        {reviews.map((review) => (
          <article className="testimonial-card" key={review.id}>
            <div className="testimonial-stars">{"★".repeat(review.rating)}</div>

            <p>“{review.content}”</p>

            <div className="testimonial-user">
              <div className="testimonial-avatar">{review.name.charAt(0)}</div>

              <strong>{review.name}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
