import API_BASE_URL from "../../config/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "../../../Styles/AdminStyle/Reports/HuskProduction.css";

export default function HuskProductionReport() {
  const navigate = useNavigate();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState(null);

  const loadReport = async () => {
    const res = await fetch(
      `${API_BASE_URL}/Reports/huskProductionReport.php?start=${start}&end=${end}`
    );
    const json = await res.json();
    if (json.success) setData(json);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Weekly Husk Production Report", 14, 15);
    doc.text(`Total Bags Cut: ${data.total}`, 14, 25);

    autoTable(doc, {
      startY: 35,
      head: [["Date", "Bags Cut"]],
      body: data.days.map((d) => [d.production_date, d.bags_cut]),
    });

    doc.save("husk-production-report.pdf");
  };

  return (
    <div className="report-wrapper">
      <div className="report-header">
        <button className="back-btn" onClick={() => navigate("/admin/reports")}>
          Back
        </button>
        <h2>Husk Production Report</h2>
      </div>

      <div className="filters">
        <input type="date" onChange={(e) => setStart(e.target.value)} />
        <input type="date" onChange={(e) => setEnd(e.target.value)} />
        <button onClick={loadReport}>Generate</button>
      </div>

      {data && (
        <>
          <div className="summary-card">
            <h3>Total Bags Cut</h3>
            <p>{data.total}</p>
          </div>

          <Bar
            data={{
              labels: data.days.map((d) => d.production_date),
              datasets: [
                {
                  label: "Bags Cut",
                  data: data.days.map((d) => d.bags_cut),
                  backgroundColor: "#7CB342",
                },
              ],
            }}
          />

          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Bags Cut</th>
              </tr>
            </thead>
            <tbody>
              {data.days.map((d, i) => (
                <tr key={i}>
                  <td>{d.production_date}</td>
                  <td>{d.bags_cut}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="pdf-btn" onClick={downloadPDF}>
            Download PDF
          </button>
        </>
      )}
    </div>
  );
}
