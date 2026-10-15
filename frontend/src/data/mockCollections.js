import { MOCK_PRODUCTS } from "./mockProducts";

export const COLLECTION_ROOMS = [
  { id: "all", name: "Tất cả", slug: "all" },
  { id: "phong-khach", name: "Phòng khách", slug: "phong-khach" },
  { id: "phong-ngu", name: "Phòng ngủ", slug: "phong-ngu" },
  { id: "phong-an", name: "Phòng ăn", slug: "phong-an" },
  { id: "phong-bep", name: "Phòng bếp", slug: "phong-bep" },
  { id: "phong-lam-viec", name: "Phòng làm việc", slug: "phong-lam-viec" },
  { id: "ngoai-troi", name: "Ngoài trời", slug: "ngoai-troi" },
];

export const COLLECTION_STYLES = [
  { id: "all", name: "Tất cả phong cách" },
  { id: "Bắc Âu", name: "Bắc Âu (Scandinavian)" },
  { id: "Tối giản", name: "Tối giản (Minimalism)" },
  { id: "Hiện đại", name: "Hiện đại (Modern Luxe)" },
  { id: "Japandi", name: "Japandi (Zen & Wabi-Sabi)" },
  { id: "Cổ điển", name: "Cổ điển (Classic Heritage)" },
];

export const MOCK_COLLECTIONS = [
  {
    id: 1,
    slug: "phong-khach-bac-au",
    title: "Phòng khách Bắc Âu Scandinavia Nord",
    room: "Phòng khách",
    room_slug: "phong-khach",
    style: "Bắc Âu",
    is_featured: true,
    badge: "BÁN CHẠY NHẤT 2026",
    offer_tag: "Ưu đãi Combo -15%",
    banner_image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=85",
    thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85",
    tagline: "Ánh sáng tự nhiên hòa cùng gỗ sồi ấm áp và vải linen tinh khiết",
    description: "Lấy cảm hứng từ triết lý Hygge của vùng Bắc Âu, bộ sưu tập mang lại sự bình yên, ấm cúng và tinh giản tối đa cho không gian sinh hoạt chung của cả gia đình.",
    design_story: "Không gian phòng khách Bắc Âu chú trọng tối đa việc đón nhận ánh sáng mặt trời qua khung cửa lớn. Đường nét mềm mại từ sofa góc kết hợp mặt bàn trà tròn đôi và đèn cây kim loại uốn cong tạo nên một tổng thể cân đối, thư thái và tiện nghi cho lối sống hiện đại.",
    color_palette: [
      { name: "Trắng Bắc Cực", hex: "#F8F9FA" },
      { name: "Be Vải Linen", hex: "#E8D8C8" },
      { name: "Gỗ Sồi Tự Nhiên", hex: "#C59B6C" },
      { name: "Xám Đá Sương Mù", hex: "#8E979E" },
      { name: "Xanh Xô Thơm", hex: "#9CAF88" },
    ],
    materials: ["Gỗ sồi Bắc Mỹ nhập khẩu", "Vải Linen sợi tự nhiên", "Mặt đá Slate chống xước", "Kim loại sơn tĩnh điện"],
    detail_images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1400&q=85",
    ],
    hotspots: [
      { id: "h1", x: 42, y: 70, product_id: 1, label: "Sofa Góc Scandinavia Nord" },
      { id: "h2", x: 64, y: 76, product_id: 2, label: "Bàn Trà Tròn Đôi Slate Marble" },
      { id: "h3", x: 22, y: 64, product_id: 3, label: "Ghế Lounge Chair Thư Giãn" },
      { id: "h4", x: 80, y: 46, product_id: 12, label: "Đèn Cây Đứng Nordic Arc" },
      { id: "h5", x: 90, y: 70, product_id: 7, label: "Kệ Tivi Walnut Floating" },
    ],
    product_ids: [1, 2, 3, 12, 7, 21],
    bundle_discount_percent: 15,
  },

  {
    id: 2,
    slug: "phong-ngu-japandi-zen",
    title: "Phòng ngủ Tối Giản Japandi Zen",
    room: "Phòng ngủ",
    room_slug: "phong-ngu",
    style: "Japandi",
    is_featured: false,
    badge: "XU HƯỚNG 2026",
    offer_tag: "Ưu đãi Combo -12%",
    banner_image: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1920&q=85",
    thumbnail: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1000&q=85",
    tagline: "Giao thoa thiền định Nhật Bản và công năng tối giản phương Bắc",
    description: "Bộ sưu tập mang đến cảm giác buông bỏ âu lo với giường thấp chạm đất, chất liệu gỗ tần bì sấy tự nhiên và đèn ngủ gốm nung thủ công.",
    design_story: "Japandi là sự dung hòa kỳ diệu giữa tinh thần Wabi-Sabi tôn vinh nét đẹp không hoàn hảo và sự chỉn chu công năng của Scandinavia. Mọi chi tiết dư thừa đều được lược bỏ, để lại khoảng thở thanh tịnh giúp bạn phục hồi năng lượng trọn vẹn mỗi đêm.",
    color_palette: [
      { name: "Trắng Gạo Mộc", hex: "#F3F1EC" },
      { name: "Gỗ Tần Bì Sáng", hex: "#D6BF9E" },
      { name: "Nâu Gốm Nung", hex: "#9E6B55" },
      { name: "Xám Tro Than", hex: "#4A4D52" },
    ],
    materials: ["Gỗ tần bì Ash chọn lọc", "Gốm nung Bát Tràng tráng men mờ", "Sợi bông hữu cơ Organic Cotton", "Mây mắt cáo tự nhiên"],
    detail_images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85",
    ],
    hotspots: [
      { id: "h1", x: 50, y: 68, product_id: 4, label: "Giường Ngủ Muji Zen Minimalist" },
      { id: "h2", x: 20, y: 65, product_id: 13, label: "Tủ Đầu Giường Gỗ Tần Bì" },
      { id: "h3", x: 22, y: 50, product_id: 24, label: "Đèn Ngủ Gốm Thủ Công Ceramic" },
      { id: "h4", x: 82, y: 60, product_id: 18, label: "Bàn Phấn Gỗ Sồi Gương LED" },
    ],
    product_ids: [4, 13, 24, 18, 26],
    bundle_discount_percent: 12,
  },

  {
    id: 3,
    slug: "phong-an-bac-au-nordic-dining",
    title: "Phòng ăn Bắc Âu Nordic Oak Dining",
    room: "Phòng ăn",
    room_slug: "phong-an",
    style: "Bắc Âu",
    is_featured: false,
    badge: "ẤM CÚNG GIA ĐÌNH",
    offer_tag: "Ưu đãi Combo -15%",
    banner_image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1920&q=85",
    thumbnail: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85",
    tagline: "Bàn ăn mở rộng thông minh cùng đèn thả nghệ thuật cho bữa cơm tròn vị",
    description: "Bộ bàn ăn gỗ sồi tự nhiên mở rộng linh hoạt cho 4 đến 8 người, đồng điệu cùng ghế tựa cong ôm sát lưng và ánh sáng vàng ấm lan tỏa.",
    design_story: "Bữa ăn là thời điểm gắn kết thiêng liêng nhất trong ngày. Chúng tôi thiết kế bàn ăn Bắc Âu với các cạnh vát cong an toàn cho trẻ nhỏ, kết hợp cùng lớp hoàn thiện sáp thực vật kháng nước và dầu mỡ tuyệt hảo.",
    color_palette: [
      { name: "Gỗ Sồi Vàng", hex: "#D4A373" },
      { name: "Trắng Ngà", hex: "#FAEDCD" },
      { name: "Đồng Xước Ánh Kim", hex: "#B8860B" },
      { name: "Xám Khói", hex: "#7D8597" },
    ],
    materials: ["Gỗ sồi Nga FAS cao cấp", "Đệm mút đúc bọc simili kháng khuẩn", "Đồng thau chải xước"],
    detail_images: [
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1400&q=85",
    ],
    hotspots: [
      { id: "h1", x: 48, y: 68, product_id: 5, label: "Bàn Ăn Mở Rộng OAK Nature" },
      { id: "h2", x: 30, y: 72, product_id: 6, label: "Bộ 4 Ghế Ăn Elbow Hans Wegner" },
      { id: "h3", x: 50, y: 32, product_id: 16, label: "Đèn Thả Bàn Ăn 3 Bóng Trio" },
      { id: "h4", x: 85, y: 60, product_id: 23, label: "Ghế Bar Chân Gỗ Cao" },
    ],
    product_ids: [5, 6, 16, 22, 23],
    bundle_discount_percent: 15,
  },

  {
    id: 4,
    slug: "phong-lam-viec-studio-creative",
    title: "Phòng làm việc Studio Khơi Nguồn Sáng Tạo",
    room: "Phòng làm việc",
    room_slug: "phong-lam-viec",
    style: "Hiện đại",
    is_featured: false,
    badge: "CÔNG THÁI HỌC",
    offer_tag: "Ưu đãi Combo -10%",
    banner_image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1920&q=85",
    thumbnail: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=85",
    tagline: "Bàn đứng nâng hạ thông minh, kệ sách module và ghế bọc da cao cấp",
    description: "Không gian làm việc tại nhà chuẩn mực giúp duy trì tư thế ngồi khỏe mạnh, nâng cao sự tập trung và khơi thông nguồn cảm hứng sáng tạo dồi dào.",
    design_story: "Sự kết hợp giữa công nghệ điều chỉnh chiều cao điện tử và vật liệu gỗ sồi tạo ra góc làm việc vừa đậm tính công nghệ vừa giữ trọn vẻ mộc mạc thư thái cho mắt.",
    color_palette: [
      { name: "Đen Nhám Carbon", hex: "#1E2022" },
      { name: "Nâu Da Bò Cognac", hex: "#9C5A3C" },
      { name: "Gỗ Sồi Trầm", hex: "#A67C52" },
      { name: "Bạc Kim Loại", hex: "#C0C0C0" },
    ],
    materials: ["Khung thép carbon sơn tĩnh điện", "Gỗ sồi nguyên tấm phủ laminate", "Da microfiber êm ái"],
    detail_images: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=1400&q=85",
    ],
    hotspots: [
      { id: "h1", x: 45, y: 64, product_id: 8, label: "Bàn Làm Việc Studio Gỗ Sồi" },
      { id: "h2", x: 55, y: 70, product_id: 14, label: "Ghế Làm Việc Herman Leather" },
      { id: "h3", x: 82, y: 45, product_id: 15, label: "Kệ Sách Cây Khung Thép 5 Tầng" },
      { id: "h4", x: 20, y: 40, product_id: 19, label: "Kệ Trang Trí Floating Wall Shelf" },
    ],
    product_ids: [8, 14, 15, 25, 19],
    bundle_discount_percent: 10,
  },

  {
    id: 5,
    slug: "phong-bep-nordic-island",
    title: "Phòng bếp & Quầy Bar Nordic Island",
    room: "Phòng bếp",
    room_slug: "phong-bep",
    style: "Hiện đại",
    is_featured: false,
    badge: "TIỆN NGHI HIỆN ĐẠI",
    offer_tag: "Ưu đãi Combo -12%",
    banner_image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1920&q=85",
    thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85",
    tagline: "Đảo bếp đá nhân tạo kết hợp hệ tủ lưu trữ module và ghế bar sang trọng",
    description: "Biến căn bếp thành trung tâm của những bữa tiệc trà, nấu nướng đầy ắp tiếng cười cùng các thiết kế thông minh, bề mặt dễ lau chùi.",
    design_story: "Không gian bếp mở là trái tim của ngôi nhà hiện đại. Bộ sưu tập Nordic Island cung cấp giải pháp lưu trữ khép kín thông minh, giấu đi sự bừa bộn và phô diễn nét thanh lịch của các đường cong gỗ và mặt đá trắng tinh khôi.",
    color_palette: [
      { name: "Trắng Sứ Vân Mây", hex: "#F5F5F5" },
      { name: "Xám Xanh Slate", hex: "#52616B" },
      { name: "Vàng Đồng Brass", hex: "#C59B6C" },
      { name: "Gỗ Óc Chó", hex: "#4A3525" },
    ],
    materials: ["Mặt đá thạch anh nhân tạo Vicostone", "Gỗ MDF lõi xanh chống ẩm", "Phụ kiện ray trượt Blum"],
    detail_images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=85",
    ],
    hotspots: [
      { id: "h1", x: 50, y: 62, product_id: 22, label: "Tủ Bếp Trên Dưới Module" },
      { id: "h2", x: 35, y: 75, product_id: 23, label: "Ghế Bar Cao Chân Gỗ Bọc Da" },
      { id: "h3", x: 50, y: 30, product_id: 16, label: "Đèn Thả Trần Hiện Đại" },
    ],
    product_ids: [22, 23, 16, 5],
    bundle_discount_percent: 12,
  },

  {
    id: 6,
    slug: "phong-khach-co-dien-heritage",
    title: "Phòng khách Tân Cổ Điển Heritage Luxe",
    room: "Phòng khách",
    room_slug: "phong-khach",
    style: "Cổ điển",
    is_featured: false,
    badge: "VƯƠNG GIẢ QUÝ PHÁI",
    offer_tag: "Ưu đãi Combo -18%",
    banner_image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
    tagline: "Vẻ đẹp hoàng gia với sofa bọc da Ý cao cấp và các điểm nhấn mạ vàng",
    description: "Mang hơi thở của những dinh thự quý tộc châu Âu, bộ sưu tập Heritage Luxe kết hợp kỹ thuật chần nút Chesterfield thủ công và sắc xanh nhung huyền bí.",
    design_story: "Dành riêng cho những gia chủ yêu thích chiều sâu văn hóa và sự sang trọng bền vững. Từng đường may trên da bò thuộc thảo mộc nước Ý đều được người nghệ nhân kỳ công chăm chút.",
    color_palette: [
      { name: "Xanh Rêu Hoàng Gia", hex: "#2C402E" },
      { name: "Vàng Đồng Cổ", hex: "#B38B4D" },
      { name: "Nâu Da Bò Milano", hex: "#633A18" },
      { name: "Trắng Kem Cẩm Thạch", hex: "#EAE6DF" },
    ],
    materials: ["Da bò thuộc Full Grain nhập khẩu Ý", "Khung gỗ gõ đỏ tự nhiên", "Chân kim loại mạ PVD vàng 18K"],
    detail_images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
    ],
    hotspots: [
      { id: "h1", x: 45, y: 68, product_id: 20, label: "Sofa 3 Chỗ Bọc Da Ý Milano" },
      { id: "h2", x: 68, y: 74, product_id: 21, label: "Bàn Cà Phê Gỗ Tái Chế Mạ Vàng" },
      { id: "h3", x: 20, y: 65, product_id: 9, label: "Sofa Văng Đôi Cozy Velvet Green" },
      { id: "h4", x: 80, y: 62, product_id: 17, label: "Sofa Đơn Accent Chair Blush Pink" },
    ],
    product_ids: [20, 21, 9, 17, 27],
    bundle_discount_percent: 18,
  },

  {
    id: 7,
    slug: "phong-ngu-master-modern-haven",
    title: "Phòng ngủ Master Modern Haven",
    room: "Phòng ngủ",
    room_slug: "phong-ngu",
    style: "Hiện đại",
    is_featured: false,
    badge: "TRẢI NGHIỆM 5 SAO",
    offer_tag: "Ưu đãi Combo -15%",
    banner_image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1920&q=85",
    thumbnail: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85",
    tagline: "Giường ngủ bọc đệm êm ái như đám mây và tủ áo cánh kính thời thượng",
    description: "Bộ phòng ngủ Master mang đẳng cấp resort 5 sao vào chính ngôi nhà bạn với hệ tủ cánh kính sang trọng và ánh sáng gián tiếp nhẹ dịu.",
    design_story: "Lối thiết kế đương đại đề cao sự thanh thoát với các mảng gương led khổ lớn và đầu giường bọc nỉ gợn sóng, mang lại cảm giác vỗ về giấc ngủ sâu êm đềm.",
    color_palette: [
      { name: "Xám Bạc Hiện Đại", hex: "#D8DCDE" },
      { name: "Gỗ Óc Chó Walnut", hex: "#5C4033" },
      { name: "Đen Khung Nhôm", hex: "#1C1C1E" },
      { name: "Vàng Hắt LED 3000K", hex: "#F3C68F" },
    ],
    materials: ["Vải nỉ nhung kháng bám bụi", "Kính cường lực màu trà", "Gỗ công nghiệp An Cường"],
    detail_images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85",
    ],
    hotspots: [
      { id: "h1", x: 48, y: 68, product_id: 10, label: "Giường Ngủ Cloud King Size" },
      { id: "h2", x: 82, y: 55, product_id: 11, label: "Tủ Quần Áo Cánh Kính Minimalist" },
      { id: "h3", x: 18, y: 62, product_id: 18, label: "Bàn Trang Điểm Gương LED" },
    ],
    product_ids: [10, 11, 18, 12, 13],
    bundle_discount_percent: 15,
  },

  {
    id: 8,
    slug: "san-vuon-outdoor-oasis",
    title: "Sân vườn & Ban công Outdoor Oasis",
    room: "Ngoài trời",
    room_slug: "ngoai-troi",
    style: "Tối giản",
    is_featured: false,
    badge: "HÒA CÙNG THIÊN NHIÊN",
    offer_tag: "Ưu đãi Combo -10%",
    banner_image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1920&q=85",
    thumbnail: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1000&q=85",
    tagline: "Bộ ghế mây đan thư giãn, xích đu và bàn trà chống chịu mọi điều kiện thời tiết",
    description: "Kiến tạo góc chill đón gió trời và nắng sớm bên hiên nhà hay sân thượng với vật liệu mây nhựa kháng tia UV và đệm trượt nước bền bỉ.",
    design_story: "Không gian ngoài trời là cầu nối giữa con người và thiên nhiên. Chúng tôi sử dụng khung nhôm nhẹ chống rỉ sét cùng đan lát thủ công tinh tế để mỗi sớm mai ngồi thưởng thức tách cà phê đều là một trải nghiệm trọn vẹn.",
    color_palette: [
      { name: "Nâu Mây Tự Nhiên", hex: "#B88958" },
      { name: "Xanh Cây Lá", hex: "#4A6B56" },
      { name: "Trắng Sỏi Biển", hex: "#EBEAE6" },
      { name: "Đen Nhôm Kháng Gỉ", hex: "#2B2D2F" },
    ],
    materials: ["Mây nhựa PE kháng tia cực tím", "Khung nhôm sơn tĩnh điện ngoài trời", "Vải đệm Sunbrella chống thấm nước"],
    detail_images: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    ],
    hotspots: [
      { id: "h1", x: 45, y: 68, product_id: 27, label: "Ghế Xích Đu Rattan Swing Boho" },
      { id: "h2", x: 70, y: 72, product_id: 3, label: "Ghế Thư Giãn Lounge Chair" },
      { id: "h3", x: 30, y: 75, product_id: 21, label: "Bàn Trà Gỗ Tái Chế Outdoor" },
    ],
    product_ids: [27, 3, 21, 17],
    bundle_discount_percent: 10,
  },
];

// Helper: lấy thông tin sản phẩm đầy đủ từ MOCK_PRODUCTS cho 1 bộ sưu tập
export const getCollectionProducts = (collection) => {
  if (!collection || !collection.product_ids) return [];
  return collection.product_ids
    .map((id) => MOCK_PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);
};

// Helper: tính tổng tiền gốc và tổng tiền ưu đãi mua trọn bộ
export const calculateCollectionBundlePricing = (collection) => {
  const products = getCollectionProducts(collection);
  const totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const discountPercent = collection?.bundle_discount_percent || 10;
  const bundlePrice = Math.round(totalPrice * (1 - discountPercent / 100));
  const savings = totalPrice - bundlePrice;

  return {
    productsCount: products.length,
    totalPrice,
    bundlePrice,
    savings,
    discountPercent,
  };
};

export const getFeaturedCollection = () => {
  return MOCK_COLLECTIONS.find((c) => c.is_featured) || MOCK_COLLECTIONS[0];
};

export const getCollectionBySlug = (slug) => {
  return MOCK_COLLECTIONS.find((c) => c.slug === slug);
};

export const getRelatedCollections = (currentSlug, limit = 3) => {
  return MOCK_COLLECTIONS.filter((c) => c.slug !== currentSlug).slice(0, limit);
};
