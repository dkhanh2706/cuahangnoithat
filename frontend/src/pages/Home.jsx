import { useEffect, useState } from "react";

import api from "../services/api";

import HeroSlider from "../components/home/HeroSlider";
import ShopByRoom from "../components/home/ShopByRoom";
import FeaturedCollections from "../components/home/FeaturedCollections";
import ProductShowcase from "../components/home/ProductShowcase";
import Testimonials from "../components/home/Testimonials";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await api.get("/api/products");

        const productData = response.data;

        const productsWithImages = await Promise.all(
          productData.map(async (product) => {
            try {
              const imageResponse = await api.get(
                `/api/products/${product.id}/images`,
              );

              const images = imageResponse.data;

              const primaryImage =
                images.find((image) => image.is_primary) || images[0];

              return {
                ...product,

                primary_image: primaryImage?.image_url || null,
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
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <>
      <HeroSlider />

      <ShopByRoom />

      <FeaturedCollections />

      <ProductShowcase products={products} loading={loading} />

      <Testimonials />
    </>
  );
}

export default Home;
