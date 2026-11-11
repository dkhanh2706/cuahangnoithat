export function readUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
}

export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("user-updated"));
}

// Đăng xuất: xóa cả giỏ hàng và yêu thích lưu tạm trong trình duyệt để
// tài khoản đăng nhập sau trên cùng máy không thừa hưởng dữ liệu của người trước.
export function endSession() {
  window.dispatchEvent(new Event("session-ending"));
  for (const key of ["access_token", "user", "furni_cart", "furni_wishlist_v2"]) {
    localStorage.removeItem(key);
  }
}
