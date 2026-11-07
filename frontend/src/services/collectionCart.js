import api from "./api";
import { productImageUrl } from "./media";

export async function checkCollectionItems(products, cart) {
  const { data } = await api.post("/api/advisor/check-cart", {
    items: products.map(product => ({ product_id: product.id, quantity: 1,
      cart_quantity: cart.find(item => item.product.id === product.id)?.quantity || 0 })),
  });
  if (data.some(item => Number(item.product.price) !== Number(products.find(p => p.id === item.product.id).price))) {
    throw new Error("Giá vừa thay đổi. Vui lòng xem lại giá mới trước khi thêm vào giỏ.");
  }
  return data.map(item => ({ ...item, product: { ...item.product, primary_image: productImageUrl(item.product.primary_image) } }));
}
