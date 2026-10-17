import { productImageUrl } from "../services/media";

export default function ReviewCard({ review }) {
  return (
    <article className="review-panel customer-review">
      <div className="review-author"><span className="review-avatar">{review.full_name?.charAt(0)}</span><div><strong>{review.full_name}</strong><small>Đã mua sản phẩm</small></div></div>
      <p className="review-stars" aria-label={`${review.rating} trên 5 sao`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
      <p className="review-content">{review.content}</p>
      <div className="review-product">
        {review.image_url && <img src={productImageUrl(review.image_url)} alt={review.product_name} loading="lazy" />}
        <span>{review.product_name}</span>
      </div>
      <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString("vi-VN")}</time>
    </article>
  );
}
