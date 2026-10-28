import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../../contexts/PreferencesContext";
import "../../Styles/AdminStyle/DeliveryDashboard.css";

export default function DeliveryDashboard() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salary, setSalary] = useState(null);

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!user || user.role !== "delivery") {
      navigate("/login");
      return;
    }
    loadOrders();
    loadSalary();
    // eslint-disable-next-line
  }, []);

  /* ================= LOAD SHIPPED ORDERS ================= */
  const loadOrders = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/orders/getAllOrders.php`,
      );
      const data = await res.json();

      if (data.success) {
        // ONLY shipped orders
        const shipped = data.orders.filter((o) => o.status === "Shipped");
        setOrders(shipped);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Load delivery orders error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD SALARY ================= */
  const loadSalary = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/delivery/getSalary.php?id=${user.id}`,
      );
      const data = await res.json();

      if (data.success) {
        setSalary(data);
      }
    } catch (err) {
      console.error("Load salary failed:", err);
    }
  };

  /* ================= MARK DELIVERED ================= */
  const markDelivered = async (orderId) => {
    if (!window.confirm(t("Mark this order as delivered?"))) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/delivery/markDelivered.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            delivery_person_id: user.id,
          }),
        },
      );

      const data = await res.json();
      alert(data.message);

      if (data.success) {
        // remove delivered order
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        loadSalary(); // refresh salary
      }
    } catch (err) {
      console.error("Mark delivered error:", err);
      alert(t("Failed to mark delivered"));
    }
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  /* ================= UI ================= */
  return (
    <div className="delivery-page">
      <div className="delivery-header">
        <h2> {t("Delivery Dashboard")}</h2>
        <button className="logout-btn" onClick={logout}>
          {t("Logout")}
        </button>
      </div>

      <p className="welcome">
        {t("Welcome")}, <strong>{user?.name}</strong>
      </p>

      {/* ===== SALARY ===== */}
      {salary && (
        <div className="salary-box">
          <h3>{t("Salary")} — {salary.month}</h3>
          <p>{t("Delivered Orders")}: {salary.deliveries}</p>
          <p>{t("Base Salary")}: Rs. {salary.base.toLocaleString()}</p>
          <p>{t("Bonus")}: Rs. {salary.bonus.toLocaleString()}</p>
          <p>
            <strong>{t("Total")}: Rs. {salary.total.toLocaleString()}</strong>
          </p>
          <p>
            {t("Status")}:{" "}
            <strong className={salary.paid ? "paid" : "unpaid"}>
              {salary.paid ? t("PAID") : t("UNPAID")}
            </strong>
          </p>
        </div>
      )}

      {/* ===== ORDERS ===== */}
      {loading ? (
        <p>{t("Loading...")}</p>
      ) : orders.length === 0 ? (
        <p>{t("No shipped orders assigned.")}</p>
      ) : (
        <table className="delivery-table">
          <thead>
            <tr>
              <th>{t("Order #")}</th>
              <th>{t("Customer")}</th>
              <th>{t("Address")}</th>
              <th>{t("Status")}</th>
              <th>{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer_name}</td>
                <td>{o.shipping_address}</td>
                <td>{o.status}</td>
                <td>
                  <button
                    className="deliver-btn"
                    onClick={() => markDelivered(o.id)}
                  >
                    {t("Mark Delivered")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
