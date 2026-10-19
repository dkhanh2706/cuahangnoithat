import { useCallback, useEffect, useMemo, useState } from "react";
import { Package, Plus, RefreshCw, Pencil, Trash2, Lock, Unlock, Search } from "lucide-react";
import productService, { productError, productImageUrl } from "../services/productService";
import ProductFormModal from "../components/ProductFormModal";
import "../styles/ProductManagement.css";

const PAGE_SIZE = 10;
export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [items, groups] = await Promise.all([productService.list(), productService.categories()]);
      setProducts(items); setCategories(groups);
    } catch (error) { setMessage({ error: true, text: productError(error) }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    // Initial request loads the shared catalog from the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);
  const filtered = useMemo(() => products.filter((product) =>
    `${product.name} ${product.material || ""} ${product.id}`.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi")) &&
    (!category || String(product.category_id) === category) &&
    (!status || String(product.status) === status)
  ), [products, query, category, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const categoryName = (id) => categories.find((item) => item.id === id)?.name || "Chưa phân loại";
  const performAction = async () => {
    setBusy(true);
    try {
      const { product, type } = confirmation;
      if (type === "delete") await productService.remove(product.id);
      else await productService.update(product.id, { status: !product.status });
      setConfirmation(null);
      setMessage({ text: type === "delete" ? "Đã xóa sản phẩm." : product.status ? "Đã khóa sản phẩm." : "Đã mở khóa sản phẩm." });
      await load();
    } catch (error) { setConfirmation(null); setMessage({ error: true, text: productError(error) }); }
    finally { setBusy(false); }
  };
  return (
    <div className="admin-page-container product-management">
      <div className="admin-page-header"><div><span className="admin-section-tag">DANH MỤC CỬA HÀNG</span><h1>Quản lý sản phẩm</h1><p>Quản lý nội thất, giá bán, tồn kho và trạng thái hiển thị.</p></div><div className="admin-header-actions"><button className="admin-btn secondary" onClick={load} disabled={loading || busy}><RefreshCw size={16} />Làm mới</button><button className="admin-btn primary" disabled={loading || busy} onClick={() => setEditor({})}><Plus size={17} />Thêm sản phẩm</button></div></div>
      {message && <div className={`admin-banner ${message.error ? "error" : "info"}`} role={message.error ? "alert" : "status"}>{message.text}<button className="product-dismiss" aria-label="Đóng thông báo" onClick={() => setMessage(null)}>×</button></div>}
      <div className="product-stats">{[["Tổng sản phẩm", products.length], ["Đang hiển thị", products.filter((p) => p.status).length], ["Đã khóa", products.filter((p) => !p.status).length], ["Hết hàng", products.filter((p) => p.stock_quantity === 0).length]].map(([label, value]) => <div key={label} className="admin-stat-card"><span>{label}</span><strong>{loading ? "…" : value}</strong></div>)}</div>
      <div className="admin-table-card">
        <div className="product-controls"><label className="product-search"><Search size={17} /><input aria-label="Tìm sản phẩm" placeholder="Tìm tên, mã, chất liệu…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></label><select aria-label="Lọc danh mục" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="">Tất cả danh mục</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select aria-label="Lọc trạng thái" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Tất cả trạng thái</option><option value="true">Đang hiển thị</option><option value="false">Đã khóa</option></select></div>
        <div className="admin-table-responsive"><table className="admin-custom-table"><thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá bán</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
          {loading ? <tr><td colSpan={6} className="product-empty">Đang tải sản phẩm…</td></tr> : items.length === 0 ? <tr><td colSpan={6} className="product-empty"><Package size={30} /><p>Không có sản phẩm phù hợp.</p></td></tr> : items.map((product) => {
            const image = product.images?.find((item) => item.is_primary) || product.images?.[0];
            return <tr key={product.id}><td><div className="product-cell">{image ? <img src={productImageUrl(image.image_url)} alt={product.name} /> : <span className="product-image-placeholder"><Package size={22} /></span>}<div><strong>{product.name}</strong><small>#{product.id} · {product.material || "Chưa có chất liệu"}</small></div></div></td><td>{categoryName(product.category_id)}</td><td className="product-price">{Number(product.price).toLocaleString("vi-VN")} ₫</td><td>{product.stock_quantity}</td><td><span className={`admin-status-badge ${product.status ? "active" : "locked"}`}>{product.status ? "Đang hiển thị" : "Đã khóa"}</span></td><td><div className="product-actions"><button disabled={busy} title="Sửa sản phẩm" aria-label={`Sửa ${product.name}`} onClick={() => setEditor(product)}><Pencil size={17} /></button><button disabled={busy} title={product.status ? "Khóa sản phẩm" : "Mở khóa sản phẩm"} aria-label={`${product.status ? "Khóa" : "Mở khóa"} ${product.name}`} onClick={() => setConfirmation({ type: "status", product })}>{product.status ? <Lock size={17} /> : <Unlock size={17} />}</button><button disabled={busy} className="product-delete" title="Xóa sản phẩm" aria-label={`Xóa ${product.name}`} onClick={() => setConfirmation({ type: "delete", product })}><Trash2 size={17} /></button></div></td></tr>;
          })}
        </tbody></table></div>
        <div className="product-pagination"><span>{filtered.length} sản phẩm · Trang {currentPage}/{pages}</span><div><button className="admin-btn secondary" disabled={currentPage === 1 || loading} onClick={() => setPage(currentPage - 1)}>Trước</button><button className="admin-btn secondary" disabled={currentPage === pages || loading} onClick={() => setPage(currentPage + 1)}>Sau</button></div></div>
      </div>
      {editor && <ProductFormModal product={editor} categories={categories} onClose={() => setEditor(null)} onChanged={load} onSaved={() => { setEditor(null); setMessage({ text: "Đã lưu sản phẩm thành công." }); load(); }} />}
      {confirmation && <div className="admin-modal-overlay"><section role="dialog" aria-modal="true" aria-labelledby="product-confirm-title" className="admin-modal-box"><div className="admin-modal-header"><h3 id="product-confirm-title">{confirmation.type === "delete" ? "Xóa sản phẩm?" : confirmation.product.status ? "Khóa sản phẩm?" : "Mở khóa sản phẩm?"}</h3></div><p><strong>{confirmation.product.name}</strong></p><p>{confirmation.type === "delete" ? "Sản phẩm sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác." : confirmation.product.status ? "Sản phẩm sẽ ẩn khỏi cửa hàng và không thể đặt mua. Bạn có thể mở khóa sau." : "Sản phẩm sẽ hiển thị lại trên cửa hàng."}</p><div className="admin-modal-actions"><button autoFocus className="admin-btn secondary" disabled={busy} onClick={() => setConfirmation(null)}>Hủy</button><button className={`admin-btn ${confirmation.type === "delete" ? "danger" : "primary"}`} disabled={busy} onClick={performAction}>{busy ? "Đang xử lý…" : "Xác nhận"}</button></div></section></div>}
    </div>
  );
}
