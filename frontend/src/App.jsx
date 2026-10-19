import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Reviews from "./pages/Reviews";
import OrderHistory from "./pages/OrderHistory";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminRoute from "./admin/AdminRoute";
import AdminLayout from "./admin/layouts/AdminLayout";
import UserManagement from "./admin/pages/UserManagement";
import ProductManagement from "./admin/pages/ProductManagement";

import { CartProvider } from "./context/CartContext";

import "./App.css";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* ================= ADMIN PORTAL ================= */}

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route path="/admin/products" element={<AdminRoute><AdminLayout><ProductManagement /></AdminLayout></AdminRoute>} />

          {/* ================= STORE CLIENT ================= */}

          <Route element={<UserLayout />}>
            {/* PUBLIC ROUTES */}

            <Route path="/" element={<Home />} />

            <Route path="/products" element={<Products />} />

            <Route path="/products/:id" element={<ProductDetail />} />

            <Route path="/collections" element={<Collections />} />

            <Route path="/collections/:slug" element={<CollectionDetail />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />

            <Route path="/wishlist" element={<Wishlist />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            {/* PROTECTED ROUTES */}

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* FALLBACK */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
