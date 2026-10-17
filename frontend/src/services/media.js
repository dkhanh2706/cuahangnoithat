import api from "./api";

export function productImageUrl(url) {
  return url ? new URL(url, api.defaults.baseURL).href : null;
}
