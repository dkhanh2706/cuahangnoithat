import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import productService, { productError, productImageUrl } from "../services/productService";

export default function ProductFormModal({ product, categories, onClose, onSaved, onChanged }) {
  const [form, setForm] = useState(() => ({
    name: product?.name || "", category_id: product?.category_id ?? "",
    price: product?.price ?? "", stock_quantity: product?.stock_quantity ?? 0,
    description: product?.description || "", material: product?.material || "",
    color: product?.color || "", dimensions: product?.dimensions || "",
  }));
  const [savedId, setSavedId] = useState(product?.id);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    return () => previous?.focus();
  }, []);
  const change = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return setError("Vui lòng nhập tên sản phẩm.");
    setBusy(true);
    setError("");
    let persisted = false;
    try {
      const payload = { ...form, name: form.name.trim(), category_id: form.category_id === "" ? null : Number(form.category_id), stock_quantity: Number(form.stock_quantity) };
      const result = savedId ? await productService.update(savedId, payload) : await productService.create(payload);
      setSavedId(result.id);
      persisted = true;
      if (file) await productService.upload(result.id, file);
      onSaved();
    } catch (failure) {
      setError(`${persisted ? "Thông tin đã lưu, nhưng tải ảnh thất bại. Bạn có thể chọn ảnh và lưu lại. " : ""}${productError(failure)}`);
      if (persisted) onChanged();
    } finally { setBusy(false); }
  };
  return (
    <dialog ref={dialog} className="admin-modal-box product-dialog" aria-labelledby="product-form-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
      <div className="admin-modal-header">
        <h3 id="product-form-title">{savedId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
        <button type="button" className="admin-modal-close-btn" aria-label="Đóng" disabled={busy} onClick={onClose}><X size={20} /></button>
      </div>
      <form className="product-form" onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>Tên sản phẩm *<input autoFocus name="name" value={form.name} onChange={change} required maxLength={150} /></label>
          <div className="product-form-grid">
            <label>Danh mục<select name="category_id" value={form.category_id} onChange={change}><option value="">Chưa phân loại</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label>Giá bán (₫) *<input name="price" type="number" min="0" max="9999999999999.99" step="0.01" required value={form.price} onChange={change} /></label>
            <label>Số lượng tồn *<input name="stock_quantity" type="number" min="0" max="2147483647" step="1" required value={form.stock_quantity} onChange={change} /></label>
            <label>Chất liệu<input name="material" maxLength={100} value={form.material} onChange={change} /></label>
            <label>Màu sắc<input name="color" maxLength={100} value={form.color} onChange={change} /></label>
            <label>Kích thước<input name="dimensions" maxLength={100} value={form.dimensions} onChange={change} placeholder="VD: 120 × 60 × 75 cm" /></label>
          </div>
          <label>Mô tả<textarea name="description" rows={4} value={form.description} onChange={change} /></label>
          <label>Ảnh đại diện (JPG, PNG, WEBP)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const next = event.target.files[0]; if (next && !["image/jpeg", "image/png", "image/webp"].includes(next.type)) { event.target.value = ""; setFile(null); setError("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP."); } else { setFile(next || null); setError(""); } }} /></label>
          {product?.images?.length > 0 && <div className="product-existing-images">{product.images.map((image) => <img key={image.id} src={productImageUrl(image.image_url)} alt={image.is_primary ? "Ảnh đại diện hiện tại" : "Ảnh sản phẩm"} />)}</div>}
        </fieldset>
        {error && <div className="admin-banner error" role="alert">{error}</div>}
        <div className="admin-modal-actions"><button type="button" className="admin-btn secondary" disabled={busy} onClick={onClose}>Hủy</button><button className="admin-btn primary" disabled={busy}>{busy ? "Đang lưu…" : "Lưu sản phẩm"}</button></div>
      </form>
    </dialog>
  );
}
