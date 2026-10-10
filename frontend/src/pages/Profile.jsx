import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag,
  Heart,
  LogOut,
  Sparkles,
  Package,
  Trash2,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { MOCK_PRODUCTS } from "../data/mockProducts";
import "../styles/Profile.css";
import "../styles/home/ProductShowcase.css";

const MOCK_ORDERS = [
  {
    code: "FH-894210",
    date: "12/03/2026",
    items: "Sofa Scandinavia Nord x 1",
    total: 18500000,
    status: "Đang vận chuyển",
    statusType: "shipping",
  },
  {
    code: "FH-731055",
    date: "28/01/2026",
    items: "Bàn ăn mở rộng OAK x 1, Bộ 4 ghế Elbow x 1",
    total: 18700000,
    status: "Đã giao thành công",
    statusType: "delivered",
  },
];

function Profile() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart, showToast } = useCart();

  const [activeTab, setActiveTab] = useState("info");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [userInfo, setUserInfo] = useState({
    full_name: storedUser.full_name || "Nguyễn Minh Khoa",
    email: storedUser.email || "minhkhoa@gmail.com",
    phone: storedUser.phone || "0912 345 678",
    address: storedUser.address || "123 Lê Lợi, P. Bến Nghé, Quận 1, TP.HCM",
  });

  const handleSaveInfo = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify({ ...storedUser, ...userInfo }));
    showToast("Cập nhật thông tin thành công!", "success");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const wishlistedProducts = MOCK_PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-layout">
          {/* SIDEBAR */}
          <aside className="profile-sidebar">
            <div className="profile-user-summary">
              <div className="profile-large-avatar">
                {userInfo.full_name.charAt(0).toUpperCase()}
              </div>
              <h3>{userInfo.full_name}</h3>
              <p>{userInfo.email}</p>
              <div className="member-tier-pill">
                <Sparkles size={13} /> Thành viên Vàng (Gold)
              </div>
            </div>

            <nav className="profile-nav">
              <button
                className={`profile-nav-btn ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                <User size={18} />
                <span>Hồ sơ cá nhân</span>
              </button>

              <button
                className={`profile-nav-btn ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <Package size={18} />
                <span>Lịch sử đơn hàng</span>
              </button>

              <button
                className={`profile-nav-btn ${activeTab === "wishlist" ? "active" : ""}`}
                onClick={() => setActiveTab("wishlist")}
              >
                <Heart size={18} />
                <span>Yêu thích ({wishlist.length})</span>
              </button>

              <button className="profile-nav-btn logout" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </aside>

          {/* MAIN PANEL */}
          <main className="profile-content-panel">
            {activeTab === "info" && (
              <div>
                <div className="panel-header">
                  <h2>Thông tin tài khoản</h2>
                  <p>Quản lý thông tin liên hệ và địa chỉ nhận hàng của bạn</p>
                </div>

                <form onSubmit={handleSaveInfo}>
                  <div className="profile-form-grid">
                    <div className="profile-field">
                      <label>Họ và tên</label>
                      <input
                        type="text"
                        value={userInfo.full_name}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, full_name: e.target.value })
                        }
                      />
                    </div>

                    <div className="profile-field">
                      <label>Địa chỉ Email</label>
                      <input
                        type="email"
                        value={userInfo.email}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="profile-field">
                      <label>Số điện thoại</label>
                      <input
                        type="tel"
                        value={userInfo.phone}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="profile-field">
                      <label>Địa chỉ nhận hàng mặc định</label>
                      <input
                        type="text"
                        value={userInfo.address}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, address: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <button type="submit" className="profile-save-btn">
                    Lưu thay đổi
                  </button>
                </form>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <div className="panel-header">
                  <h2>Lịch sử đơn hàng</h2>
                  <p>Theo dõi tiến độ vận chuyển và các đơn hàng đã đặt</p>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Ngày đặt</th>
                        <th>Sản phẩm</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_ORDERS.map((o) => (
                        <tr key={o.code}>
                          <td>
                            <strong>{o.code}</strong>
                          </td>
                          <td>{o.date}</td>
                          <td>{o.items}</td>
                          <td>
                            <strong>{Number(o.total).toLocaleString("vi-VN")}₫</strong>
                          </td>
                          <td>
                            <span className={`status-badge ${o.statusType}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <div className="panel-header">
                  <h2>Danh sách yêu thích</h2>
                  <p>Các thiết kế nội thất bạn đang quan tâm và muốn sở hữu</p>
                </div>

                {wishlistedProducts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "50px 0", color: "#888" }}>
                    <p>Bạn chưa lưu sản phẩm nào vào danh sách yêu thích.</p>
                  </div>
                ) : (
                  <div className="showcase-grid">
                    {wishlistedProducts.map((p) => (
                      <article className="showcase-card" key={p.id}>
                        <div className="showcase-image">
                          <img src={p.primary_image} alt={p.name} />
                          <button
                            className="wishlist-btn active"
                            onClick={() => toggleWishlist(p)}
                            title="Bỏ yêu thích"
                          >
                            <Trash2 size={16} color="#e74c3c" />
                          </button>
                        </div>
                        <div className="showcase-info">
                          <h3 className="showcase-title">{p.name}</h3>
                          <div className="showcase-price-row">
                            <strong className="current-price">
                              {Number(p.price).toLocaleString("vi-VN")}₫
                            </strong>
                            <button
                              onClick={() => addToCart(p, 1)}
                              style={{
                                background: "#1e3428",
                                color: "#fff",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <ShoppingBag size={14} /> Thêm vào giỏ
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Profile;
