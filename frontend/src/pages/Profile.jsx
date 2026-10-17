import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag,
  Heart,
  LogOut,
  Sparkles,
  Camera,
  Trash2,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { readUser, saveUser } from "../services/session";
import UserAvatar from "../components/UserAvatar";
import { productImageUrl } from "../services/media";
import "../styles/Profile.css";
import "../styles/home/ProductShowcase.css";

function Profile() {
  const navigate = useNavigate();
  const { wishlist, wishlistProducts, toggleWishlist, addToCart, showToast } = useCart();

  const [activeTab, setActiveTab] = useState("info");
  const [storedUser, setStoredUser] = useState(() => readUser() || {});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const uploadLock = useRef(false);
  const saveLock = useRef(false);

  const [userInfo, setUserInfo] = useState({
    full_name: storedUser.full_name || "",
    email: storedUser.email || "",
    phone: storedUser.phone || "",
    address: storedUser.address || "",
  });

  useEffect(() => {
    let active = true;
    api.get("/api/users/me").then(({ data }) => {
      if (!active) return;
      setStoredUser(data);
      setUserInfo({ full_name: data.full_name, email: data.email, phone: data.phone || "", address: data.address || "" });
      saveUser(data);
    }).catch(() => { if (active) setProfileError("Không thể tải hồ sơ. Vui lòng tải lại trang."); })
      .finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (saveLock.current || uploading) return;
    saveLock.current = true; setSaving(true);
    try {
      const { data } = await api.patch("/api/users/me", { full_name: userInfo.full_name, phone: userInfo.phone, address: userInfo.address });
      setStoredUser(data); saveUser(data);
      setUserInfo({ full_name: data.full_name, email: data.email, phone: data.phone || "", address: data.address || "" });
      showToast("Cập nhật thông tin thành công!", "success");
    } catch (err) {
      showToast(typeof err.response?.data?.detail === "string" ? err.response.data.detail : "Không thể lưu thông tin. Vui lòng thử lại.", "error");
    } finally { saveLock.current = false; setSaving(false); }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploadLock.current || saving) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      showToast("Vui lòng chọn ảnh JPG, PNG hoặc WebP tối đa 5 MB.", "error"); return;
    }
    uploadLock.current = true; setUploading(true);
    const form = new FormData(); form.append("file", file);
    try {
      const { data } = await api.post("/api/users/me/avatar", form, { headers: { "Content-Type": "multipart/form-data" } });
      setStoredUser(data); saveUser(data);
      showToast("Đã cập nhật ảnh đại diện!", "success");
    } catch (err) {
      showToast(typeof err.response?.data?.detail === "string" ? err.response.data.detail : "Không thể tải ảnh lên. Vui lòng thử lại.", "error");
    } finally { uploadLock.current = false; setUploading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const wishlistedProducts = wishlistProducts;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-layout">
          {/* SIDEBAR */}
          <aside className="profile-sidebar">
            <div className="profile-user-summary">
              <div className="profile-large-avatar">
                <UserAvatar user={storedUser} />
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
                  {profileError && <p role="alert">{profileError}</p>}
                  {profileLoading && <p role="status">Đang tải hồ sơ...</p>}
                  <div className="profile-avatar-editor">
                    <div className="profile-large-avatar"><UserAvatar user={storedUser} /></div>
                    <div>
                      <label className="profile-avatar-upload"><Camera size={17} />{uploading ? "Đang tải ảnh..." : "Đổi ảnh đại diện"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} disabled={uploading || saving || profileLoading || Boolean(profileError)} /></label>
                      <p>JPG, PNG hoặc WebP · Tối đa 5 MB</p>
                      <small>Ảnh được lưu ngay và hiển thị cạnh tên trên header.</small>
                    </div>
                  </div>
                  <fieldset className="profile-fields-group" disabled={saving || uploading || profileLoading || Boolean(profileError)}>
                  <div className="profile-form-grid">
                    <div className="profile-field">
                      <label>Họ và tên</label>
                      <input
                        type="text"
                        required minLength={2} maxLength={100}
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
                        readOnly
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
                        maxLength={20}
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
                        maxLength={2000}
                        value={userInfo.address}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, address: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <button type="submit" className="profile-save-btn">
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  </fieldset>
                </form>
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
                          <img src={productImageUrl(p.primary_image)} alt={p.name} />
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
