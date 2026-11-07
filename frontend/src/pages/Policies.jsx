import { Link, useParams } from "react-router-dom";
import "../styles/Policies.css";

const policies = {
  warranty: { title: "Chính sách bảo hành", intro: "An tâm sử dụng, đồng hành cùng không gian sống của bạn.", sections: [
    ["Phạm vi bảo hành", "CHNT tiếp nhận bảo hành lỗi kết cấu và lỗi sản xuất trong tối đa 5 năm. Thời hạn cụ thể của từng sản phẩm được nhân viên xác nhận khi xác nhận đơn hàng; không mặc định mọi vật liệu và phụ kiện đều được bảo hành 5 năm."],
    ["Điều kiện tiếp nhận", "Cung cấp mã đơn hàng, ảnh hoặc video mô tả lỗi. Sản phẩm cần được sử dụng đúng công năng, đúng hướng dẫn và không tự ý thay đổi kết cấu."],
    ["Các trường hợp không áp dụng", "Hao mòn tự nhiên, trầy xước do sử dụng, ngấm nước, mối mọt do bảo quản, hư hại do va đập hoặc tự sửa chữa. Nhân viên sẽ trao đổi phương án và chi phí trước khi thực hiện."],
    ["Yêu cầu hỗ trợ", "Mở Tư vấn nội thất ở góc màn hình, gửi mã đơn và mô tả vấn đề. Khi nhân viên đang online, yêu cầu được tiếp nhận trực tiếp; khi offline, vui lòng quay lại trong giờ hỗ trợ. Chat không lưu lịch sử sau khi tải lại hoặc đóng trang."],
  ] },
  returns: { title: "Chính sách đổi trả", intro: "Thông tin rõ ràng để bạn lựa chọn nội thất phù hợp.", sections: [
    ["Thời hạn và điều kiện", "Đề nghị đổi trả trong vòng 30 ngày từ khi nhận hàng. Sản phẩm cần còn nguyên trạng, đủ phụ kiện và có mã đơn hàng. Sản phẩm đặt riêng theo kích thước hoặc đã thay đổi kết cấu cần được xem xét riêng."],
    ["Lỗi từ cửa hàng", "Nếu giao sai sản phẩm hoặc có lỗi sản xuất được xác nhận, CHNT trao đổi phương án đổi, sửa hoặc nhận trả; chi phí vận chuyển do cửa hàng chịu."],
    ["Đổi do nhu cầu cá nhân", "Nhân viên kiểm tra tình trạng sản phẩm và thông báo chi phí vận chuyển, tháo lắp nếu có trước khi bạn đồng ý. Đổi trả không áp dụng vô điều kiện."],
    ["Thanh toán và hoàn tiền", "Website hiện hỗ trợ đặt hàng COD, thanh toán khi nhận hàng. Yêu cầu đổi trả sau giao hàng được nhân viên xử lý riêng; website chưa tự động chuyển tiền hoặc thực hiện giao dịch hoàn tiền."],
  ] },
  shipping: { title: "Vận chuyển & thanh toán", intro: "Theo dõi từng bước từ khi chọn sản phẩm đến lúc nhận hàng.", sections: [
    ["Phí vận chuyển", "Miễn phí vận chuyển cho đơn có tổng giá sản phẩm trước giảm giá từ 2.000.000₫. Đơn dưới mức này áp dụng phí 150.000₫. Tổng sau mã ưu đãi và phí vận chuyển hiển thị tại giỏ hàng."],
    ["Đặt hàng và tồn kho", "Cần đăng nhập tài khoản khách hàng để đặt hàng. Giá và tồn kho được kiểm tra tại máy chủ; tồn kho giảm khi tạo đơn thành công. Nếu đơn bị hủy trước khi giao, số lượng được hoàn kho."],
    ["Xác nhận và giao hàng", "Đơn đi qua các bước Chờ xác nhận → Đã xác nhận → Đang giao → Hoàn tất. Nhân viên liên hệ theo số điện thoại và địa chỉ đã nhập để thống nhất lịch giao, điều kiện tiếp cận và lắp đặt. Không cam kết thời gian giao cố định trước khi xác nhận."],
    ["Thanh toán khi nhận hàng (COD)", "Không nhập thẻ và không chuyển tiền trên website. Admin chỉ đánh dấu hoàn tất sau khi xác nhận đã giao và thu đủ tiền. Bạn xem tiến độ tại Lịch sử đơn hàng và có thể đánh giá sau khi đơn hoàn tất."],
    ["Hủy đơn", "Liên hệ nhân viên qua mục Tư vấn nội thất và cung cấp mã đơn. Admin có thể hủy đơn đang chờ hoặc đã xác nhận; đơn đã chuyển giao hàng không thể hủy trực tiếp trên hệ thống."],
  ] },
  privacy: { title: "Thông tin & đăng ký nhận tin", intro: "Bạn chủ động quyết định thông tin liên hệ được lưu tại CHNT.", sections: [
    ["Email nhận tin", "Khi chọn đồng ý và gửi biểu mẫu, email được lưu vào database để nhân viên CHNT quản lý thông tin liên hệ và ưu đãi. Đăng ký không tự động gửi email; hiện website chưa kết nối dịch vụ gửi thư."],
    ["Thông tin đặt hàng", "Tên, số điện thoại, địa chỉ và chi tiết đơn được dùng để xử lý đơn, giao hàng và hiển thị lịch sử cho chính tài khoản đặt hàng. Chỉ quản trị viên được phép truy cập màn hình quản lý đơn và danh sách email."],
    ["Ngừng nhận tin", "Liên hệ nhân viên qua khung tư vấn, cung cấp email đăng ký và yêu cầu xóa. Nhân viên tiếp nhận, xác minh yêu cầu rồi xóa email khỏi danh sách quản trị."],
    ["Phiên tư vấn", "Nội dung chat chỉ được giữ trong RAM trong thời gian sử dụng; tải lại, đăng xuất hoặc kết thúc phiên sẽ xóa nội dung. Đơn hàng và email đăng ký được lưu riêng trong database."],
  ] },
};

export default function Policies() {
  const { type } = useParams();
  const policy = policies[type];
  return <main className="policy-page"><nav aria-label="Chính sách"><Link to="/">Trang chủ</Link><span>/</span><span>Hỗ trợ khách hàng</span></nav>
    <header><span className="policy-eyebrow">CHNT · CHĂM SÓC KHÁCH HÀNG</span><h1>{policy?.title || "Không tìm thấy chính sách"}</h1><p>{policy?.intro || "Vui lòng chọn nội dung hỗ trợ bên dưới."}</p></header>
    <div className="policy-layout"><aside>{Object.entries(policies).map(([key, value]) => <Link key={key} to={`/policies/${key}`} aria-current={type === key ? "page" : undefined}>{value.title}</Link>)}</aside><article>{policy?.sections.map(([title, content]) => <section key={title}><h2>{title}</h2><p>{content}</p></section>)}<Link className="policy-order-link" to="/orders">Xem lịch sử đơn hàng →</Link></article></div>
  </main>;
}
