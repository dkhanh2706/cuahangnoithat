import { useState } from "react";
import { productImageUrl } from "../services/media";

export default function UserAvatar({ user }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const url = user?.avatar_url;
  if (url && url !== failedUrl) {
    return <img src={productImageUrl(url)} alt={`Ảnh đại diện của ${user.full_name || "bạn"}`} onError={() => setFailedUrl(url)} />;
  }
  return user?.full_name?.charAt(0)?.toUpperCase() || "U";
}
