import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/home/FloatingChat.css";

function FloatingChat() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("access_token");

  const handleConsultation = () => {
    if (!token) {
      navigate("/login", {
        state: {
          from: "/",
        },
      });

      return;
    }

    navigate("/consultation");
  };

  return (
    <div className="floating-chat">
      {open && (
        <div className="floating-chat-box">
          <div className="floating-chat-heading">
            <div>
              <strong>FurniHome</strong>

              <span>Tư vấn trực tuyến</span>
            </div>

            <button onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="floating-chat-body">
            <p>Xin chào 👋</p>

            <span>
              Bạn cần hỗ trợ lựa chọn sản phẩm hay thiết kế không gian?
            </span>

            <button onClick={handleConsultation}>Bắt đầu tư vấn</button>
          </div>
        </div>
      )}

      <button
        className="floating-chat-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        ☏
      </button>
    </div>
  );
}

export default FloatingChat;
