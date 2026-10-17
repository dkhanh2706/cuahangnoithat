import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageSquare, Package, Star, Trash2 } from "lucide-react";
import api from "../services/api";
import { productImageUrl } from "../services/media";
import ReviewCard from "../components/ReviewCard";
import "../styles/Reviews.css";

const money = value => Number(value).toLocaleString("vi-VN") + "₫";
const message = err => typeof err.response?.data?.detail === "string" ? err.response.data.detail : "Không thể kết nối. Vui lòng thử lại.";

export default function OrderHistory() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(location.state?.checkoutSuccess ? "Thanh toán giả lập thành công! Đơn đã được lưu; bạn có thể đánh giá sản phẩm bên dưới." : "");
  const submitLock = useRef(false);
  const deleteLock = useRef(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;
    api.get("/api/orders").then(({ data }) => {
      if (active) { setOrders(data); setHasMore(data.length === 20); }
    }).catch(err => { if (active) setError(message(err)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function loadMore() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/orders", { params: { offset: orders.length } });
      setOrders(previous => [...previous, ...data]); setHasMore(data.length === 20);
    } catch (err) { setError(message(err)); }
    finally { setLoading(false); }
  }

  async function submit(event) {
    event.preventDefault();
    if (submitLock.current || !content.trim()) return;
    submitLock.current = true; setSending(true); setNotice("");
    try {
      const { data } = await api.post("/api/product-reviews", { order_item_id: selected.id, rating, content: content.trim() });
      setOrders(previous => previous.map(order => ({ ...order, items: order.items.map(item => item.id === selected.id ? { ...item, review: data } : item) })));
      setSelected(null); setContent(""); setRating(5);
      setNotice("Cảm ơn bạn! Đánh giá đã hiển thị trên trang chủ.");
      window.dispatchEvent(new Event("reviews-updated"));
    } catch (err) { setNotice(message(err)); }
    finally { submitLock.current = false; setSending(false); }
  }

  async function deleteReview(item) {
    if (deleteLock.current || sending || !window.confirm("Xóa đánh giá này? Bạn có thể viết lại đánh giá sau khi xóa.")) return;
    deleteLock.current = true;
    setDeletingId(item.review.id);
    setNotice("");
    try {
      await api.delete(`/api/product-reviews/${item.review.id}`);
      setOrders(previous => previous.map(order => ({ ...order, items: order.items.map(product => product.id === item.id ? { ...product, review: null } : product) })));
      setNotice("Đã xóa đánh giá. Bạn có thể đánh giá lại sản phẩm này.");
      window.dispatchEvent(new Event("reviews-updated"));
    } catch (err) { setNotice(message(err)); }
    finally { deleteLock.current = false; setDeletingId(null); }
  }

  return (
    <main className="reviews-page order-history">
      <Link to="/">Trang chủ</Link>
      <h1>Lịch sử đơn hàng</h1>
      <p>Những món nội thất bạn đã chọn cho tổ ấm. Chia sẻ cảm nhận của bạn sau khi thanh toán.</p>
      {notice && <p role="status" className="order-notice">{notice}</p>}
      {error && <p role="alert">{error} <button onClick={() => window.location.reload()}>Thử lại</button></p>}
      {!loading && !error && orders.length === 0 && <section className="review-panel order-empty"><Package size={40} /><h2>Bạn chưa có đơn hàng</h2><Link to="/products">Khám phá nội thất</Link></section>}
      {orders.map(order => <article className="review-panel order-card" key={order.id}>
        <header className="order-card-heading"><div><strong>{order.code}</strong><p>{new Date(order.created_at).toLocaleString("vi-VN")}</p>{order.code.startsWith("DEMO-") && <small>Thanh toán giả lập · Không thu tiền thật</small>}</div><span className="order-payment">{order.status === "CANCELLED" ? "Đã hủy" : order.payment_status === "SUCCESS" ? "Đã thanh toán" : "Chưa thanh toán"}</span></header>
        {order.items.map(item => <div className="order-product-block" key={item.id}>
          <div className="order-product-row">
            {item.image_url ? <img src={productImageUrl(item.image_url)} alt={item.product_name} /> : <div className="order-image-placeholder"><Package /></div>}
            <div className="order-product-info"><h2>{item.product_name}</h2><p>{money(item.unit_price)} × {item.quantity}</p><strong>{money(item.subtotal)}</strong></div>
            {!item.review && order.payment_status === "SUCCESS" && order.status !== "CANCELLED" && <button className="order-comment" aria-expanded={selected?.id === item.id} aria-controls={`review-form-${item.id}`} onClick={() => { setSelected(selected?.id === item.id ? null : item); setContent(""); setRating(5); setNotice(""); }} disabled={sending}><MessageSquare size={18} /> Đánh giá</button>}
          </div>
          {item.review && <div className="order-existing-review"><ReviewCard review={item.review} /><button type="button" className="delete-review-btn" onClick={() => deleteReview(item)} disabled={deletingId !== null || sending}><Trash2 size={16} />{deletingId === item.review.id ? "Đang xóa..." : "Xóa đánh giá"}</button></div>}
          {selected?.id === item.id && <form id={`review-form-${item.id}`} className="order-review-form" onSubmit={submit}>
            <fieldset disabled={sending}><legend>Chọn số sao</legend><div className="rating-buttons">{[1, 2, 3, 4, 5].map(value => <button type="button" key={value} aria-label={`${value} sao`} aria-pressed={rating === value} onClick={() => setRating(value)}><Star fill={value <= rating ? "currentColor" : "none"} /></button>)}</div></fieldset>
            <label htmlFor={`content-${item.id}`}>Cảm nhận về {item.product_name}</label>
            <textarea id={`content-${item.id}`} required maxLength={2000} rows={4} value={content} onChange={event => setContent(event.target.value)} disabled={sending} placeholder="Chất liệu, màu sắc, độ thoải mái, cách bài trí..." />
            <small>{content.length}/2000 ký tự · Ảnh sản phẩm được đính kèm tự động</small>
            <div><button disabled={sending || !content.trim()}>{sending ? "Đang gửi..." : "Gửi đánh giá"}</button> <button type="button" disabled={sending} onClick={() => setSelected(null)}>Đóng</button></div>
          </form>}
        </div>)}
        <footer className="order-total">Tổng thanh toán <strong>{money(order.total)}</strong></footer>
      </article>)}
      {loading && <p role="status">Đang tải đơn hàng...</p>}
      {hasMore && <button disabled={loading} onClick={loadMore}>Xem thêm đơn hàng</button>}
    </main>
  );
}
