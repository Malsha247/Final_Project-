import API_BASE_URL from "../../config/api";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ClipboardList,
  Leaf,
  MessageSquare,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";
import { Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import { usePreferences } from "../../contexts/PreferencesContext";
import "../../Styles/AdminStyle/AdminDashboard.css";

const fetchList = async (path, key) => {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${path}`);
  }

  const payload = await response.json();
  if (!payload.success || !Array.isArray(payload[key])) {
    throw new Error(payload.message || `Invalid response for ${path}`);
  }

  return payload[key];
};

const formatDayKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;

const Dashboard = () => {
  const { t, theme } = usePreferences();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [orders, products, husks, feedback, deliveryPersons] =
        await Promise.all([
          fetchList("/orders/getAllOrders.php", "orders"),
          fetchList("/products/getAllProducts.php", "products"),
          fetchList("/seller/getAllHusks.php", "husks"),
          fetchList("/feedback/getAllFeedbacks.php", "feedbacks"),
          fetchList("/delivery/getAll.php", "data"),
        ]);

      setDashboardData({ orders, products, husks, feedback, deliveryPersons });
    } catch (loadError) {
      console.error("Failed to load admin dashboard:", loadError);
      setError(t("Dashboard data could not be loaded. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const orders = dashboardData?.orders || [];
  const products = dashboardData?.products || [];
  const deliveredCount = orders.filter(
    (order) => String(order.status).toLowerCase() === "delivered"
  ).length;
  const inStockCount = products.filter(
    (product) => Number(product.stock) > 0
  ).length;
  const fulfillmentProgress = orders.length
    ? Math.round((deliveredCount / orders.length) * 100)
    : 0;
  const inventoryProgress = products.length
    ? Math.round((inStockCount / products.length) * 100)
    : 0;

  const lastSevenDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return date;
    });
  }, []);

  const ordersByDay = new Map(
    lastSevenDays.map((date) => [formatDayKey(date), 0])
  );
  orders.forEach((order) => {
    const date = new Date(order.created_at);
    if (Number.isNaN(date.getTime())) return;
    const dayKey = formatDayKey(date);
    if (ordersByDay.has(dayKey)) {
      ordersByDay.set(dayKey, ordersByDay.get(dayKey) + 1);
    }
  });

  const statusCounts = orders.reduce((counts, order) => {
    const status = String(order.status || t("Unknown")).trim();
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  const chartTextColor = theme === "dark" ? "#b2c2b5" : "#647469";
  const orderTrendData = {
    labels: lastSevenDays.map((date) =>
      date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: t("Orders"),
        data: lastSevenDays.map((date) => ordersByDay.get(formatDayKey(date))),
        borderColor: "#62b477",
        backgroundColor: "rgba(98, 180, 119, 0.16)",
        pointBackgroundColor: "#a7d9ad",
        pointBorderColor: "#17241b",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.38,
      },
    ],
  };
  const orderTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === "dark" ? "#263d2d" : "#173b26",
        titleColor: "#f3f8f2",
        bodyColor: "#f3f8f2",
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: chartTextColor },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: chartTextColor },
        grid: {
          color: theme === "dark" ? "rgba(178, 194, 181, 0.12)" : "rgba(35, 67, 45, 0.08)",
        },
        border: { display: false, dash: [4, 4] },
      },
    },
  };
  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: ["#67b77c", "#e7b85c", "#7799ce", "#54a88a", "#d5786c"],
        borderColor: theme === "dark" ? "#17241b" : "#ffffff",
        borderWidth: 4,
        hoverOffset: 6,
      },
    ],
  };
  const statusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: chartTextColor,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 18,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: theme === "dark" ? "#263d2d" : "#173b26",
        titleColor: "#f3f8f2",
        bodyColor: "#f3f8f2",
        padding: 12,
      },
    },
  };

  const summaryCards = [
    {
      label: t("Total Orders"),
      value: orders.length,
      icon: ClipboardList,
      color: "mint",
      to: "/admin/order",
    },
    {
      label: t("Total Products"),
      value: products.length,
      icon: Package,
      color: "lime",
      to: "/admin/products",
    },
    {
      label: t("Registered Delivery Persons"),
      value: dashboardData?.deliveryPersons.length || 0,
      icon: Truck,
      color: "blue",
      to: "/admin/delivery-persons",
    },
    {
      label: t("Feedbacks and Inquiries"),
      value: dashboardData?.feedback.length || 0,
      icon: MessageSquare,
      color: "amber",
      to: "/admin/feedbacks",
    },
  ];

  return (
    <div className="admin-dashboard">
      <section className="dashboard-welcome">
        <div>
          <p className="dashboard-eyebrow">{t("Admin Dashboard")}</p>
          <h1>{t("Welcome back")}</h1>
          <p>{t("Here is what is happening with your store today.")}</p>
        </div>
        <button
          type="button"
          className="dashboard-refresh"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "is-spinning" : ""} />
          <span>{t("Refresh data")}</span>
        </button>
      </section>

      {error && (
        <div className="dashboard-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadDashboard}>
            {t("Try again")}
          </button>
        </div>
      )}

      <section className="dashboard-summary-grid" aria-label={t("Store summary")}>
        {summaryCards.map(({ label, value, icon: Icon, color, to }) => (
          <Link className="dashboard-summary-card" to={to} key={label}>
            <span className={`summary-icon ${color}`}>
              <Icon size={20} aria-hidden="true" />
            </span>
            <span className="summary-copy">
              <small>{label}</small>
              <strong>{loading && !dashboardData ? "—" : value}</strong>
            </span>
            <ArrowUpRight size={17} className="summary-arrow" aria-hidden="true" />
          </Link>
        ))}
      </section>

      <section className="dashboard-progress-section" aria-labelledby="progress-title">
        <div className="dashboard-section-heading">
          <div>
            <p className="dashboard-eyebrow">{t("Store health")}</p>
            <h2 id="progress-title">{t("Progress at a glance")}</h2>
          </div>
          <span className="dashboard-live-status">
            <span />
            {t("Live overview")}
          </span>
        </div>
        <div className="dashboard-progress-grid">
          <article className="progress-card">
            <div className="progress-card-heading">
              <span className="progress-icon"><ClipboardList size={18} /></span>
              <span>
                <strong>{t("Order fulfilment")}</strong>
                <small>{t("Orders marked as delivered")}</small>
              </span>
              <b>{fulfillmentProgress}%</b>
            </div>
            <progress value={fulfillmentProgress} max="100" aria-label={t("Order fulfilment")} />
            <p>{deliveredCount} / {orders.length} {t("orders delivered")}</p>
          </article>
          <article className="progress-card">
            <div className="progress-card-heading">
              <span className="progress-icon inventory"><Leaf size={18} /></span>
              <span>
                <strong>{t("Inventory health")}</strong>
                <small>{t("Products currently in stock")}</small>
              </span>
              <b>{inventoryProgress}%</b>
            </div>
            <progress className="inventory-progress" value={inventoryProgress} max="100" aria-label={t("Inventory health")} />
            <p>{inStockCount} / {products.length} {t("products available")}</p>
          </article>
        </div>
      </section>

      <section className="dashboard-charts-grid" aria-label={t("Dashboard analytics")}>
        <article className="dashboard-chart-card order-trend-card">
          <div className="dashboard-section-heading chart-heading">
            <div>
              <p className="dashboard-eyebrow">{t("Order activity")}</p>
              <h2>{t("Orders over the last 7 days")}</h2>
            </div>
            <span className="chart-period">{t("Last 7 days")}</span>
          </div>
          <div className="dashboard-chart">
            {loading && !dashboardData ? (
              <p className="chart-empty">{t("Loading dashboard data...")}</p>
            ) : (
              <Line data={orderTrendData} options={orderTrendOptions} />
            )}
          </div>
        </article>

        <article className="dashboard-chart-card status-chart-card">
          <div className="dashboard-section-heading chart-heading">
            <div>
              <p className="dashboard-eyebrow">{t("Order status")}</p>
              <h2>{t("Order breakdown")}</h2>
            </div>
          </div>
          <div className="dashboard-doughnut">
            {orders.length ? (
              <>
                <Doughnut data={statusData} options={statusOptions} />
                <div className="doughnut-total">
                  <strong>{orders.length}</strong>
                  <span>{t("Orders")}</span>
                </div>
              </>
            ) : (
              <p className="chart-empty">{t("No order data available yet.")}</p>
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-bottom-row">
        <article className="dashboard-recent-card">
          <div className="dashboard-section-heading recent-heading">
            <div>
              <p className="dashboard-eyebrow">{t("Latest activity")}</p>
              <h2>{t("Recent orders")}</h2>
            </div>
            <Link to="/admin/order" className="dashboard-text-link">
              {t("View all")} <ArrowUpRight size={15} />
            </Link>
          </div>
          {orders.length ? (
            <div className="dashboard-recent-list">
              {orders.slice(0, 5).map((order) => (
                <div className="recent-order-row" key={order.id}>
                  <span className="recent-order-icon"><ClipboardList size={17} /></span>
                  <span className="recent-order-customer">
                    <strong>{order.customer_name || t("Customer")}</strong>
                    <small>#{order.id} · {new Date(order.created_at).toLocaleDateString()}</small>
                  </span>
                  <span className="recent-order-total">{formatCurrency(order.total_price)}</span>
                  <span className={`order-status-badge ${String(order.status || "pending").toLowerCase()}`}>
                    {order.status || t("Unknown")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="chart-empty">{loading ? t("Loading dashboard data...") : t("No orders yet.")}</p>
          )}
        </article>
        <Link to="/admin/huskList" className="dashboard-husk-card">
          <span className="husk-card-icon"><Leaf size={21} /></span>
          <span className="husk-card-copy">
            <small>{t("Community")}</small>
            <strong>{t("Husk submissions")}</strong>
            <span>{dashboardData?.husks.length || 0} {t("submissions received")}</span>
          </span>
          <ArrowUpRight size={18} />
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;
