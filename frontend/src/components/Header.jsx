import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { readUser, saveUser } from "../services/session";
import UserAvatar from "./UserAvatar";
import "../styles/Header.css";


function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, wishlist } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("access_token");
  const [user, setUser] = useState(readUser);

  useEffect(() => {
    let active = true;
    const update = () => setUser(readUser());
    window.addEventListener("user-updated", update);
    window.addEventListener("storage", update);
    if (token) {
      api.get("/api/users/me").then(({ data }) => { if (active) saveUser(data); }).catch(() => {});
    }
    return () => { active = false; window.removeEventListener("user-updated", update); window.removeEventListener("storage", update); };
  }, [token]);

  // Detect scroll for glassmorphism elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Main Glassmorphic Header — NO announcement bar */}
      <header className={`main-header ${isScrolled ? "header-scrolled" : ""}`}>
        <div className="header-container">
          {/* Mobile Menu Hamburger Toggle */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="brand">
            <div className="brand-logo">
              <span>F</span>
            </div>
            <div className="brand-text">
              <h2>FurniHome</h2>
              <span>Interior Living</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="main-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Sản phẩm
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Lịch sử đơn hàng
            </NavLink>
            <NavLink
              to="/collections"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Bộ sưu tập
            </NavLink>
            <NavLink to="/reviews" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Đánh giá
            </NavLink>
          </nav>

          {/* Header Action Tools */}
          <div className="header-actions">
            {/* Search Trigger */}
            <button
              className="action-icon-btn search-trigger"
              onClick={() => setSearchOpen(!searchOpen)}
              title="Tìm kiếm sản phẩm"
            >
              <Search size={19} />
            </button>

            {/* Wishlist Button — links directly to /wishlist */}
            <Link
              to="/wishlist"
              className="action-icon-btn"
              title="Sản phẩm yêu thích"
            >
              <Heart size={19} />
              {wishlist.length > 0 && (
                <span className="badge-counter wishlist-badge">{wishlist.length}</span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              className="action-icon-btn cart-btn"
              onClick={() => navigate("/cart")}
              title="Giỏ hàng của bạn"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="badge-counter cart-badge">{cartCount}</span>
              )}
            </button>

            {/* Auth Actions / User Menu */}
            {!token ? (
              <div className="auth-buttons">
                <Link to="/login" className="login-link">
                  Đăng nhập
                </Link>
                <Link to="/register" className="register-btn">
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="user-menu-wrapper">
                <button
                  className={`user-button ${userDropdownOpen ? "open" : ""}`}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="user-avatar">
                    <UserAvatar user={user} />
                  </div>
                  <span className="user-name">
                    {user?.full_name?.split(" ").slice(-1)[0] || "Tài khoản"}
                  </span>
                  <ChevronDown size={14} className="user-chevron" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-header">
                      <strong>{user?.full_name || "Khách hàng"}</strong>
                      <small>{user?.email || ""}</small>
                    </div>
                    <div className="dropdown-divider" />
                    {user?.role === "ADMIN" && user?.email?.toLowerCase() === "adminhdk@gmail.com" && (
                      <button
                        className="dropdown-item"
                        style={{ color: "#c59b6c", fontWeight: "600" }}
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate("/admin");
                        }}
                      >
                        <ShieldCheck size={16} />
                        <span>Trang Quản Trị Admin</span>
                      </button>
                    )}
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate("/profile");
                      }}
                    >
                      <User size={16} />
                      <span>Hồ sơ cá nhân</span>
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate("/cart");
                      }}
                    >
                      <ShoppingBag size={16} />
                      <span>Giỏ hàng ({cartCount})</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Expandable Search Bar Drawer */}
        {searchOpen && (
          <div className="header-search-bar animate-slide-down">
            <div className="header-search-inner">
              <form onSubmit={handleSearchSubmit} className="header-search-form">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bàn ghế, sofa, giường ngủ, đèn trang trí..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="search-submit-btn">
                  Tìm kiếm <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  className="search-close-btn"
                  onClick={() => setSearchOpen(false)}
                >
                  <X size={18} />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div className="brand">
                <div className="brand-logo">F</div>
                <div className="brand-text">
                  <h2>FurniHome</h2>
                  <span>Interior Living</span>
                </div>
              </div>
              <button
                className="drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={22} />
              </button>
            </div>

            <nav className="mobile-nav-links">
              {user?.role === "ADMIN" && user?.email?.toLowerCase() === "adminhdk@gmail.com" && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: "#c59b6c", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <ShieldCheck size={18} />
                  <span>Trang Quản Trị Admin</span>
                </NavLink>
              )}
              <NavLink to="/" end onClick={() => setMobileMenuOpen(false)}>
                Trang chủ
              </NavLink>
              <NavLink to="/products" onClick={() => setMobileMenuOpen(false)}>
                Sản phẩm
              </NavLink>
              <NavLink to="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                Yêu thích {wishlist.length > 0 && `(${wishlist.length})`}
              </NavLink>
              <NavLink to="/orders" onClick={() => setMobileMenuOpen(false)}>
                Lịch sử đơn hàng
              </NavLink>
              <NavLink to="/collections" onClick={() => setMobileMenuOpen(false)}>
                Bộ sưu tập
              </NavLink>
              <Link to="/reviews" onClick={() => setMobileMenuOpen(false)}>
                Đánh giá khách hàng
              </Link>
            </nav>

            <div className="mobile-drawer-footer">
              {!token ? (
                <div className="mobile-auth-actions">
                  <Link
                    to="/login"
                    className="mobile-btn-outline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="mobile-btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký tài khoản
                  </Link>
                </div>
              ) : (
                <div className="mobile-user-box">
                  <div className="mobile-user-info">
                    <div className="user-avatar">
                      <UserAvatar user={user} />
                    </div>
                    <div>
                      <strong>{user?.full_name}</strong>
                      <p>{user?.email}</p>
                    </div>
                  </div>
                  <button className="mobile-logout-btn" onClick={handleLogout}>
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

}

export default Header;
