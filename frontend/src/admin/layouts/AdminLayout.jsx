import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Users,
  Package,
  Store,
  LogOut,
  Menu,
  X,
  Crown,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import "../styles/Admin.css";

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    window.dispatchEvent(new Event("session-ending"));
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  const getPageTitle = () => {
    if (location.pathname.includes("/admin/chat")) return "Tư Vấn Khách Hàng";
    if (location.pathname.includes("/admin/products")) return "Quản Lý Sản Phẩm";
    if (location.pathname.includes("/admin/users") || location.pathname === "/admin") {
      return "Quản Lý Tài Khoản Người Dùng";
    }
    return "Bảng Quản Trị Hệ Thống";
  };

  return (
    <div className={`admin-root${location.pathname.startsWith("/admin/chat") ? " admin-chat-root" : ""}`}>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-brand">
            <div className="admin-brand-icon">
              <span>F</span>
              <Crown size={14} className="brand-crown" />
            </div>
            <div className="admin-brand-text">
              <h2>FurniHome</h2>
              <span className="brand-badge">ADMIN PORTAL</span>
            </div>
          </Link>
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-sidebar-nav">
          <div className="nav-group-title">QUẢN TRỊ HỆ THỐNG</div>

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "admin-nav-item active" : "admin-nav-item"
            }
            onClick={() => setSidebarOpen(false)}
          >
            <Users size={18} />
            <span>Quản lý Người dùng</span>
          </NavLink>

          <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-item${isActive ? " active" : ""}`} onClick={() => setSidebarOpen(false)}>
            <Package size={18} /><span>Quản lý Sản phẩm</span>
          </NavLink>

          <NavLink to="/admin/chat" className={({ isActive }) => `admin-nav-item${isActive ? " active" : ""}`} onClick={() => setSidebarOpen(false)}>
            <MessageCircle size={18} /><span>Tư vấn khách hàng</span>
          </NavLink>

          <div className="nav-group-title" style={{ marginTop: "24px" }}>
            LIÊN KẾT NGOÀI
          </div>

          <Link
            to="/"
            className="admin-nav-item external"
            target="_blank"
            rel="noreferrer"
          >
            <Store size={18} />
            <span>Xem Cửa Hàng FurniHome</span>
          </Link>
        </div>

        {/* Sidebar Footer with Admin Profile */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-avatar-small">
              {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
              <ShieldCheck size={12} className="avatar-shield" />
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">
                {user?.full_name || "Admin HDK"}
              </span>
              <span className="admin-user-email">
                adminhdk@gmail.com
              </span>
            </div>
          </div>

          <button
            className="admin-logout-btn"
            onClick={handleLogout}
            title="Đăng xuất khỏi trang quản trị"
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-main-wrapper">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>

            <div className="admin-breadcrumb">
              <span className="bc-root">Admin</span>
              <ChevronRight size={14} className="bc-sep" />
              <span className="bc-current">{getPageTitle()}</span>
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-system-status">
              <span className="status-indicator-dot" />
              <span>Hệ thống trực tuyến</span>
            </div>

            <Link to="/" className="view-store-pill">
              <Store size={15} />
              <span>Cửa hàng</span>
            </Link>

            <div className="admin-header-profile">
              <div className="profile-badge">
                <Sparkles size={13} />
                <span>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="admin-content-area">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
