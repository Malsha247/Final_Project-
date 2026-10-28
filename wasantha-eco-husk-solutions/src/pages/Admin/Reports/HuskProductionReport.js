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

export default function HuskProductionReport() {
  const { t } = usePreferences();
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/Reports/huskProductionReport.php`
      );
      const data = await res.json();

      if (data.success) {
        setSummary(data.summary);
        setRecords(data.data);
      }
    } catch (err) {
      console.error("Husk production report error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===== PDF ===== */
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(t("Husk Production Report"), 14, 15);

    doc.setFontSize(12);
    doc.text(`${t("Total Bags Cut")}: ${summary.total_bags}`, 14, 28);

    autoTable(doc, {
      startY: 40,
      head: [[t("Date"), t("Bags Cut")]],
      body: records.map((r) => [r.production_date, r.bags_cut]),
    });

    doc.save("husk-production-report.pdf");
  };

  /* ===== CHART ===== */
  const chartData = {
    labels: records.map((r) => r.production_date),
    datasets: [
      {
        label: t("Bags Cut"),
        data: records.map((r) => r.bags_cut),
        backgroundColor: "#2e7d32",
      },
    ],
  };

  if (loading) return <p style={{ padding: 20 }}>{t("Loading...")}</p>;
  if (!summary) return <p>{t("No production data available")}</p>;

  return (
    <div className="report-wrapper">
      <h2 className="report-title">{t("Husk Production Report")}</h2>

      {/* ACTIONS */}
      <div className="report-actions">
        <button className="back-btn" onClick={() => navigate("/admin/reports")}>
          {t("Back to Reports")}
        </button>
        <button className="pdf-btn" onClick={downloadPDF}>
          {t("Download PDF")}
        </button>
      </div>

      {/* SUMMARY */}
      <div className="summary-grid">
        <div className="summary-card">
          <h4>{t("Total Bags Cut")}</h4>
          <p>{summary.total_bags}</p>
        </div>
      </div>

      {/* CHART */}
      <div className="chart-card">
        <h4>{t("Daily Husk Production")}</h4>
        <Bar data={chartData} />
      </div>

      {/* TABLE */}
      <table className="report-table">
        <thead>
          <tr>
            <th>{t("Date")}</th>
            <th>{t("Bags Cut")}</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}>
              <td>{r.production_date}</td>
              <td>{r.bags_cut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
