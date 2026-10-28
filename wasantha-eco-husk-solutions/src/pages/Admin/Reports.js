import { useNavigate } from "react-router-dom";
import { usePreferences } from "../../contexts/PreferencesContext";
import "../../Styles/AdminStyle/Dashbord.css";

import stock from "../../assests/stock.png";
import order from "../../assests/checklist.png";
import customer from "../../assests/analystics.png";
import huskcut from "../../assests/report.png";
import enterHusk from "../../assests/enter.png";

export default function Reports() {
  const { t } = usePreferences();
  const navigate = useNavigate();

  const cards = [
    {
      id: "orders",
      title: t("Orders Report"),
      description: t("Sales, order counts, revenue and status breakdowns."),
      link: "/admin/reports/orders",
      image: order,
    },
    {
      id: "stocks",
      title: t("Stocks Report"),
      description: t("Product inventory, low-stock alerts and stock history."),
      link: "/admin/reports/stocks",
      image: stock,
    },
    {
      id: "customers",
      title: t("Customers Report"),
      description: t("Customer list, order frequency and top customers."),
      link: "/admin/reports/customers",
      image: customer,
    },
    {
      id: "husk-production",
      title: t("Husk Production Report"),
      description: t("Daily production data and total bags cut."),
      link: "/admin/reports/husk-production",
      image: huskcut,
    },
    {
      id: "husk-production-add",
      title: t("Add Daily Husk Cutting"),
      description: t("Record number of husk bags cut today."),
      link: "/admin/husk-production-entry",
      image: enterHusk,
    },
  ];

  return (
    <div className="eco-dashboard">
      <main className="dashboard-main">
        <h2>{t("Reports")}</h2>

        <div className="dashboard-grid">
          {cards.map((c) => (
            <div
              key={c.id}
              className="dashboard-card"
              onClick={() => navigate(c.link)}
              role="button"
              style={{ cursor: "pointer" }}
            >
              {/*  FIXED IMAGE */}
              <img src={c.image} alt={c.title} />

              <div style={{ padding: "12px 8px", textAlign: "center" }}>
                <h3 style={{ margin: "6px 0" }}>{c.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#555" }}>
                  {c.description}
                </p>
                <button style={{ marginTop: 10 }}>{c.title}</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
