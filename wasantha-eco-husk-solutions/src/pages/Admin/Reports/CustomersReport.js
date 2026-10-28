import API_BASE_URL from "../../../config/api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../../../contexts/PreferencesContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import "../../../Styles/AdminStyle/Reports/reportBase.css";
import "../../../Styles/AdminStyle/Reports/customersReport.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CustomersReport() {
  const { t } = usePreferences();
  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/Reports/customersReport.php`
      );
      const data = await res.json();

      if (data.success) {
        setSummary(data.summary);
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error("Customers report error:", err);
    } finally {
      setLoading(false);
    }
  };

 
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(t("Customers Report"), 14, 15);

    doc.setFontSize(11);
    doc.text(`${t("Total Customers")}: ${summary.total_customers}`, 14, 25);

    autoTable(doc, {
      startY: 35,
      head: [[t("Customer"), t("Email"), t("Orders"), t("Total Spent (Rs.)")]],
      body: customers.map((c) => [
        c.customer_name,
        c.email,
        c.total_orders,
        c.total_spent,
      ]),
    });

    doc.save("customers-report.pdf");
  };


  const chartData = {
    labels: customers.map((c) => c.customer_name),
    datasets: [
      {
        label: t("Total Spent (Rs.)"),
        data: customers.map((c) => c.total_spent),
        backgroundColor: "#2e7d32",
      },
    ],
  };

  if (loading) return <p style={{ padding: 20 }}>{t("Loading...")}</p>;
  if (!summary) return <p>{t("No customer data available")}</p>;

  return (
    <div className="report-wrapper">
      <h2 className="report-title">{t("Customers Report")}</h2>


      <div className="report-actions">
        <button className="back-btn" onClick={() => navigate("/admin/reports")}>
          {t("Back to Reports")}
        </button>
        <button className="pdf-btn" onClick={downloadPDF}>
          {t("Download PDF")}
        </button>
      </div>

     
      <div className="summary-grid">
        <div className="summary-card">
          <h4>{t("Total Customers")}</h4>
          <p>{summary.total_customers}</p>
        </div>
      </div>

      {/* CHART */}
      <div className="chart-card">
        <h4>{t("Top Customers by Spending")}</h4>
        <Bar data={chartData} />
      </div>

      {/* TABLE */}
      <table className="report-table">
        <thead>
          <tr>
            <th>{t("Customer")}</th>
            <th>{t("Email")}</th>
            <th>{t("Orders")}</th>
            <th>{t("Total Spent (Rs.)")}</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.customer_name}</td>
              <td>{c.email}</td>
              <td>{c.total_orders}</td>
              <td>Rs. {c.total_spent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
