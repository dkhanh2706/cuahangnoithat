import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

function UserLayout() {
  return (
    <div className="user-layout">
      <Header />

      <main className="user-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default UserLayout;
