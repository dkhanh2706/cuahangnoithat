import { useEffect, useRef, useState } from "react";
import { Check, MessageCircle, PackagePlus, Search, Send, Wifi, WifiOff, X } from "lucide-react";
import api from "../../services/api";
import { productImageUrl } from "../../services/media";
import useChatPresence from "../hooks/useChatPresence";
import "../styles/CustomerChat.css";

const money = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const time = (value) => new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

export default function CustomerChat() {
  const [accepting, setAccepting] = useState(false);
  const presence = useChatPresence(accepting);
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [text, setText] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [asBundle, setAsBundle] = useState(true);
  const [picker, setPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [loading, setLoading] = useState(true);
  const sendingRef = useRef(false);
  const retryRef = useRef(null);
  const listRef = useRef(null);
  const activeConversation = conversation?.id === selectedId ? conversation : null;

  useEffect(() => {
    let active = true;
    let timer;
    const poll = async () => {
      try {
        const { data } = await api.get("/api/live-chat/admin/sessions", { timeout: 12000 });
        if (!active) return;
        setSessions(data.sessions); setListError(""); setLoading(false);
        const chosen = data.sessions.some((session) => session.id === selectedId) ? selectedId : data.sessions[0]?.id || null;
        if (chosen !== selectedId) {
          setText(""); setSelectedProducts([]); retryRef.current = null; setError(""); setPicker(false);
          setSelectedId(chosen); return;
        }
        if (!chosen) { setConversation(null); return; }
        const { data: detail } = await api.get(`/api/live-chat/admin/sessions/${chosen}`, { timeout: 12000 });
        if (active) setConversation((previous) => previous?.id === detail.id && previous.messages.length > detail.messages.length ? previous : detail);
      } catch (failure) {
        if (active) {
          if (failure.response?.status === 404) { setConversation(null); setSelectedId(null); }
          else setListError("Chưa tải được hội thoại. Hệ thống đang tự kết nối lại.");
          setLoading(false);
        }
      } finally { if (active) timer = window.setTimeout(poll, 2000); }
    };
    poll();
    return () => { active = false; window.clearTimeout(timer); };
  }, [selectedId]);

  const messageCount = activeConversation?.messages.length || 0;
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messageCount, selectedId]);

  const select = (id) => {
    if (sendingRef.current) return;
    setSelectedId(id); setText(""); setSelectedProducts([]); setError(""); setPicker(false); retryRef.current = null;
  };
  const toggleProduct = (product) => {
    setSelectedProducts((previous) => previous.some((item) => item.id === product.id)
      ? previous.filter((item) => item.id !== product.id) : previous.length < 8 ? [...previous, product] : previous);
    retryRef.current = null;
  };
  const openPicker = async () => {
    setPicker(!picker);
    if (picker) return;
    try {
      const { data } = await api.get("/api/products", { timeout: 12000 });
      setProducts(data.filter((product) => product.status && product.stock_quantity > 0)); setError("");
    } catch { setError("Không tải được sản phẩm để gợi ý. Bạn hãy thử mở danh sách lại."); }
  };
  const send = async (event) => {
    event.preventDefault();
    const lease = presence.credentials();
    if (sendingRef.current || !activeConversation || !presence.online || !lease || (!text.trim() && !selectedProducts.length)) return;
    sendingRef.current = true; setBusy(true); setError("");
    const pending = activeConversation.messages.findLast((message) => message.role === "user" && !message.answered_by);
    const payload = retryRef.current || { client_id: crypto.randomUUID(), reply_to: pending?.id || null,
      text: text.trim(), product_ids: selectedProducts.map((product) => product.id), as_bundle: asBundle };
    retryRef.current = payload;
    try {
      const { data } = await api.post(`/api/live-chat/admin/sessions/${selectedId}/messages`, {
        ...payload, tab_id: lease.tab_id, lease_token: lease.token,
      }, { timeout: 20000 });
      setConversation(data); setText(""); setSelectedProducts([]); setPicker(false); retryRef.current = null;
    } catch (failure) {
      if (failure.response?.status === 409 || failure.response?.status === 404) retryRef.current = null;
      setError(typeof failure.response?.data?.detail === "string" ? failure.response.data.detail : "Chưa gửi được tin. Bấm Gửi lại sẽ không tạo tin trùng.");
    } finally { sendingRef.current = false; setBusy(false); }
  };
  const filteredProducts = products.filter((product) => product.name.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));
  const waitingCount = sessions.reduce((total, session) => total + session.pending_count, 0);

  return <div className="admin-chat-page">
    <div className="admin-chat-heading">
      <div><span className="admin-chat-eyebrow">FURNIHOME SUPPORT</span><h1>Tư vấn khách hàng</h1><p>Trả lời trực tiếp khi online. Bot tiếp nhận khi bạn offline.</p></div>
      <button type="button" className={`admin-chat-toggle ${presence.online ? "online" : ""}`} aria-pressed={accepting} onClick={() => setAccepting(!accepting)}>
        {presence.online ? <Wifi size={18} /> : <WifiOff size={18} />}{accepting ? "Tắt nhận tư vấn" : "Bật nhận tư vấn"}
      </button>
    </div>
    <div className={`admin-chat-presence ${presence.online ? "online" : ""}`} role="status"><span />
      {presence.online ? "Bạn đang online · Nhận tin của khách · Heartbeat mỗi 10 giây" : accepting ? "Đang kết nối nhận tư vấn…" : "Bạn đang offline · Bot sẽ tư vấn cho khách"}
    </div>
    {presence.error && <p className="admin-chat-error" role="alert">{presence.error}</p>}
    <p className="admin-chat-privacy">Chat tạm thời, không lưu lịch sử. Hội thoại biến mất khi khách làm mới, đăng xuất hoặc rời website; phiên mất kết nối sẽ tự dọn sau 90 giây.</p>
    {listError && <p className="admin-chat-error" role="alert">{listError}</p>}

    <div className="admin-chat-workspace">
      <aside className="admin-chat-inbox">
        <div className="admin-chat-inbox-title"><h2>Hội thoại đang mở</h2><span>{waitingCount} tin chờ</span></div>
        <div className="admin-chat-session-list">
          {sessions.map((session) => <button type="button" key={session.id} disabled={busy} onClick={() => select(session.id)} className={`admin-chat-session ${selectedId === session.id ? "selected" : ""}`}>
            <div className="admin-chat-customer-avatar">{session.customer_name.charAt(0)}</div>
            <div><div className="admin-chat-session-name"><strong>{session.customer_name}</strong><time>{time(session.updated_at)}</time></div>
              <p>{session.preview}</p><small>{session.pending_count ? `${session.pending_count} tin đang chờ trả lời` : "Đã trả lời"}</small></div>
          </button>)}
          {!sessions.length && <div className="admin-chat-empty"><MessageCircle size={30} /><p>{loading ? "Đang tải hội thoại…" : "Chưa có khách nhắn tin"}</p><small>Bật Nhận tư vấn để sẵn sàng hỗ trợ.</small></div>}
        </div>
      </aside>

      <section className="admin-chat-conversation" aria-label="Nội dung tư vấn">
        {activeConversation ? <>
          <header className="admin-chat-conversation-header"><div className="admin-chat-customer-avatar">{activeConversation.customer_name.charAt(0)}</div><div><h2>{activeConversation.customer_name}</h2><p>{activeConversation.pending_count ? "Đang chờ phản hồi của bạn" : "Cuộc trò chuyện đang mở"}</p></div></header>
          <div className="admin-chat-transcript" ref={listRef} role="log" aria-live="polite" aria-relevant="additions text">
            {activeConversation.messages.map((message) => <article key={message.id} className={`admin-chat-message ${message.role}`}>
              <div><small>{message.role === "user" ? activeConversation.customer_name : message.role === "admin" ? "Tư vấn viên" : "Trợ lý tự động"} · {time(message.created_at)}</small>
                <p>{message.text}</p>
                {message.offers.map((offer) => <div className="admin-chat-offer-preview" key={offer.id}><strong>{offer.title}</strong>{offer.items.map((item) => <span key={item.product.id}>{item.product.name} · {money(item.product.price)} × {item.quantity}</span>)}<b>{money(offer.total_price)}</b></div>)}
              </div>
            </article>)}
          </div>
          {error && <p className="admin-chat-error" role="alert">{error}</p>}
          {picker && <div className="admin-chat-picker">
            <label><Search size={16} /><input aria-label="Tìm sản phẩm để tư vấn" placeholder="Tìm sản phẩm còn hàng…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            <div className="admin-chat-picker-list">{filteredProducts.map((product) => {
              const chosen = selectedProducts.some((item) => item.id === product.id);
              const image = product.images?.find((item) => item.is_primary) || product.images?.[0];
              return <button type="button" key={product.id} className={chosen ? "chosen" : ""} disabled={busy || (!chosen && selectedProducts.length >= 8)} onClick={() => toggleProduct(product)}>
                {image && <img src={productImageUrl(image.image_url)} alt="" loading="lazy" />}<span>{product.name}<strong>{money(product.price)}</strong></span>{chosen && <Check size={16} />}
              </button>;
            })}{!filteredProducts.length && <p>Không có sản phẩm còn hàng phù hợp.</p>}</div>
          </div>}
          <form className="admin-chat-composer" onSubmit={send}>
            {!!selectedProducts.length && <div className="admin-chat-selected-products">
              {selectedProducts.map((product) => <span key={product.id}>{product.name}<button type="button" disabled={busy} aria-label={`Bỏ ${product.name}`} onClick={() => toggleProduct(product)}><X size={13} /></button></span>)}
              {selectedProducts.length > 1 && <label><input type="checkbox" checked={asBundle} disabled={busy} onChange={(event) => { setAsBundle(event.target.checked); retryRef.current = null; }} /> Ghép thành một bộ ({money(selectedProducts.reduce((sum, product) => sum + Number(product.price), 0))})</label>}
            </div>}
            <div className="admin-chat-composer-row"><textarea aria-label="Tin nhắn tư vấn của admin" value={text} onChange={(event) => { setText(event.target.value); retryRef.current = null; }} maxLength={1200} rows={2} disabled={busy} placeholder={presence.online ? "Nhập câu trả lời cho khách…" : "Bật Nhận tư vấn để trả lời trực tiếp"} />
              <button type="submit" disabled={busy || !presence.online || (!text.trim() && !selectedProducts.length)}><Send size={17} />{busy ? "Đang gửi…" : "Gửi"}</button></div>
            <div className="admin-chat-composer-footer"><button type="button" onClick={openPicker} disabled={!presence.online || busy}><PackagePlus size={16} />Gợi ý sản phẩm / cả bộ</button><span>Khách xác nhận Có / Không trước khi thêm giỏ.</span></div>
          </form>
        </> : <div className="admin-chat-empty"><MessageCircle size={42} /><h2>Chọn một cuộc trò chuyện</h2><p>Tin của khách sẽ xuất hiện tại đây khi phiên chat còn mở.</p></div>}
      </section>
    </div>
  </div>;
}
