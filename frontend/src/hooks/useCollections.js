import { useEffect, useState } from "react";
import api from "../services/api";
import { productImageUrl } from "../services/media";
import { COLLECTIONS } from "../data/collections";

export default function useCollections() {
  const [state, setState] = useState({ collections: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    api.get("/api/collections/products").then(({ data }) => {
      if (!active) return;
      setState({ loading: false, error: "", collections: COLLECTIONS.map(collection => ({
        ...collection, offer_tag: "Giá sản phẩm cập nhật", bundle_discount_percent: 0,
        products: (data[collection.slug]?.products || []).map(product => ({ ...product,
          primary_image: productImageUrl(product.primary_image), images: product.images.map(productImageUrl) })),
        product_ids: (data[collection.slug]?.products || []).map(product => product.id),
        hotspots: data[collection.slug]?.hotspots || [],
      })) });
    }).catch(() => { if (active) setState({ collections: [], loading: false, error: "Không tải được bộ sưu tập. Vui lòng thử lại." }); });
    return () => { active = false; };
  }, [revision]);
  return { ...state, reload: () => setRevision(value => value + 1) };
}
