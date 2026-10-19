import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { beaconPost } from "../../services/liveChat";

export default function useChatPresence(accepting) {
  const [presence, setPresence] = useState({ online: false, error: "" });
  const leaseRef = useRef(null);

  useEffect(() => {
    if (!accepting) return;
    let active = true;
    let inFlight = false;
    const tabId = crypto.randomUUID();
    const leave = () => {
      if (leaseRef.current) beaconPost("/api/live-chat/admin/leave", leaseRef.current);
      leaseRef.current = null;
    };
    const beat = async () => {
      if (inFlight || !active) return;
      inFlight = true;
      try {
        const { data } = await api.post("/api/live-chat/admin/presence", { tab_id: tabId }, { timeout: 10000 });
        const lease = { tab_id: data.tab_id, token: data.token };
        if (!active) { beaconPost("/api/live-chat/admin/leave", lease); return; }
        leaseRef.current = lease;
        setPresence({ online: true, error: "" });
      } catch {
        if (active) setPresence({ online: false, error: "Mất kết nối nhận tư vấn. Đang thử kết nối lại; bot sẽ tiếp nhận khi heartbeat quá 30 giây." });
      } finally { inFlight = false; }
    };
    beat();
    const timer = window.setInterval(beat, 10000);
    window.addEventListener("online", beat);
    window.addEventListener("pageshow", beat);
    window.addEventListener("pagehide", leave);
    window.addEventListener("session-ending", leave);
    return () => {
      active = false; window.clearInterval(timer); leave();
      window.removeEventListener("online", beat); window.removeEventListener("pageshow", beat);
      window.removeEventListener("pagehide", leave); window.removeEventListener("session-ending", leave);
    };
  }, [accepting]);

  const credentials = () => leaseRef.current;
  return { online: accepting && presence.online, error: accepting ? presence.error : "", credentials };
}
