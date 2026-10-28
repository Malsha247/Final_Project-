import API_BASE_URL from "../../../config/api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../../../contexts/PreferencesContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

import "../../../Styles/AdminStyle/Reports/reportBase.css";
import "../../../Styles/AdminStyle/Reports/OrdersReport.css";

/* ===== REGISTER CHARTS ===== */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function OrdersReport() {
  const { t } = usePreferences();
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/reports/ordersReport.php`
      );
      const data = await res.json();

      if (data.success) {
        setSummary(data.summary);
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Orders report error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===== PDF DOWNLOAD ===== */
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(t("Orders Report"), 14, 15);

    doc.setFontSize(11);
    doc.text(`${t("Total Orders")}: ${summary.total_orders}`, 14, 25);
    doc.text(`${t("Total Revenue")}: Rs. ${summary.total_revenue}`, 14, 32);
    doc.text(`${t("Pending Orders")}: ${summary.pending_orders}`, 14, 39);
    doc.text(`${t("Delivered Orders")}: ${summary.delivered_orders}`, 14, 46);

    autoTable(doc, {
      startY: 55,
      head: [[t("ID"), t("Customer"), t("Total"), t("Status"), t("Date")]],
      body: orders.map((o) => [
        o.id,
        o.customer_name,
        `Rs. ${o.total_price}`,
        o.status,
        new Date(o.created_at).toLocaleDateString(),
      ]),
    });

    doc.save("orders-report.pdf");
  };

  if (loading) return <p style={{ padding: 20 }}>{t("Loading...")}</p>;

  /* ===== CHART DATA ===== */
  const statusChartData = {
    labels: [t("Pending"), t("Delivered")],
    datasets: [
      {
        label: t("Orders Count"),
        data: [summary.pending_orders, summary.delivered_orders],
        backgroundColor: ["#ff9800", "#4caf50"],
      },
    ],
  };

  const revenueByDate = orders.reduce((acc, o) => {
    const date = new Date(o.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + Number(o.total_price);
    return acc;
  }, {});

  const revenueChartData = {
    labels: Object.keys(revenueByDate),
    datasets: [
      {
        label: t("Daily Revenue (Rs.)"),
        data: Object.values(revenueByDate),
        backgroundColor: "#2e7d32",
      },
    ],
  };

  return (
    <div className="report-wrapper">
      {/* HEADER */}
      <div className="report-header">
        <h2 className="report-title">{t("Orders Report")}</h2>

        <div className="report-actions">
          <button
            className="back-btn"
            onClick={() => navigate("/admin/reports")}
          >
            {t("Back to Reports")}
          </button>
          <button className="pdf-btn" onClick={downloadPDF}>
            {t("Download PDF")}
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="summary-grid">
        <div className="summary-card">
          <h4>{t("Total Orders")}</h4>
          <p>{summary.total_orders}</p>
        </div>
        <div className="summary-card">
          <h4>{t("Total Revenue")}</h4>
          <p>Rs. {summary.total_revenue}</p>
        </div>
        <div className="summary-card">
          <h4>{t("Pending Orders")}</h4>
          <p>{summary.pending_orders}</p>
        </div>
        <div className="summary-card">
          <h4>{t("Delivered Orders")}</h4>
          <p>{summary.delivered_orders}</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>{t("Order Status Distribution")}</h3>
          <Pie data={statusChartData} />
        </div>

        <div className="chart-card">
          <h3>{t("Revenue by Date")}</h3>
          <Bar data={revenueChartData} />
        </div>
      </div>

      {/* TABLE */}
      <table className="report-table">
        <thead>
          <tr>
            <th>{t("ID")}</th>
            <th>{t("Customer")}</th>
            <th>{t("Total")}</th>
            <th>{t("Status")}</th>
            <th>{t("Date")}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer_name}</td>
              <td>Rs. {o.total_price}</td>
              <td className={`status ${o.status.toLowerCase()}`}>{o.status}</td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
