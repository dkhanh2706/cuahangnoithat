import api from "./api";

export function beaconPost(path, body) {
  const url = new URL(path, api.defaults.baseURL).href;
  const json = JSON.stringify(body);
  if (navigator.sendBeacon?.(url, new Blob([json], { type: "application/json" }))) return;
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: json, keepalive: true }).catch(() => {});
}

export function welcomeMessage() {
  return { id: "welcome", role: "assistant", source: "bot", offers: [],
    text: "Chào bạn! FurniHome sẽ tư vấn trực tiếp khi nhân viên online; trợ lý tự động hỗ trợ khi nhân viên vắng mặt. Bạn muốn sắm cho phòng nào, diện tích và ngân sách khoảng bao nhiêu?",
    suggestions: ["Phòng ngủ nên có những món gì?", "Tư vấn phòng khách", "Tìm sofa dưới 15 triệu"] };
}

export function mergeChatMessages(previous, incoming) {
  const known = new Map(previous.map((message) => [message.id, message]));
  const lastOfferIndex = incoming.findLastIndex((message) => message.offers?.length);
  const lastUserIndex = incoming.findLastIndex((message) => message.role === "user");
  return [previous.find((message) => message.id === "welcome") || welcomeMessage(), ...incoming.map((message, index) => {
    const old = known.get(message.id);
    const offers = message.offers.flatMap((offer) => {
      const main = { ...offer, status: "pending", error: "" };
      return offer.kind !== "bundle" ? [main] : [main, ...offer.items.map((item) => ({
        id: `single-${item.product.id}`, kind: "product", title: item.product.name, items: [item],
        total_price: item.product.price * item.quantity, parentId: offer.id, status: "pending", error: "",
      }))];
    }).map((offer) => {
      const saved = old?.offers.find((candidate) => candidate.id === offer.id);
      const merged = saved || offer;
      return merged.status === "pending" && (index < lastOfferIndex || index < lastUserIndex)
        ? { ...merged, status: "expired" } : merged;
    });
    return { ...message, source: message.role, role: message.role === "user" ? "user" : "assistant", offers };
  })];
}
