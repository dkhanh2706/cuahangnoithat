import { useState } from "react";

import "../../styles/home/ConsultationSection.css";

function ConsultationSection() {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.phone.trim()) {
      setMessage("Vui lòng nhập số điện thoại.");

      return;
    }

    setMessage(
      "Thông tin đã được ghi nhận. Phần API tư vấn sẽ được kết nối ở bước tiếp theo.",
    );
  };

  return (
    <section className="consultation-section">
      <div className="consultation-content">
        <p>TƯ VẤN NỘI THẤT</p>

        <h2>Cần tư vấn thiết kế?</h2>

        <span>
          Để lại thông tin, đội ngũ tư vấn sẽ hỗ trợ lựa chọn sản phẩm phù hợp
          với không gian của bạn.
        </span>
      </div>

      <form className="consultation-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Họ và tên"
          value={formData.full_name}
          onChange={(event) =>
            setFormData({
              ...formData,
              full_name: event.target.value,
            })
          }
        />

        <input
          type="tel"
          placeholder="Số điện thoại"
          value={formData.phone}
          onChange={(event) =>
            setFormData({
              ...formData,
              phone: event.target.value,
            })
          }
        />

        <button type="submit">Yêu cầu tư vấn</button>

        {message && <p className="consultation-message">{message}</p>}
      </form>
    </section>
  );
}

export default ConsultationSection;
