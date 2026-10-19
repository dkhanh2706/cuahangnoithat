import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";
import { beaconPost, mergeChatMessages, welcomeMessage } from "../services/liveChat";

export default function useCustomerChat(open) {
  const [messages, setMessages] = useState(() => [welcomeMessage()]);
  const [online, setOnline] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [retryMessage, setRetryMessage] = useState(null);
  const sessionRef = useRef(null);
  const generationRef = useRef(0);
  const sendingRef = useRef(false);
  const mountedRef = useRef(true);
  const retryRef = useRef(null);
  const countRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    const release = () => {
      generationRef.current++;
      if (sessionRef.current) beaconPost(`/api/live-chat/sessions/${sessionRef.current.id}/close`, { token: sessionRef.current.token });
      sessionRef.current = null;
    };
    const discard = () => {
      release();
      countRef.current = 0;
      retryRef.current = null;
      setMessages([welcomeMessage()]); setWaiting(false); setError(""); setRetryMessage(null);
    };
    const storage = (event) => { if (event.key === "access_token" && !event.newValue) discard(); };
    window.addEventListener("pagehide", discard);
    window.addEventListener("session-ending", discard);
    window.addEventListener("storage", storage);
    return () => {
      mountedRef.current = false;
      release();
      window.removeEventListener("pagehide", discard);
      window.removeEventListener("session-ending", discard);
      window.removeEventListener("storage", storage);
    };
  }, []);

  const applySnapshot = useCallback((data) => {
    if (data.messages.length < countRef.current) return;
    if (data.messages.length > countRef.current) {
      countRef.current = data.messages.length;
      setMessages((previous) => mergeChatMessages(previous, data.messages));
    }
    setOnline(data.admin_online); setWaiting(data.pending_count > 0);
    setConnectionError("");
    if (retryRef.current && data.messages.some((message) => message.client_id === retryRef.current.client_id)) {
      retryRef.current = null; setRetryMessage(null); setError("");
    }
  }, []);

  useEffect(() => {
    let active = true;
    let timer;
    const poll = async () => {
      const session = sessionRef.current;
      const generation = generationRef.current;
      try {
        if (session) {
          const { data } = await api.get(`/api/live-chat/sessions/${session.id}`, { headers: { "X-Chat-Token": session.token }, timeout: 12000 });
          if (active && generation === generationRef.current) applySnapshot(data);
        } else if (open) {
          const { data } = await api.get("/api/live-chat/status", { timeout: 10000 });
          if (active) setOnline(data.admin_online);
        }
      } catch (failure) {
        if (active && generation === generationRef.current && session) {
          if (failure.response?.status === 404) {
            sessionRef.current = null; generationRef.current++; countRef.current = 0;
            retryRef.current = null; setRetryMessage(null); setWaiting(false); setMessages([welcomeMessage()]);
            setError("Phiên chat đã kết thúc hoặc server vừa khởi động lại. Bạn có thể bắt đầu trò chuyện mới.");
          } else setConnectionError("Đang mất kết nối chat. Hệ thống sẽ tự kết nối lại; tin đã gửi không cần gửi thêm lần nữa.");
        }
      } finally {
        if (active) timer = window.setTimeout(poll, 2000);
      }
    };
    poll();
    return () => { active = false; window.clearTimeout(timer); };
  }, [open, applySnapshot]);

  const send = async (text, productId = null, suggestedIds = [], retry = false) => {
    const message = text.trim();
    if (!message || message.length > 1200 || sendingRef.current) return;
    sendingRef.current = true; setBusy(true); setError("");
    const generation = generationRef.current;
    const payload = retry && retryRef.current ? retryRef.current : { message, client_id: crypto.randomUUID(), product_id: productId, suggested_ids: suggestedIds };
    try {
      if (!sessionRef.current) {
        const { data } = await api.post("/api/live-chat/sessions", null, { timeout: 15000 });
        if (!mountedRef.current || generation !== generationRef.current) {
          beaconPost(`/api/live-chat/sessions/${data.id}/close`, { token: data.token });
          return;
        }
        sessionRef.current = data;
      }
      const session = sessionRef.current;
      const { data } = await api.post(`/api/live-chat/sessions/${session.id}/messages`, payload,
        { headers: { "X-Chat-Token": session.token }, timeout: 20000 });
      if (mountedRef.current && generation === generationRef.current) {
        applySnapshot(data); retryRef.current = null; setRetryMessage(null); setError("");
      }
    } catch (failure) {
      if (mountedRef.current && generation === generationRef.current) {
        retryRef.current = payload; setRetryMessage(payload);
        setError(typeof failure.response?.data?.detail === "string" ? failure.response.data.detail : "Chưa gửi được tin nhắn. Bạn có thể thử lại; hệ thống sẽ không gửi trùng.");
      }
    } finally {
      sendingRef.current = false;
      if (mountedRef.current) setBusy(false);
    }
  };

  const reset = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true; setBusy(true); setError(""); generationRef.current++;
    const session = sessionRef.current;
    try {
      if (session) await api.post(`/api/live-chat/sessions/${session.id}/close`, { token: session.token }, { timeout: 12000 });
      sessionRef.current = null; countRef.current = 0; retryRef.current = null;
      setMessages([welcomeMessage()]); setRetryMessage(null); setWaiting(false);
    } catch {
      setError("Chưa xóa được phiên chat trên server. Bạn hãy bấm làm mới lại khi có kết nối.");
    } finally {
      sendingRef.current = false;
      if (mountedRef.current) setBusy(false);
    }
  };

  return { messages, setMessages, online, waiting, busy, error: error || connectionError, retryMessage, send, reset };
}
