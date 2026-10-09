import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function ProductsPlaceholder() {
  return (
    <div
      style={{
        minHeight: "60vh",
        padding: "60px 40px",
      }}
    >
      <h1>Sản phẩm</h1>
    </div>
  );
}

function CartPlaceholder() {
  return (
    <div
      style={{
        minHeight: "60vh",
        padding: "60px 40px",
      }}
    >
      <h1>Giỏ hàng</h1>
    </div>
  );
}

function ProfilePlaceholder() {
  return (
    <div
      style={{
        minHeight: "60vh",
        padding: "60px 40px",
      }}
    >
      <h1>Hồ sơ cá nhân</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            USER LAYOUT
        ========================= */}

        <Route element={<UserLayout />}>
          {/* PUBLIC */}

          <Route path="/" element={<Home />} />

          <Route path="/products" element={<ProductsPlaceholder />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          {/* PROTECTED */}

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPlaceholder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePlaceholder />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
