import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, ChevronDown, LoaderCircle, MessageCircle, RotateCcw, Send, ShoppingBag, Sparkles, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { productImageUrl } from "../services/media";
import useCustomerChat from "../hooks/useCustomerChat";
import "../styles/FurnitureChat.css";

const price = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default function FurnitureChat() {
  const [open, setOpen] = useState(false);
  const chat = useCustomerChat(open);
  const { messages, setMessages, error, retryMessage } = chat;
  const [input, setInput] = useState("");
  const [cartBusy, setBusy] = useState(false);
  const busy = cartBusy || chat.busy;
  const { cart, addToCartBatch } = useCart();
  const { pathname } = useLocation();
  const panelId = useId();
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const actingRef = useRef(false);
  const requestRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; requestRef.current?.abort(); };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages, busy, error]);

  const close = () => { setOpen(false); launcherRef.current?.focus(); };
  const updateOffer = (messageId, offerId, update) => {
    setMessages((previous) => previous.map((message) => message.id === messageId
      ? { ...message, offers: message.offers.map((offer) => offer.id === offerId ? { ...offer, ...update } : offer) }
      : message));
  };

  const send = async (value, retry = false) => {
    const text = value.trim();
    if (!text || text.length > 1200 || chat.busy || actingRef.current) return;
    setInput("");
    const last = messages.findLast((message) => message.role === "assistant" && message.offers?.length);
    const suggestedIds = [...new Set(last?.offers.flatMap((offer) => offer.items.map((item) => item.product.id)) || [])].slice(0, 8);
    const productMatch = pathname.match(/^\/products\/(\d+)\/?$/);
    await chat.send(text, productMatch ? Number(productMatch[1]) : null, suggestedIds, retry);
  };

  const confirm = async (message, offer) => {
    if (actingRef.current || chat.busy || offer.status !== "pending") return;
    actingRef.current = true;
    setBusy("cart");
    updateOffer(message.id, offer.id, { status: "checking", error: "" });
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const { data: items } = await api.post("/api/advisor/check-cart", { items: offer.items.map((item) => ({
        product_id: item.product.id, quantity: item.quantity,
        cart_quantity: cart.find((entry) => entry.product.id === item.product.id)?.quantity || 0,
      })) }, { signal: controller.signal, timeout: 15000 });
      if (!mountedRef.current) return;
      const changed = items.some((item) => Number(item.product.price) !== Number(offer.items.find((old) => old.product.id === item.product.id).product.price));
      if (changed) {
        setMessages((previous) => previous.map((entry) => entry.id !== message.id ? entry : { ...entry,
          offers: entry.offers.map((candidate) => {
            if (!["pending", "checking"].includes(candidate.status)) return candidate;
            const refreshed = candidate.items.map((old) => items.find((item) => item.product.id === old.product.id) || old);
            return { ...candidate, items: refreshed, total_price: refreshed.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
              ...(candidate.id === offer.id ? { status: "pending", error: "Giá vừa thay đổi. Vui lòng xem giá mới và bấm Có lần nữa nếu bạn đồng ý." } : {}) };
          }),
        }));
        return;
      }
      const result = addToCartBatch(items.map((item) => ({ ...item,
        product: { ...item.product, primary_image: productImageUrl(item.product.primary_image), _source: "backend" },
      })));
      if (!result.ok) {
        updateOffer(message.id, offer.id, { status: "pending", error: result.error });
        return;
      }
      const addedIds = new Set(items.map((item) => item.product.id));
      setMessages((previous) => previous.map((entry) => entry.id !== message.id ? entry : { ...entry,
        offers: entry.offers.map((candidate) => candidate.id === offer.id ? { ...candidate, status: "added", error: "" }
          : candidate.status === "pending" && candidate.items.some((item) => addedIds.has(item.product.id))
            ? { ...candidate, status: "expired" } : candidate),
      }));
    } catch (failure) {
      if (mountedRef.current && failure.code !== "ERR_CANCELED") {
        updateOffer(message.id, offer.id, { status: "pending", error: failure.response?.data?.detail || "Không kiểm tra được tồn kho. Chưa thêm món nào; bạn thử lại nhé." });
      }
    } finally {
      actingRef.current = false;
      if (mountedRef.current) setBusy(false);
    }
  };

  const reset = async () => {
    if (chat.busy || actingRef.current) return;
    await chat.reset(); setInput(""); inputRef.current?.focus();
  };
  const lastAssistant = messages.findLast((message) => message.role === "assistant");

  return (
    <div className="furniture-chat">
      {open && <section id={panelId} className="furniture-chat-panel" role="dialog" aria-labelledby={`${panelId}-title`}
        onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}>
        <header className="furniture-chat-header">
          <div className="furniture-chat-avatar"><Sparkles size={22} /></div>
          <div><h2 id={`${panelId}-title`}>Tư vấn FurniHome</h2><p><span /> {chat.online ? "Nhân viên đang online" : "Trợ lý tự động đang hỗ trợ"}</p></div>
          <button type="button" onClick={reset} disabled={busy} title="Cuộc trò chuyện mới" aria-label="Cuộc trò chuyện mới"><RotateCcw size={17} /></button>
          <button type="button" onClick={close} aria-label="Đóng khung tư vấn"><ChevronDown size={23} /></button>
        </header>

        <div className="furniture-chat-messages" ref={listRef} role="log" aria-label="Cuộc trò chuyện tư vấn" aria-live="polite" aria-relevant="additions text">
          <p className="furniture-chat-note">Chat tạm thời · Làm mới, đăng xuất hoặc rời trang sẽ xóa cuộc trò chuyện.</p>
          {messages.map((message) => <div key={message.id} className={`furniture-chat-message ${message.role}`}>
            {message.role === "assistant" && <small className="furniture-chat-sender">{message.source === "admin" ? "Tư vấn viên FurniHome" : "Trợ lý tự động"}</small>}
            <p className="furniture-chat-bubble">{message.text}</p>
            {message.offers?.filter((offer) => !offer.parentId).map((offer) => <div className="furniture-chat-offer" key={offer.id}>
              {offer.kind === "bundle" && <h3><ShoppingBag size={16} />{offer.title}</h3>}
              {offer.items.map((item) => <div key={item.product.id} className="furniture-chat-product">
                {item.product.primary_image && <Link to={`/products/${item.product.id}`} aria-label={`Xem ${item.product.name}`}><img src={productImageUrl(item.product.primary_image)} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} /></Link>}
                <div><Link to={`/products/${item.product.id}`}>{item.product.name}</Link>
                  <strong>{price(item.product.price)}{item.quantity > 1 && ` × ${item.quantity}`}</strong>
                  {item.product.dimensions && <small>{item.product.dimensions}</small>}
                  {offer.kind === "bundle" && message.offers.filter((candidate) => candidate.parentId === offer.id && candidate.items[0].product.id === item.product.id)
                    .map((single) => <OfferActions key={single.id} offer={single} busy={busy} compact onYes={() => confirm(message, single)}
                      onNo={() => updateOffer(message.id, single.id, { status: "declined", error: "" })} />)}
                </div>
              </div>)}
              {offer.kind === "bundle" && <div className="furniture-chat-total"><span>Tổng {offer.items.length} món</span><strong>{price(offer.total_price)}</strong></div>}
              <OfferActions offer={offer} busy={busy} onYes={() => confirm(message, offer)}
                onNo={() => updateOffer(message.id, offer.id, { status: "declined", error: "" })} />
            </div>)}
          </div>)}
          {busy && <div className="furniture-chat-working" role="status"><LoaderCircle size={15} className="furniture-chat-spin" />{busy === "cart" ? "Đang kiểm tra sản phẩm…" : "Đang chọn gợi ý cho bạn…"}</div>}
          {chat.waiting && !busy && <div className="furniture-chat-working" role="status">Đã chuyển tin cho tư vấn viên. Bạn có thể nhắn thêm trong lúc chờ.</div>}
          {error && <div className="furniture-chat-error" role="alert">{error}{retryMessage && <button type="button" disabled={busy} onClick={() => send(retryMessage.message, true)}>Thử lại</button>}</div>}
          {!busy && !error && <div className="furniture-chat-suggestions">{lastAssistant?.suggestions?.map((suggestion) => <button type="button" key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>)}</div>}
        </div>

        <Link to="/cart" className="furniture-chat-cart"><ShoppingBag size={15} /> Xem giỏ hàng <span>{cart.reduce((total, item) => total + item.quantity, 0)} món</span></Link>
        <form className="furniture-chat-form" onSubmit={(event) => { event.preventDefault(); send(input); }}>
          <label className="furniture-chat-sr" htmlFor={`${panelId}-input`}>Nhập câu hỏi tư vấn</label>
          <input id={`${panelId}-input`} ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)}
            maxLength={1200} placeholder="Ví dụ: Phòng ngủ, ngân sách 30 triệu…" autoComplete="off" />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Gửi câu hỏi"><Send size={19} /></button>
        </form>
      </section>}
      <button type="button" className="furniture-chat-launcher" ref={launcherRef} aria-expanded={open} aria-controls={open ? panelId : undefined}
        onClick={() => open ? close() : setOpen(true)} aria-label={open ? "Đóng tư vấn nội thất" : "Mở chat tư vấn nội thất"}>
        {open ? <X size={23} /> : <><MessageCircle size={24} /><span>Tư vấn nội thất</span><i /></>}
      </button>
    </div>
  );
}

function OfferActions({ offer, busy, compact = false, onYes, onNo }) {
  const labels = { added: "Đã thêm vào giỏ", declined: "Đã bỏ qua, chưa thêm", expired: "Gợi ý đã đóng", checking: "Đang kiểm tra…" };
  return <div className={`furniture-chat-actions ${compact ? "compact" : ""}`}>
    {offer.status === "pending" ? <>
      <p>{compact ? "Thêm riêng món này?" : `Bạn có muốn tôi thêm ${offer.kind === "bundle" ? "cả bộ" : "món này"} vào giỏ hàng luôn không?`}</p>
      <div><button type="button" disabled={busy} className="yes" onClick={onYes}><Check size={13} />{compact ? "Có" : "Có, thêm vào giỏ"}</button>
        <button type="button" disabled={busy} onClick={onNo}>Không</button></div>
    </> : <p className={`furniture-chat-offer-status ${offer.status}`} role="status">{labels[offer.status]}</p>}
    {offer.error && <p className="furniture-chat-error" role="alert">{offer.error}</p>}
  </div>;
}
