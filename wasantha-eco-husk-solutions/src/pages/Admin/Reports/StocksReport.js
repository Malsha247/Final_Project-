import API_BASE_URL from "../../../config/api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import "../../../Styles/AdminStyle/Reports/reportBase.css";
import "../../../Styles/AdminStyle/Reports/stocksReport.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function StocksReport() {
  const [summary, setSummary] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadReport();
  }, []);

  /* ===== LOAD REPORT ===== */
  const loadReport = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/Reports/stockReport.php`,
        { credentials: "include" }
      );

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("StocksReport invalid JSON:", text);
        return;
      }

      if (data.success) {
        setSummary(data.summary);
        setStocks(data.stocks);
      } else {
        console.error("StocksReport backend error:", data.message);
      }
    } catch (err) {
      console.error("Stocks report error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===== PDF DOWNLOAD ===== */
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Stock Report", 14, 15);

    doc.setFontSize(11);
    doc.text(`Total Products: ${summary.total_products}`, 14, 25);
    doc.text(`Total Stock Units: ${summary.total_stock}`, 14, 32);
    doc.text(`Low Stock Items: ${summary.low_stock}`, 14, 39);

    autoTable(doc, {
      startY: 50,
      head: [["Product", "Stock", "Price"]],
      body: stocks.map((p) => [p.product_name, p.stock, `Rs. ${p.price}`]),
    });

    doc.save("stocks-report.pdf");
  };

  /* ===== CHART DATA ===== */
  const chartData = {
    labels: stocks.map((p) => p.product_name),
    datasets: [
      {
        label: "Stock Quantity",
        data: stocks.map((p) => p.stock),
        backgroundColor: "#66bb6a",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };

  /* ===== GUARDS ===== */
  if (loading) {
    return <p style={{ padding: 20 }}>Loading stock report...</p>;
  }

  if (!summary) {
    return <p style={{ padding: 20 }}>No stock data available</p>;
  }

  return (
    <div className="report-wrapper">
      <h2 className="report-title">Stock Report</h2>

      {/* ACTION BUTTONS */}
      <div className="report-actions">
        <button className="back-btn" onClick={() => navigate("/admin/reports")}>
          Back to Reports
        </button>

        <button className="pdf-btn" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>

      {/* SUMMARY */}
      <div className="summary-grid">
        <div className="summary-card">
          <h4>Total Products</h4>
          <p>{summary.total_products}</p>
        </div>

        <div className="summary-card">
          <h4>Total Stock</h4>
          <p>{summary.total_stock}</p>
        </div>

        <div className="summary-card danger">
          <h4>Low Stock Items</h4>
          <p>{summary.low_stock}</p>
        </div>
      </div>

      {/* CHART */}
      <div className="chart-card">
        <h3>Stock Levels</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* TABLE */}
      <table className="report-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((p) => (
            <tr key={p.id}>
              <td>{p.product_name}</td>
              <td className={p.stock <= 5 ? "low-stock" : ""}>{p.stock}</td>
              <td>Rs. {p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
