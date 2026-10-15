import { Navigate, useLocation, Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";

const ADMIN_EMAIL = "adminhdk@gmail.com";

function AdminRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Chưa đăng nhập -> Chuyển về trang đăng nhập
  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  // Đã đăng nhập nhưng không phải adminhdk@gmail.com
  const isSuperAdmin =
    user &&
    user.role === "ADMIN" &&
    user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isSuperAdmin) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f1013 0%, #1a1c22 100%)",
        color: "#ffffff",
        padding: "24px"
      }}>
        <div style={{
          maxWidth: "480px",
          width: "100%",
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(220, 38, 38, 0.3)",
          borderRadius: "16px",
          padding: "36px 28px",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          backdropFilter: "blur(12px)"
        }}>
          <div style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "rgba(220, 38, 38, 0.15)",
            color: "#f87171",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px"
          }}>
            <ShieldAlert size={36} />
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: "#fca5a5" }}>
            Truy Cập Bị Từ Chối (403)
          </h2>

          <p style={{ fontSize: "14px", color: "#9ca3af", lineHeight: "1.6", marginBottom: "20px" }}>
            Trang quản trị chỉ dành riêng cho tài khoản quản trị viên duy nhất của hệ thống:
            <br />
            <strong style={{ color: "#e5e7eb" }}>adminhdk@gmail.com</strong>.
            <br />
            Tài khoản hiện tại của bạn không có thẩm quyền truy cập.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "8px",
                background: "#c59b6c",
                color: "#0f1013",
                fontWeight: "600",
                fontSize: "14px",
                textDecoration: "none",
                transition: "all 0.2s ease"
              }}
            >
              <ArrowLeft size={16} /> Quay về Trang chủ Cửa hàng
            </Link>

            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                fontWeight: "500",
                fontSize: "14px",
                textDecoration: "none",
                border: "1px solid rgba(255, 255, 255, 0.12)"
              }}
            >
              <LogIn size={16} /> Đăng nhập tài khoản khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default AdminRoute;
