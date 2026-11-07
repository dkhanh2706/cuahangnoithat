import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/OrderManagement.css";

export default function NewsletterSubscribers() {
  const [list, setList] = useState({ items: [], total: 0 });
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api.get("/api/admin/newsletter/subscriptions", { params: { q: query, offset: page * 20 } }).then(({ data }) => {
      if (active) { setList(data); setError(""); }
    }).catch(() => { if (active) setError("Không tải được danh sách. Vui lòng thử lại."); });
    return () => { active = false; };
  }, [query, page, revision]);
  const remove = async row => {
    if (busy || !window.confirm(`Xóa đăng ký nhận tin của ${row.email}?`)) return;
    setBusy(true);
    try { await api.delete(`/api/admin/newsletter/subscriptions/${row.id}`); if (list.items.length === 1 && page > 0) setPage(value => value - 1); setRevision(value => value + 1); }
    catch { setError("Không xóa được đăng ký. Vui lòng thử lại."); }
    finally { setBusy(false); }
  };
  return <div className="store-admin-page"><header className="store-admin-heading"><div><span>CHNT · KẾT NỐI KHÁCH HÀNG</span><h1>Đăng ký nhận tin</h1><p>Email khách hàng đã đồng ý lưu để nhận thông tin và ưu đãi từ CHNT.</p></div><button className="admin-btn secondary" onClick={() => setRevision(value => value + 1)}>Tải lại</button></header>
    <form className="store-admin-filters" onSubmit={event => { event.preventDefault(); setQuery(search.trim()); setPage(0); setRevision(value => value + 1); }}><label>Tìm email<input value={search} maxLength={254} onChange={event => setSearch(event.target.value)} placeholder="Email khách hàng" /></label><button className="admin-btn primary">Tìm kiếm</button></form>
    {error && <p role="alert" className="store-admin-notice">{error}</p>}
    <div className="store-admin-table-wrap"><table className="store-admin-table"><thead><tr><th>Email</th><th>Ngày đăng ký</th><th>Thao tác</th></tr></thead><tbody>{list.items.map(row => <tr key={row.id}><td>{row.email}</td><td>{new Date(row.created_at).toLocaleString("vi-VN")}</td><td><button className="admin-btn danger" disabled={busy} onClick={() => remove(row)}>Xóa đăng ký</button></td></tr>)}{!list.items.length && <tr><td colSpan={3}>Chưa có đăng ký phù hợp.</td></tr>}</tbody></table></div>
    <div className="store-admin-pagination"><span>{list.total} đăng ký · Trang {page + 1}</span><button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Trước</button><button disabled={(page + 1) * 20 >= list.total} onClick={() => setPage(value => value + 1)}>Sau</button></div>
  </div>;
}
