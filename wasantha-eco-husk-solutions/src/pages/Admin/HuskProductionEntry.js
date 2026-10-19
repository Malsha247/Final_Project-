import API_BASE_URL from "../../config/api";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/AdminStyle/HuskProductionEntry.css";

export default function HuskProductionEntry() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    date: "",
    bags_cut: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.date || !form.bags_cut) {
      alert("Date and number of bags are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/reports/addHuskProduction.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Daily production recorded successfully ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã¢â‚¬â„¢Ãƒâ€šÃ‚Â¿");
        navigate("/admin/reports/husk-production");
      } else {
        alert(data.message || "Failed to save record");
      }
    } catch (err) {
      console.error("Husk entry error:", err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="husk-entry-wrapper">
      <div className="husk-entry-card">
        <h2>Daily Husk Cutting</h2>
        <p className="subtitle">
          Record the number of coconut husk bags cut today
        </p>

        <form onSubmit={handleSubmit}>
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />

          <label>Number of Bags Cut</label>
          <input
            type="number"
            name="bags_cut"
            placeholder="e.g. 120"
            value={form.bags_cut}
            onChange={handleChange}
            required
          />

          <label>Notes (optional)</label>
          <textarea
            name="notes"
            rows="3"
            placeholder="Any remarks for today..."
            value={form.notes}
            onChange={handleChange}
          />

          <div className="entry-actions">
            <button
              type="button"
              className="btn-back"
              onClick={() => navigate("/admin/reports")}
            >
              ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Ãƒâ€šÃ‚Â Back
            </button>

            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
