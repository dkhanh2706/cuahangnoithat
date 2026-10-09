import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";

import Home from "./pages/Home";

import Login from "./pages/Login";

import Register from "./pages/Register";

import Products from "./pages/Products";

import ProductDetail from "./pages/ProductDetail";

import Cart from "./pages/Cart";

import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function CollectionsPlaceholder() {
  return (
    <div
      style={{
        width: "min(1180px, calc(100% - 40px))",
        margin: "60px auto",
        minHeight: "55vh",
      }}
    >
      <h1>Bộ sưu tập</h1>

      <p>Trang bộ sưu tập sẽ được xây dựng ở bước tiếp theo.</p>
    </div>
  );
}

function CollectionDetailPlaceholder() {
  return (
    <div
      style={{
        width: "min(1180px, calc(100% - 40px))",
        margin: "60px auto",
        minHeight: "55vh",
      }}
    >
      <h1>Chi tiết bộ sưu tập</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<UserLayout />}>
          {/* PUBLIC */}

          <Route path="/" element={<Home />} />

          <Route path="/products" element={<Products />} />

          <Route path="/products/:id" element={<ProductDetail />} />

          <Route path="/collections" element={<CollectionsPlaceholder />} />

          <Route
            path="/collections/:slug"
            element={<CollectionDetailPlaceholder />}
          />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          {/* PROTECTED */}

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
