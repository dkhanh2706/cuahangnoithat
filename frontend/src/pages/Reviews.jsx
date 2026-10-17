import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ReviewCard from "../components/ReviewCard";
import "../styles/Reviews.css";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  useEffect(() => {
    let active = true;
    api.get("/api/product-reviews").then(({ data }) => {
      if (active) { setReviews(data); setHasMore(data.length === 20); }
    }).catch(() => { if (active) setError("Không thể tải đánh giá. Vui lòng thử lại."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function loadMore() {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/api/product-reviews", { params: { offset: reviews.length } });
      setReviews(previous => [...previous, ...data]); setHasMore(data.length === 20);
    } catch { setError("Không thể tải đánh giá. Vui lòng thử lại."); }
    finally { setLoading(false); }
  }
  return <main className="reviews-page">
    <Link to="/">Trang chủ</Link><h1>Khách hàng chia sẻ</h1>
    <p>Cảm nhận về những món nội thất đã mua. <Link to="/orders">Đến lịch sử đơn hàng để viết đánh giá.</Link></p>
    {error && <p role="alert">{error} <button onClick={() => window.location.reload()}>Thử lại</button></p>}
    {!loading && !error && !reviews.length && <p>Chưa có đánh giá. Hãy chia sẻ trải nghiệm đầu tiên của bạn!</p>}
    {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
    {loading && <p role="status">Đang tải đánh giá...</p>}
    {hasMore && <button disabled={loading} onClick={loadMore}>Xem thêm đánh giá</button>}
  </main>;
}
