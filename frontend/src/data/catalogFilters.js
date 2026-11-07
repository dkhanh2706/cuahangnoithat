// Dữ liệu nội thất cao cấp đầy đủ cho bộ lọc và tìm kiếm

export const ROOM_BANNERS = {
  "phong-khach": {
    name: "Phòng khách",
    eyebrow: "KHÔNG GIAN TIẾP KHÁCH",
    title: "Nơi Khởi Đầu Mọi Cuộc Gặp Gỡ",
    description: "Bộ sưu tập sofa bọc vải linen, bàn trà đá cẩm thạch và ghế thư giãn cao cấp kiến tạo diện mạo sang trọng, ấm cúng cho phòng khách.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85",
  },
  "phong-ngu": {
    name: "Phòng ngủ",
    eyebrow: "KHOẢNG LẶNG BÌNH YÊN",
    title: "Chăm Sóc Giấc Ngủ Trọn Vẹn",
    description: "Giường ngủ gỗ tần bì phong cách Zen Nhật Bản, tủ đầu giường và bàn phấn tối giản mang lại cảm giác an yên tuyệt đối.",
    image: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1600&q=85",
  },
  "phong-an": {
    name: "Phòng ăn & Bếp",
    eyebrow: "ẤM ÁP TỪNG BỮA CƠM",
    title: "Sum Vầy Bên Bàn Ăn Gia Đình",
    description: "Bàn ăn thông minh mở rộng và ghế ăn Hans Wegner ôm trọn lưng, kết hợp cùng mặt bàn xử lý sáp thực vật kháng nước an toàn.",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1600&q=85",
  },
  "phong-lam-viec": {
    name: "Phòng làm việc",
    eyebrow: "KHƠI NGUỒN CẢM HỨNG",
    title: "Không Gian Tập Trung Sáng Tạo",
    description: "Bàn làm việc studio gỗ sồi, kệ sách âm tường và ghế công thái học bọc da hỗ trợ năng suất làm việc tối đa tại nhà.",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1600&q=85",
  },
  "bac-au": {
    name: "Phong cách Bắc Âu",
    eyebrow: "SCANDINAVIAN LIVING",
    title: "Tinh Khiết, Tối Giản & Tiện Nghi",
    description: "Sự kết hợp giữa chất liệu gỗ sồi sáng màu, sắc trắng kem và ánh sáng tự nhiên dịu nhẹ cho mọi không gian sống.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85",
  },
  "toi-gian": {
    name: "Phong cách Tối giản",
    eyebrow: "MINIMALIST STYLE",
    title: "Ít Hơn, Nhưng Tốt Hơn",
    description: "Đường nét gọn gàng, giảm thiểu chi tiết rườm rà, đặt công năng và độ bền vật liệu lên hàng đầu.",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85",
  },
};

export const FILTER_ROOMS = [
  { slug: "all", name: "Tất cả các phòng" },
  { slug: "phong-khach", name: "Phòng khách" },
  { slug: "phong-ngu", name: "Phòng ngủ" },
  { slug: "phong-an", name: "Phòng ăn & Bếp" },
  { slug: "phong-lam-viec", name: "Phòng làm việc" },
];

export const FILTER_CATEGORIES = [
  { slug: "all", name: "Tất cả danh mục" },
  { slug: "sofa", name: "Sofa" },
  { slug: "giuong", name: "Giường ngủ" },
  { slug: "ban", name: "Bàn trà & Bàn ăn" },
  { slug: "ghe", name: "Ghế & Ghế thư giãn" },
  { slug: "tu-ke", name: "Tủ & Kệ trang trí" },
  { slug: "den", name: "Đèn chiếu sáng" },
];

export const FILTER_MATERIALS = [
  "Tất cả",
  "Gỗ tự nhiên",
  "Da thật",
  "Vải linen",
  "Đá cẩm thạch",
  "Kim loại",
];

export const FILTER_COLORS = [
  { name: "Tất cả", hex: "transparent" },
  { name: "Nâu gỗ", hex: "#8b5a2b" },
  { name: "Trắng kem", hex: "#f5f5dc" },
  { name: "Xám tro", hex: "#757575" },
  { name: "Đen mun", hex: "#212121" },
  { name: "Xanh rêu", hex: "#2e4a3d" },
  { name: "Vàng cát", hex: "#d2b48c" },
];

export const FILTER_STYLES = [
  "Tất cả",
  "Bắc Âu",
  "Tối giản",
  "Hiện đại",
  "Japandi",
  "Cổ điển",
];
