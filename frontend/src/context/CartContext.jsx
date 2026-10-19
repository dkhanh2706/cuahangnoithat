/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { CheckCircle2, Heart, X } from "lucide-react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCartState] = useState(() => {
    try {
      const saved = localStorage.getItem("furni_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const cartRef = useRef(cart);
  const setCart = (update) => {
    const next = typeof update === "function" ? update(cartRef.current) : update;
    cartRef.current = next;
    setCartState(next);
  };

  // wishlist stores full product objects (not just IDs)
  const [wishlistProducts, setWishlistProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("furni_wishlist_v2");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem("furni_cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("furni_wishlist_v2", JSON.stringify(wishlistProducts));
    } catch (e) {
      console.error(e);
    }
  }, [wishlistProducts]);


  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prevCart, { id: product.id, product, quantity }];
    });

    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, "success");
  };

  // One synchronous operation: either the entire confirmed selection is added,
  // or the cart is untouched, even if it changed during the availability request.
  const addToCartBatch = (items) => {
    const current = cartRef.current;
    const seen = new Set();
    for (const { product, quantity } of items) {
      const existing = current.find((item) => item.product.id === product.id);
      if (seen.has(product.id) || !Number.isInteger(quantity) || quantity < 1 ||
          (existing?.quantity || 0) + quantity > product.stock_quantity) {
        return { ok: false, error: `Số lượng "${product.name}" vượt tồn kho. Chưa thêm món nào; vui lòng kiểm tra lại giỏ hàng.` };
      }
      seen.add(product.id);
    }
    setCart((previous) => {
      const next = previous.map((item) => ({ ...item }));
      for (const { product, quantity } of items) {
        const existing = next.find((item) => item.product.id === product.id);
        if (existing) {
          existing.product = product;
          existing.quantity += quantity;
        } else {
          next.push({ id: product.id, product, quantity });
        }
      }
      return next;
    });
    showToast(`Đã thêm ${items.length > 1 ? `cả bộ ${items.length} sản phẩm` : `"${items[0].product.name}"`} vào giỏ hàng!`);
    return { ok: true };
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast("Đã xóa sản phẩm khỏi giỏ hàng.", "info");
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product) => {
    const exists = wishlistProducts.some((p) => p.id === product.id);
    if (exists) {
      setWishlistProducts((prev) => prev.filter((p) => p.id !== product.id));
      showToast(`Đã bỏ "${product.name}" khỏi danh sách yêu thích.`, "info");
    } else {
      setWishlistProducts((prev) => [...prev, product]);
      showToast(`Đã lưu "${product.name}" vào yêu thích! 💛`, "success");
    }
  };

  const isWishlisted = (productId) =>
    wishlistProducts.some((p) => p.id === productId);

  // Keep backward-compat: wishlist as array of IDs
  const wishlist = wishlistProducts.map((p) => p.id);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + (item.product.price || 0) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        wishlistProducts,
        addToCart,
        addToCartBatch,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isWishlisted,
        cartCount,
        cartTotal,
        showToast,
      }}
    >

      {children}

      {/* Floating Animated Toast Container */}
      <div className="global-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`global-toast ${toast.type}`}>
            <div className="global-toast-icon">
              {toast.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <Heart size={18} />
              )}
            </div>
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                marginLeft: "8px",
                color: "rgba(255,255,255,0.7)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
