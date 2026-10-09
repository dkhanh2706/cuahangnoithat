import { Link, NavLink, useNavigate } from "react-router-dom";

import "../styles/Header.css";

function Header() {
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("access_token");

    localStorage.removeItem("user");

    navigate("/");

    window.location.reload();
  };

  const handleProtectedNavigate = (path) => {
    if (!token) {
      navigate("/login");

      return;
    }

    navigate(path);
  };

  return (
    <header className="main-header">
      <div className="header-container">
        {/* LOGO */}

        <Link to="/" className="brand">
          <div className="brand-logo">F</div>

          <div className="brand-text">
            <h2>FurniHome</h2>

            <span>Interior Living</span>
          </div>
        </Link>

        {/* MENU */}

        <nav className="main-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "nav-active" : "")}
          >
            Trang chủ
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) => (isActive ? "nav-active" : "")}
          >
            Sản phẩm
          </NavLink>

          <a href="/#collections">Bộ sưu tập</a>

          <a href="/#about">Về chúng tôi</a>
        </nav>

        {/* ACTION */}

        <div className="header-actions">
          {/* CART */}

          <button
            className="header-icon-btn"
            onClick={() => handleProtectedNavigate("/cart")}
            title="Giỏ hàng"
          >
            <span>🛒</span>
          </button>

          {!token ? (
            <>
              <Link to="/login" className="login-link">
                Đăng nhập
              </Link>

              <Link to="/register" className="register-btn">
                Đăng ký
              </Link>
            </>
          ) : (
            <div className="user-menu">
              <button
                className="user-button"
                onClick={() => navigate("/profile")}
              >
                <div className="user-avatar">
                  {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <span>{user?.full_name || "Tài khoản"}</span>
              </button>

              <button className="logout-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
