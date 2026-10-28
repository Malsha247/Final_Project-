import API_BASE_URL from "../../config/api";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../../contexts/PreferencesContext";
import "../../Styles/AdminStyle/HuskProductionEntry.css";

export default function HuskProductionEntry() {
  const { t } = usePreferences();
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
      alert(t("Date and number of bags are required"));
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
        alert(t("Daily production recorded successfully."));
        navigate("/admin/reports/husk-production");
      } else {
        alert(data.message || t("Failed to save record"));
      }
    } catch (err) {
      console.error("Husk entry error:", err);
      alert(t("Server error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="husk-entry-wrapper">
      <div className="husk-entry-card">
        <h2>{t("Daily Husk Cutting")}</h2>
        <p className="subtitle">
          {t("Record the number of coconut husk bags cut today")}
        </p>

        <form onSubmit={handleSubmit}>
          <label>{t("Date")}</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />

          <label>{t("Number of Bags Cut")}</label>
          <input
            type="number"
            name="bags_cut"
            placeholder={t("e.g. 120")}
            value={form.bags_cut}
            onChange={handleChange}
            required
          />

          <label>{t("Notes (optional)")}</label>
          <textarea
            name="notes"
            rows="3"
            placeholder={t("Any remarks for today...")}
            value={form.notes}
            onChange={handleChange}
          />

          <div className="entry-actions">
            <button
              type="button"
              className="btn-back"
              onClick={() => navigate("/admin/reports")}
            >
              {t("Back")}
            </button>

            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? t("Saving...") : t("Save Entry")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
