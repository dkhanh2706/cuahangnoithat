import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FurnitureChat from "../components/FurnitureChat";

function ScrollToTopOnNavigate() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Only scroll to top if not an anchor link
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname, search]);

  return null;
}

function UserLayout() {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="user-layout">
      <ScrollToTopOnNavigate />
      <Header />

      <main className="user-content">
        <Outlet />
      </main>

      <Footer />
      <FurnitureChat />

      {/* Floating Back To Top Button */}
      <button
        className={`back-to-top-btn ${showTopBtn ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Lên đầu trang"
        title="Lên đầu trang"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}

export default UserLayout;
