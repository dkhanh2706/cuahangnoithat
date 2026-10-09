import { Link } from "react-router-dom";

import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div>F</div>

            <span>FurniHome</span>
          </Link>

          <p>
            Mang những thiết kế nội thất hiện đại, tinh tế và tiện nghi đến từng
            không gian sống.
          </p>
        </div>

        <div className="footer-column">
          <h4>Khám phá</h4>

          <Link to="/">Trang chủ</Link>

          <Link to="/products">Sản phẩm</Link>

          <a href="/#rooms">Theo phòng</a>

          <a href="/#featured-collections">Bộ sưu tập</a>
        </div>

        <div className="footer-column">
          <h4>Hỗ trợ</h4>

          <Link to="/cart">Giỏ hàng</Link>

          <Link to="/orders">Đơn hàng</Link>

          <span>Chính sách mua hàng</span>
        </div>

        <div className="footer-column">
          <h4>Liên hệ</h4>

          <p>support@furnihome.vn</p>

          <p>0900 000 000</p>

          <p>TP. Hồ Chí Minh</p>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          <p>© 2026 FurniHome. All rights reserved.</p>

          <p>HTTT05 - Hệ thống quản lý cửa hàng nội thất</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
