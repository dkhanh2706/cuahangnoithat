import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Banknote, ShoppingBag, Clock, UserPlus, AlertTriangle, RefreshCw, Trophy } from "lucide-react";
import adminService from "../services/adminService";
import "../styles/Dashboard.css";

const RANGES = [7, 30, 90];

const STATUS_LABELS = {
  PENDING: { label: "Chờ xác nhận", color: "#f59e0b" },
  CONFIRMED: { label: "Đã xác nhận", color: "#38bdf8" },
  SHIPPING: { label: "Đang giao", color: "#a855f7" },
  COMPLETED: { label: "Hoàn tất", color: "#10b981" },
  CANCELLED: { label: "Đã hủy", color: "#f43f5e" },
};

const money = (value) => `${Math.round(value || 0).toLocaleString("vi-VN")}₫`;

// Rút gọn số tiền cho trục biểu đồ: 1,2tr / 850k
function shortMoney(value) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1).replace(".", ",")}tỷ`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1).replace(".", ",")}tr`;
  if (value >= 1e3) return `${Math.round(value / 1e3)}k`;
  return String(Math.round(value));
}

function niceMax(value) {
  if (value <= 0) return 1000000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function RevenueChart({ daily }) {
  const [hover, setHover] = useState(null);
  const width = 720;
  const height = 240;
  const pad = { top: 16, right: 12, bottom: 28, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(...daily.map((d) => d.revenue), 0));
  const slot = innerW / daily.length;
  const barW = Math.max(2, Math.min(24, slot * 0.7));
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const labelEvery = Math.ceil(daily.length / 8);
  const hasData = daily.some((d) => d.revenue > 0);

  return (
    <div className="dash-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ doanh thu theo ngày" className="dash-chart">
        {ticks.map((t) => {
          const y = pad.top + innerH - innerH * t;
          return (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="dash-grid-line" />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" className="dash-axis-text">
                {shortMoney(max * t)}
              </text>
            </g>
          );
        })}
        {daily.map((d, i) => {
          const h = (d.revenue / max) * innerH;
          const x = pad.left + i * slot + (slot - barW) / 2;
          const y = pad.top + innerH - h;
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={pad.left + i * slot} y={pad.top} width={slot} height={innerH} fill="transparent" />
              <rect x={x} y={d.revenue > 0 ? y : pad.top + innerH - 1} width={barW} height={d.revenue > 0 ? Math.max(h, 2) : 1}
                rx={2} className={`dash-bar${hover === i ? " hover" : ""}`} />
              {i % labelEvery === 0 && (
                <text x={pad.left + i * slot + slot / 2} y={height - 8} textAnchor="middle" className="dash-axis-text">
                  {d.date.slice(8, 10)}/{d.date.slice(5, 7)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="dash-tooltip" style={{ left: `${((pad.left + hover * slot + slot / 2) / width) * 100}%` }}>
          <strong>{daily[hover].date.split("-").reverse().join("/")}</strong>
          <span>{money(daily[hover].revenue)}</span>
          <small>{daily[hover].orders} đơn</small>
        </div>
      )}
      {!hasData && <p className="dash-chart-empty">Chưa có doanh thu trong khoảng thời gian này.</p>}
    </div>
  );
}

function Dashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    adminService
      .getDashboard(days)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError("");
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.detail || "Không thể tải số liệu tổng quan.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [days, reload]);

  const refresh = () => {
    setLoading(true);
    setReload((n) => n + 1);
  };
  const changeRange = (value) => {
    if (value === days) return;
    setLoading(true);
    setDays(value);
  };

  const totalOrders = data ? Object.values(data.orders_by_status).reduce((a, b) => a + b, 0) : 0;
  const maxTopQuantity = data ? Math.max(...data.top_products.map((p) => p.quantity), 1) : 1;

  return (
    <div className="admin-page-container dash-page">
      <div className="admin-page-header">
        <div className="header-text">
          <span className="header-eyebrow">TỔNG QUAN KINH DOANH</span>
          <h1>Bảng điều khiển</h1>
          <p>Doanh thu chỉ tính đơn đã hoàn tất (đã thu tiền); đơn demo cũ không được tính.</p>
        </div>
        <div className="dash-toolbar">
          <div className="dash-range" role="group" aria-label="Khoảng thời gian">
            {RANGES.map((value) => (
              <button key={value} type="button" className={value === days ? "active" : ""} onClick={() => changeRange(value)}>
                {value} ngày
              </button>
            ))}
          </div>
          <button type="button" className="dash-refresh" onClick={refresh} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Làm mới
          </button>
        </div>
      </div>

      {error && <div className="dash-error" role="alert">{error}</div>}

      {!data && loading && <p className="dash-loading">Đang tải số liệu...</p>}

      {data && (
        <>
          <div className="dash-stats">
            <div className="dash-stat">
              <span className="dash-stat-icon gold"><Banknote size={20} /></span>
              <div>
                <small>Doanh thu {data.days} ngày</small>
                <strong>{money(data.totals.revenue_period)}</strong>
                <em>Tổng từ trước tới nay: {money(data.totals.revenue)}</em>
              </div>
            </div>
            <div className="dash-stat">
              <span className="dash-stat-icon blue"><ShoppingBag size={20} /></span>
              <div>
                <small>Đơn hàng {data.days} ngày</small>
                <strong>{data.totals.orders_period}</strong>
                <em>{data.totals.products_active} sản phẩm đang bán</em>
              </div>
            </div>
            <Link to="/admin/orders" className={`dash-stat link${data.totals.pending_orders > 0 ? " alert" : ""}`}>
              <span className="dash-stat-icon amber"><Clock size={20} /></span>
              <div>
                <small>Chờ xác nhận</small>
                <strong>{data.totals.pending_orders}</strong>
                <em>{data.totals.pending_orders > 0 ? "Bấm để xử lý ngay" : "Không có đơn tồn đọng"}</em>
              </div>
            </Link>
            <div className="dash-stat">
              <span className="dash-stat-icon green"><UserPlus size={20} /></span>
              <div>
                <small>Khách mới {data.days} ngày</small>
                <strong>{data.totals.new_customers}</strong>
                <em>Tổng {data.totals.customers} khách hàng</em>
              </div>
            </div>
          </div>

          <section className="dash-card">
            <header><h2>Doanh thu theo ngày</h2></header>
            <RevenueChart daily={data.daily} />
          </section>

          <div className="dash-two-col">
            <section className="dash-card">
              <header><h2>Đơn hàng theo trạng thái</h2></header>
              {totalOrders === 0 ? (
                <p className="dash-empty">Chưa có đơn hàng nào.</p>
              ) : (
                <ul className="dash-status-list">
                  {Object.entries(STATUS_LABELS).map(([key, meta]) => {
                    const count = data.orders_by_status[key] || 0;
                    return (
                      <li key={key}>
                        <span className="dash-status-name">{meta.label}</span>
                        <span className="dash-status-track">
                          <span style={{ width: `${(count / totalOrders) * 100}%`, background: meta.color }} />
                        </span>
                        <span className="dash-status-count">{count}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="dash-card">
              <header><h2><Trophy size={16} /> Sản phẩm bán chạy</h2></header>
              {data.top_products.length === 0 ? (
                <p className="dash-empty">Chưa có đơn hoàn tất để thống kê.</p>
              ) : (
                <ol className="dash-top-list">
                  {data.top_products.map((product, index) => (
                    <li key={product.name}>
                      <span className="dash-rank">{index + 1}</span>
                      <div>
                        <strong title={product.name}>{product.name}</strong>
                        <span className="dash-top-track"><span style={{ width: `${(product.quantity / maxTopQuantity) * 100}%` }} /></span>
                      </div>
                      <div className="dash-top-meta">
                        <strong>{product.quantity} cái</strong>
                        <small>{money(product.revenue)}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <section className="dash-card">
            <header>
              <h2><AlertTriangle size={16} /> Sắp hết hàng</h2>
              <small>Tồn kho từ {data.low_stock_limit} trở xuống</small>
            </header>
            {data.low_stock.length === 0 ? (
              <p className="dash-empty">Tất cả sản phẩm đều còn đủ hàng.</p>
            ) : (
              <ul className="dash-low-stock">
                {data.low_stock.map((product) => (
                  <li key={product.id}>
                    <span title={product.name}>{product.name}</span>
                    <strong className={product.stock_quantity === 0 ? "out" : ""}>
                      {product.stock_quantity === 0 ? "Hết hàng" : `Còn ${product.stock_quantity}`}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/admin/products" className="dash-link">Quản lý sản phẩm →</Link>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
