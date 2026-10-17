import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import ReviewCard from "../ReviewCard";
import "../../styles/Reviews.css";

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    let active = true;
    const load = () => api.get("/api/product-reviews", { params: { limit: 6 } })
      .then(({ data }) => { if (active) setReviews(data); }).catch(() => {});
    load();
    window.addEventListener("focus", load);
    window.addEventListener("reviews-updated", load);
    return () => { active = false; window.removeEventListener("focus", load); window.removeEventListener("reviews-updated", load); };
  }, []);
  if (!reviews.length) return null;
  return <section className="home-reviews" aria-labelledby="home-reviews-title">
    <div className="home-reviews-heading"><div><span>GÓC CHIA SẺ</span><h2 id="home-reviews-title">Tổ ấm đẹp, trải nghiệm thật</h2><p>Những đánh giá mới nhất từ khách hàng đã mua nội thất tại FurniHome.</p></div><Link to="/reviews">Xem tất cả đánh giá →</Link></div>
    <div className="home-reviews-grid">{reviews.map(review => <ReviewCard key={review.id} review={review} />)}</div>
  </section>;
}
