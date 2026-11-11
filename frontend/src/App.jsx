import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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

// Các trang quản trị chỉ tải khi admin truy cập, giúp bundle của khách nhẹ hơn.
const Dashboard = lazy(() => import("./admin/pages/Dashboard"));
const UserManagement = lazy(() => import("./admin/pages/UserManagement"));
const ProductManagement = lazy(() => import("./admin/pages/ProductManagement"));
const CustomerChat = lazy(() => import("./admin/pages/CustomerChat"));
const OrderManagement = lazy(() => import("./admin/pages/OrderManagement"));
const NewsletterSubscribers = lazy(() => import("./admin/pages/NewsletterSubscribers"));
import Policies from "./pages/Policies";

import { CartProvider } from "./context/CartContext";

function adminPage(page) {
  return (
    <AdminRoute>
      <AdminLayout>
        <Suspense fallback={null}>{page}</Suspense>
      </AdminLayout>
    </AdminRoute>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* ================= ADMIN PORTAL ================= */}

          <Route path="/admin" element={adminPage(<Dashboard />)} />
          <Route path="/admin/users" element={adminPage(<UserManagement />)} />
          <Route path="/admin/products" element={adminPage(<ProductManagement />)} />
          <Route path="/admin/chat" element={adminPage(<CustomerChat />)} />
          <Route path="/admin/orders" element={adminPage(<OrderManagement />)} />
          <Route path="/admin/subscribers" element={adminPage(<NewsletterSubscribers />)} />

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
            <Route path="/policies/:type" element={<Policies />} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />

            <Route path="/wishlist" element={<Wishlist />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/reset-password" element={<ResetPassword />} />

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
