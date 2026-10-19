"""Vietnamese, catalog-based consultant. Pure selection logic; never writes data."""
import re
import unicodedata
from decimal import Decimal


def normalize(value):
    value = unicodedata.normalize("NFD", value.lower().replace("đ", "d"))
    return " ".join("".join(c for c in value if unicodedata.category(c) != "Mn").split())


def contains(text, phrase):
    return re.search(r"(?<!\w)" + re.escape(phrase) + r"(?!\w)", text) is not None


# Each role uses the live product name rather than demo product IDs.
KINDS = {
    "bed": ("giuong", "bed"),
    "wardrobe": ("tu quan ao", "wardrobe"),
    "nightstand": ("tu dau giuong", "tab dau giuong", "nightstand"),
    "vanity": ("ban trang diem", "ban phan"),
    "bedlight": ("den ngu", "den ban", "ceramic"),
    "sofa": ("sofa", "ghe sofa"),
    "coffee": ("ban tra", "ban cafe"),
    "tv": ("ke tivi", "tu tivi", "tu ke tivi"),
    "floorlight": ("den cay", "den dung"),
    "dining": ("ban an",),
    "diningchair": ("ghe an",),
    "pendant": ("den tha",),
    "desk": ("ban lam viec", "ban hoc", "studio desk"),
    "officechair": ("ghe lam viec", "ghe van phong", "ghe cong thai hoc"),
    "shelf": ("ke sach", "tu sach"),
    "outdoorchair": ("xich du", "ghe may", "ghe ngoai troi"),
}
ROOMS = {
    "bedroom": {
        "aliases": ("phong ngu",), "name": "phòng ngủ",
        "roles": ("bed", "wardrobe", "nightstand", "bedlight", "vanity"),
        "advice": "Phòng ngủ nên ưu tiên giường và tủ quần áo, sau đó bổ sung tủ đầu giường, đèn ngủ và bàn trang điểm nếu còn diện tích. Chọn màu dịu, ánh sáng ấm và đo khoảng trống mở cửa tủ trước khi mua.",
    },
    "living": {
        "aliases": ("phong khach",), "name": "phòng khách",
        "roles": ("sofa", "coffee", "tv", "floorlight"),
        "advice": "Phòng khách nên có sofa, bàn trà và kệ tivi; đèn cây tạo điểm nhấn cho góc đọc sách. Phòng nhỏ nên chọn sofa văng và bàn gọn, giữ lối đi thông thoáng.",
    },
    "dining": {
        "aliases": ("phong an", "phong bep", "nha bep"), "name": "phòng ăn",
        "roles": ("dining", "diningchair", "pendant"),
        "advice": "Phòng ăn nên có bàn ăn, ghế và đèn thả. Bạn nên chọn số chỗ theo số thành viên, kiểm tra số ghế đã gồm trong từng sản phẩm và chừa không gian kéo ghế.",
    },
    "office": {
        "aliases": ("phong lam viec", "goc lam viec", "phong hoc"), "name": "góc làm việc",
        "roles": ("desk", "officechair", "shelf", "bedlight"),
        "advice": "Góc làm việc nên có bàn phù hợp diện tích, ghế hỗ trợ tư thế ngồi, kệ sách và đèn bàn. Đặt màn hình ngang tầm mắt và tránh ánh sáng chiếu trực tiếp vào màn hình.",
    },
    "outdoor": {
        "aliases": ("ban cong", "san vuon", "ngoai troi"), "name": "ban công / sân vườn",
        "roles": ("outdoorchair", "coffee"),
        "advice": "Ban công nên ưu tiên ghế thư giãn và bàn nhỏ. Chỉ đặt ở nơi mưa nắng khi thông số sản phẩm xác nhận phù hợp ngoài trời; đo lối đi và kiểm tra khả năng thoát nước trước khi bố trí.",
    },
}


def product_kind(product):
    name = normalize(product.name)
    # Match the most specific phrase first (e.g. tủ đầu giường before giường).
    matches = [(len(alias), kind) for kind, aliases in KINDS.items() for alias in aliases if contains(name, alias)]
    return max(matches)[1] if matches else None


def requested_kind(text):
    matches = [(len(alias), kind) for kind, aliases in KINDS.items() for alias in aliases if contains(text, alias)]
    return max(matches)[1] if matches else None


def requested_generic(message):
    # Distinguish furniture nouns from "bạn", "tư vấn", "từ ... đến ..."
    # before removing Vietnamese accents.
    text = normalize(message.lower().replace("bạn", ""))
    text = re.sub(r"\btu van\b|\btu(?=\s+\d)|\bden(?=\s+\d)|\bmau den\b|\bgo tu nhien\b", " ", text).strip()
    for term in ("ghe", "ban", "tu", "den"):
        if text == term or re.search(r"\b(tim|mua|can|chon|xem|chiec|cai)\s+(mot\s+)?" + term + r"\b", text):
            return "generic:" + term
    return None


def wants_bundle(text):
    return any(contains(text, term) for term in ("ca bo", "tron bo", "combo", "ghep bo", "bo noi that"))


def parse_budget(text):
    # Require a money unit so room size, bed dimensions and quantities are not prices.
    matches = list(re.finditer(r"(\d[\d.,]*)\s*(trieu|tr|cu|nghin|ngan|k|vnd|dong|d)(?!\w)", text))
    if not matches:
        return None
    amounts = []
    for match in matches:
        number, unit = match.groups()
        if unit in ("trieu", "tr", "cu", "nghin", "ngan", "k"):
            amount = Decimal(number.replace(",", ".")) if number.count(".") + number.count(",") <= 1 else Decimal(number.replace(".", "").replace(",", ""))
            amount *= 1_000_000 if unit in ("trieu", "tr", "cu") else 1000
        else:
            amount = Decimal(number.replace(".", "").replace(",", ""))
        amounts.append(amount)
    return max(amounts)


def money(value):
    return f"{value:,.0f}".replace(",", ".") + " ₫"


def serialize_product(product):
    images = sorted(product.images, key=lambda image: (not image.is_primary, image.sort_order or 0, image.id))
    return {"id": product.id, "name": product.name, "price": float(product.price),
            "stock_quantity": product.stock_quantity, "primary_image": images[0].image_url if images else None,
            "material": product.material, "color": product.color, "dimensions": product.dimensions}


def make_offer(products, title=None):
    return {"id": "-".join(str(p.id) for p in products), "kind": "bundle" if len(products) > 1 else "product",
            "title": title or products[0].name,
            "items": [{"product": serialize_product(p), "quantity": 1} for p in products],
            "total_price": float(sum((p.price for p in products), Decimal(0)))}


def advise(request, products):
    text = normalize(request.message)
    room = kind = budget = material = color = None
    for message in [*request.history, request.message]:
        previous = normalize(message)
        found_room = next((key for key, data in ROOMS.items() if any(contains(previous, alias) for alias in data["aliases"])), None)
        if found_room:
            if room != found_room:
                kind = budget = material = color = None
            room = found_room
            kind = None
        found_kind = requested_kind(previous)
        if found_kind:
            kind = found_kind
            if not room:
                room = next((key for key, data in ROOMS.items() if kind in data["roles"]), None)
        elif (generic := requested_generic(message)):
            kind = generic
        if wants_bundle(previous):
            kind = None
        if contains(previous, "bo ngan sach") or contains(previous, "khong gioi han"):
            budget = None
        elif (amount := parse_budget(previous)) is not None:
            budget = amount
        if contains(previous, "mau bat ky"):
            color = None
        else:
            color = next((value for value in ("trang", "den", "xam", "nau", "xanh", "hong", "vang", "kem") if contains(previous, "mau " + value)), color)
        if contains(previous, "chat lieu bat ky"):
            material = None
        else:
            material = next((value for value in ("go soi", "go oc cho", "go tu nhien", "go cong nghiep", "vai", "da", "may", "kim loai") if contains(previous, value)), material)

    result = {"reply": "", "offers": [], "suggestions": []}
    def reply(message, suggestions=None):
        result["reply"] = message
        result["suggestions"] = suggestions or ["Tư vấn phòng ngủ", "Tư vấn phòng khách", "Tôi muốn mua món lẻ"]
        return result

    if any(contains(text, term) for term in ("giao hang", "van chuyen", "bao hanh", "doi tra", "lien he", "hotline")):
        return reply("Bạn có thể xem thông tin hỗ trợ ở chân trang hoặc liên hệ hotline được niêm yết: 1900 6868 (8:00–21:00), email support@furnihome.vn. Phí giao hàng, điều kiện bảo hành và đổi trả cụ thể cần được cửa hàng xác nhận theo sản phẩm và địa chỉ nhận hàng.")
    if any(contains(text, term) for term in ("thanh toan", "don hang", "dat hang", "lich su", "gio hang")) and not requested_kind(text):
        return reply("Bạn mở Giỏ hàng để kiểm tra các món và số lượng. Thanh toán hiện là giả lập DEMO, không thu tiền và không trừ tồn kho; đăng nhập để đặt đơn và xem ở Lịch sử đơn hàng. Khi tôi gợi ý món lẻ hoặc cả bộ, bạn có thể bấm Có để thêm vào giỏ, hoặc Không để bỏ qua.")
    if text in ("xin chao", "chao", "hi", "hello", "alo"):
        return reply("Chào bạn, tôi là trợ lý tư vấn tự động của FurniHome. Bạn đang muốn bố trí phòng nào, diện tích khoảng bao nhiêu và dự kiến ngân sách thế nào? Tôi có thể gợi ý món lẻ hoặc ghép một bộ phù hợp từ sản phẩm đang có.")
    if any(contains(text, term) for term in ("cam on", "thank")):
        return reply("Rất vui được hỗ trợ bạn! Bạn cần tôi điều chỉnh bộ nội thất hay tìm thêm món nào không?")
    if text in ("co", "dong y", "ok", "khong", "khong them"):
        return reply("Bạn hãy bấm Có hoặc Không ngay bên dưới món hay bộ muốn chọn để tôi xác định đúng lựa chọn. Tôi chưa thêm gì từ câu trả lời này nhé.")
    if any(contains(text, term) for term in ("mon le", "mua le")) and not requested_kind(text):
        return reply("Được nhé, bạn muốn mua riêng món nào? Tôi sẽ chọn những món còn hàng và hỏi bạn trước khi thêm vào giỏ.",
                     ["Tìm giường ngủ", "Tìm sofa", "Tìm bàn làm việc", "Tìm đèn ngủ"])

    available = [p for p in products if p.status and p.stock_quantity > 0]
    detail_terms = ("san pham nay", "mon nay", "cai nay", "kich thuoc", "chat lieu", "con hang", "bao nhieu", "cai dau", "mon dau")
    details = any(contains(text, term) for term in detail_terms)
    first_suggestion = request.suggested_ids[0] if request.suggested_ids else None
    focus_id = (first_suggestion if any(contains(text, term) for term in ("cai dau", "mon dau", "dau tien")) else request.product_id) or first_suggestion
    focus = next((p for p in products if p.id == focus_id and p.status), None)
    if details and focus and (not requested_kind(text) or product_kind(focus) == requested_kind(text)):
        info = f"{focus.name}: giá {money(focus.price)}. Chất liệu: {focus.material or 'chưa cập nhật'}; màu: {focus.color or 'chưa cập nhật'}; kích thước: {focus.dimensions or 'chưa cập nhật'}. "
        if focus.stock_quantity > 0:
            result["offers"] = [make_offer([focus])]
            return reply(info + f"Hiện còn {focus.stock_quantity} sản phẩm. Bạn có muốn tôi thêm món này vào giỏ hàng luôn không?")
        return reply(info + "Sản phẩm đang hết hàng, tôi chưa thể thêm vào giỏ. Bạn muốn tìm món tương tự không?")

    bundle_requested = wants_bundle(text)
    if bundle_requested:
        kind = None
    if not room and not kind:
        return reply("Tôi có thể tư vấn cách bố trí phòng, chất liệu, màu sắc, tìm món lẻ và ghép bộ nội thất theo ngân sách. Bạn muốn sắm cho phòng ngủ, phòng khách, phòng ăn, góc làm việc hay ban công? Cho tôi biết thêm diện tích và ngân sách để chọn sát nhu cầu nhé.")

    candidates = available
    if material:
        candidates = [p for p in candidates if contains(normalize((p.material or "") + " " + (p.description or "")), material)]
    if color:
        candidates = [p for p in candidates if contains(normalize(p.color or ""), color)]
    if budget is not None:
        candidates = [p for p in candidates if p.price <= budget]
    candidates = sorted(candidates, key=lambda p: (p.price, p.id))
    if contains(text, "re hon") or contains(text, "tiet kiem hon"):
        previous_prices = [p.price for p in available if p.id in request.suggested_ids]
        if previous_prices and kind:
            candidates = [p for p in candidates if p.price < min(previous_prices)]
    if kind:
        if kind.startswith("generic:"):
            term = kind.split(":")[1]
            selected = [p for p in candidates if contains(normalize(p.name), term) or contains(normalize(p.category.name if p.category else ""), term)]
        else:
            selected = [p for p in candidates if product_kind(p) == kind]
        result["offers"] = [make_offer([p]) for p in selected[:3]]
        if not selected:
            return reply("Hiện tôi chưa tìm thấy món còn hàng đúng các tiêu chí này. Bạn có thể tăng ngân sách, đổi màu/chất liệu hoặc cho tôi biết loại sản phẩm khác; tôi sẽ không tự chọn món vượt ngân sách.", ["Bỏ ngân sách", "Màu bất kỳ", "Chất liệu bất kỳ"])
        note = " Với phòng nhỏ, bạn nên đối chiếu kích thước thực tế và khoảng trống sử dụng trước khi chọn." if contains(text, "nho") else ""
        return reply("Tôi chọn các món dưới đây từ sản phẩm đang còn hàng" + (f", trong ngân sách {money(budget)}" if budget is not None else "") + "." + note + " Bạn có muốn tôi thêm món nào vào giỏ hàng luôn không? Chọn Có hoặc Không ở từng gợi ý nhé.", ["Ghép bộ cho phòng này", "Có món rẻ hơn không?", "Chất liệu món đầu tiên là gì?"])

    data = ROOMS[room]
    selected = []
    total = Decimal(0)
    for role in data["roles"]:
        choices = [p for p in candidates if product_kind(p) == role and (budget is None or total + p.price <= budget)]
        if choices:
            selected.append(choices[0])
            total += choices[0].price
    if not selected:
        return reply(data["advice"] + "\nHiện chưa có món còn hàng phù hợp các tiêu chí của bạn. Bạn muốn điều chỉnh ngân sách, màu hay chất liệu không?", ["Bỏ ngân sách", "Màu bất kỳ", "Chất liệu bất kỳ"])
    if len(selected) == 1:
        result["offers"] = [make_offer(selected)]
        return reply(data["advice"] + "\nHiện chỉ có một món phù hợp trong phạm vi này nên tôi gợi ý mua lẻ, chưa gọi là trọn bộ. Bạn có muốn tôi thêm món này vào giỏ hàng luôn không?")
    result["offers"] = [make_offer(selected, "Bộ " + data["name"] + " gợi ý")]
    missing = len(selected) < len(data["roles"])
    extra = " Bộ này gồm những món phù hợp hiện có, chưa đủ tất cả hạng mục phía trên." if missing else ""
    small = " Phòng nhỏ nên ưu tiên món thiết yếu, tận dụng lưu trữ đứng và tránh kê kín lối đi." if contains(text, "nho") or re.search(r"\b(8|9|10|11|12)\s*m", text) else ""
    style = " Nếu thích tối giản / Bắc Âu, hãy phối ít màu, gỗ sáng và đường nét gọn; cần kiểm tra ảnh thực tế để chọn đồng bộ." if any(contains(text, term) for term in ("toi gian", "bac au", "muji", "japandi")) else ""
    return reply(data["advice"] + small + style + "\nTôi ghép bộ dưới đây từ hàng đang có" + (f", tổng không vượt {money(budget)}" if budget is not None else "") + "." + extra + " Giá bộ bằng tổng giá từng món, chưa gồm phí giao hàng; không tự áp dụng giảm giá. Bạn có muốn tôi thêm cả bộ vào giỏ hàng luôn không? Bạn cũng có thể chọn thêm riêng từng món.", ["Tôi chỉ cần giường ngủ" if room == "bedroom" else "Tôi muốn mua món lẻ", "Ngân sách 20 triệu", "Phòng nhỏ nên bố trí thế nào?"])
