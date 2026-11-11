import { useEffect, useRef, useState } from "react";
import adminService from "../services/adminService";

const POLL_INTERVAL_MS = 30000;

// Theo dõi số đơn đang chờ xác nhận. Khi có đơn mới (mã đơn lớn hơn lần trước)
// thì báo qua `newOrder` để giao diện hiện thông báo.
export default function usePendingOrders() {
  const [pending, setPending] = useState(0);
  const [newOrder, setNewOrder] = useState(false);
  const lastSeenId = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const summary = await adminService.getOrdersSummary();
        if (cancelled) return;
        setPending(summary.pending);
        if (lastSeenId.current !== null && summary.latest_order_id > lastSeenId.current) {
          setNewOrder(true);
        }
        lastSeenId.current = summary.latest_order_id;
      } catch {
        // Bỏ qua lỗi tạm thời; lần kiểm tra sau sẽ thử lại.
      }
    };

    check();
    const timer = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // Hiện số đơn chờ trên tiêu đề tab để admin thấy cả khi đang ở tab khác.
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = pending > 0 ? `(${pending}) ${base}` : base;
    return () => {
      document.title = base;
    };
  }, [pending]);

  return { pending, newOrder, dismissNewOrder: () => setNewOrder(false) };
}
