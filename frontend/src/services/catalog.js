import { productImageUrl } from "./media";

// Chuẩn hóa một sản phẩm từ API (kèm danh sách ảnh) thành dạng giao diện dùng.
export function toCatalogProduct(product) {
  const images = product.images || [];
  const primary = images.find((image) => image.is_primary) || images[0];
  return {
    ...product,
    primary_image: productImageUrl(primary?.image_url),
    secondary_image: productImageUrl(images[1]?.image_url || primary?.image_url),
    gallery: images.map((image) => productImageUrl(image.image_url)),
    _source: "backend",
  };
}
