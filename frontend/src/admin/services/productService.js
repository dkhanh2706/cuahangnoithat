import api from "../../services/api";

const productService = {
  list: async () => (await api.get("/api/products/admin/all")).data,
  categories: async () => (await api.get("/api/categories")).data,
  create: async (data) => (await api.post("/api/products", data)).data,
  update: async (id, data) => (await api.put(`/api/products/${id}`, data)).data,
  remove: async (id) => api.delete(`/api/products/${id}`),
  upload: async (id, file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("is_primary", "true");
    return api.post(`/api/products/${id}/images`, data, { headers: { "Content-Type": "multipart/form-data" } });
  },
};

export const productImageUrl = (url) => url?.startsWith("/") ? `${api.defaults.baseURL}${url}` : url;
export const productError = (error) => {
  const detail = error.response?.data?.detail;
  return typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((item) => item.msg).join("; ") : "Không thể kết nối máy chủ. Vui lòng thử lại.";
};
export default productService;
