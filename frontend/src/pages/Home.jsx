import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../services/api";

import HeroSection from "../components/home/HeroSection";

import RoomCollectionsSection from "../components/home/RoomCollectionsSection";

import FeaturedProductsSection from "../components/home/FeaturedProductsSection";

import ConsultationSection from "../components/home/ConsultationSection";

import FloatingChat from "../components/home/FloatingChat";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productResponse = await api.get("/api/products");

        const productData = productResponse.data;

        /*
         * Lấy ảnh chính từng sản phẩm.
         *
         * Hiện API product chưa trả ảnh chính
         * nên FE gọi API images.
         *
         * Sau này mình sẽ tối ưu BE để
         * GET /products trả primary_image luôn.
         */

        const productsWithImages = await Promise.all(
          productData.slice(0, 12).map(async (product) => {
            try {
              const imageResponse = await api.get(
                `/api/products/${product.id}/images`,
              );

              const images = imageResponse.data;

              const primary =
                images.find((image) => image.is_primary) || images[0];

              return {
                ...product,

                primary_image: primary?.image_url || null,
              };
            } catch {
              return {
                ...product,
                primary_image: null,
              };
            }
          }),
        );

        setProducts(productsWithImages);
      } catch (error) {
        console.error("Không thể tải sản phẩm:", error);
      }
    };

    loadProducts();
  }, []);

  const handleAddToCart = (product) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login", {
        state: {
          from: location.pathname,
        },
      });

      return;
    }

    /*
     * Cart API chưa xây.
     * Bước sau sẽ thay bằng:
     *
     * POST /api/cart/items
     */

    console.log("Sản phẩm cần thêm giỏ:", product);

    navigate("/cart");
  };

  return (
    <>
      <HeroSection />

      <RoomCollectionsSection />

      <FeaturedProductsSection
        products={products}
        onAddToCart={handleAddToCart}
      />

      <ConsultationSection />

      <FloatingChat />
    </>
  );
}

export default Home;
