import { useEffect, useState } from "react";
import { Package, Search, RefreshCw, ArrowRight, X } from "lucide-react";
import api from "../../services/api";
import "../styles/OrderManagement.css";

const labels = { PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", SHIPPING: "Đang giao", COMPLETED: "Hoàn tất", CANCELLED: "Đã hủy" };
const payments = { PENDING: "Chưa thu tiền · COD", SUCCESS: "Đã thanh toán", FAILED: "Đã hủy thanh toán", REFUNDED: "Đã hoàn tiền / đơn demo đã hủy" };
const transitions = { PENDING: ["CONFIRMED", "CANCELLED"], CONFIRMED: ["SHIPPING", "CANCELLED"], SHIPPING: ["COMPLETED"] };
const actions = { CONFIRMED: "Xác nhận đơn", SHIPPING: "Bắt đầu giao hàng", COMPLETED: "Hoàn tất & xác nhận đã thu tiền", CANCELLED: "Hủy đơn & hoàn kho" };
const money = value => Number(value).toLocaleString("vi-VN") + "₫";
const errorText = error => typeof error.response?.data?.detail === "string" ? error.response.data.detail : "Không thể kết nối máy chủ. Vui lòng thử lại.";

export default function OrderManagement() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [list, setList] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    api.get("/api/admin/orders", { params: { q: query, status: status || undefined, offset: page * 20 } })
      .then(({ data }) => { if (active) { setList(data); setError(""); } })
      .catch(failure => { if (active) setError(errorText(failure)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, status, page, revision]);
  const reload = () => { setLoading(true); setRevision(value => value + 1); };
  const open = async id => {
    setBusy(true); setNotice(""); setPending(null);
    try { setSelected((await api.get(`/api/admin/orders/${id}`)).data); }
    catch (failure) { setNotice(errorText(failure)); }
    finally { setBusy(false); }
  };
  const update = async () => {
    if (!pending || busy) return;
    setBusy(true); setNotice("");
    try {
      await api.patch(`/api/admin/orders/${selected.id}/status`, { status: pending });
      setSelected((await api.get(`/api/admin/orders/${selected.id}`)).data);
      setNotice("Đã cập nhật đơn hàng."); setPending(null); reload();
    } catch (failure) { setNotice(errorText(failure)); }
    finally { setBusy(false); }
  };
  return <div className="store-admin-page">
    <header className="store-admin-heading"><div><span>CHNT · VẬN HÀNH</span><h1>Quản lý đơn hàng</h1><p>Theo dõi đơn COD từ lúc đặt đến khi giao hàng và thu tiền.</p></div><button className="admin-btn secondary" onClick={reload} disabled={loading}><RefreshCw size={16} /> Tải lại</button></header>
    <div className="order-workflow">Chờ xác nhận <ArrowRight size={15} /> Đã xác nhận <ArrowRight size={15} /> Đang giao <ArrowRight size={15} /> Hoàn tất</div>
    <form className="store-admin-filters" onSubmit={event => { event.preventDefault(); setQuery(search.trim()); setPage(0); reload(); }}>
      <label><span>Tìm đơn hàng</span><input placeholder="Mã đơn, người nhận, số điện thoại" value={search} onChange={event => setSearch(event.target.value)} maxLength={150} /></label>
      <label><span>Trạng thái</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(0); setLoading(true); }}>{Object.entries({ "": "Tất cả trạng thái", ...labels }).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <button className="admin-btn primary"><Search size={16} /> Tìm kiếm</button>
    </form>
    {error && <p role="alert" className="store-admin-notice">{error}</p>}
    {notice && <p role="status" className="store-admin-notice">{notice}</p>}
    <div className="store-admin-table-wrap" aria-busy={loading}><table className="store-admin-table"><thead><tr><th>Mã đơn / ngày đặt</th><th>Người nhận</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thanh toán</th><th>Thao tác</th></tr></thead><tbody>
      {list.items.map(order => <tr key={order.id}><td><strong className="order-code">{order.code}</strong><small>{new Date(order.created_at).toLocaleString("vi-VN")}{order.is_demo ? " · Đơn demo cũ" : ""}</small></td><td>{order.receiver_name}<small>{order.receiver_phone}</small></td><td>{money(order.total)}</td><td><span className={`order-status ${order.status.toLowerCase()}`}>{labels[order.status]}</span></td><td>{payments[order.payment_status]}</td><td><button className="admin-btn secondary" disabled={busy} onClick={() => open(order.id)}>Chi tiết</button></td></tr>)}
      {!list.items.length && <tr><td colSpan={6}>{loading ? "Đang tải đơn hàng..." : "Không có đơn hàng phù hợp."}</td></tr>}
    </tbody></table></div>
    <div className="store-admin-pagination"><span>{list.total} đơn hàng · Trang {page + 1}</span><button disabled={page === 0 || loading} onClick={() => { setPage(value => value - 1); setLoading(true); }}>Trước</button><button disabled={(page + 1) * 20 >= list.total || loading} onClick={() => { setPage(value => value + 1); setLoading(true); }}>Sau</button></div>
    {selected && <section className="order-admin-detail" aria-labelledby="order-detail-title"><header><h2 id="order-detail-title"><Package size={20} /> Chi tiết đơn hàng</h2><button aria-label="Đóng chi tiết" disabled={busy} onClick={() => { setSelected(null); setPending(null); }}><X size={20} /></button></header>
      <p className="order-code">{selected.code}</p><div className="order-detail-grid"><div><h3>Thông tin giao hàng</h3><p>{selected.receiver_name} · {selected.receiver_phone}</p><p>{selected.shipping_address}</p></div><div><h3>Trạng thái xử lý</h3><p>{labels[selected.status]} · {payments[selected.payment_status]}</p><p>{selected.is_demo ? "Đơn demo cũ không tác động tồn kho." : "Tồn kho đã trừ khi đặt đơn. Hủy trước khi giao sẽ hoàn kho."}</p></div></div>
      <div className="store-admin-table-wrap"><table className="store-admin-table"><thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>{selected.items.map(item => <tr key={item.id}><td>{item.product_name}{!item.product_id && <small>Sản phẩm đã xóa khỏi danh mục</small>}</td><td>{item.quantity}</td><td>{money(item.unit_price)}</td><td>{money(item.subtotal)}</td></tr>)}</tbody></table></div><p className="order-detail-total">Tổng sau ưu đãi và vận chuyển: <strong>{money(selected.total)}</strong></p>
      <div className="order-admin-actions">{(transitions[selected.status] || []).map(next => <button key={next} disabled={busy || !!pending} className={`admin-btn ${next === "CANCELLED" ? "danger" : "primary"}`} onClick={() => setPending(next)}>{selected.is_demo && next === "CANCELLED" ? "Hủy đơn demo" : actions[next]}</button>)}</div>
      {pending && <div className="store-admin-confirm" role="group" aria-label="Xác nhận cập nhật đơn hàng"><p>{pending === "CANCELLED" ? "Xác nhận hủy đơn? Đơn đã hủy không thể mở lại." : pending === "COMPLETED" ? "Xác nhận đã giao hàng và đã thu đủ tiền COD?" : `Chuyển sang “${labels[pending]}”?`}</p><button className="admin-btn primary" disabled={busy} onClick={update}>{busy ? "Đang cập nhật..." : "Xác nhận"}</button><button className="admin-btn secondary" disabled={busy} onClick={() => setPending(null)}>Quay lại</button></div>}
    </section>}
  </div>;
}
