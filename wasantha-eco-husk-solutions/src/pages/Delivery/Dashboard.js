import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/AdminStyle/DeliveryDashboard.css";

export default function DeliveryDashboard() {
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
    if (!window.confirm("Mark this order as delivered?")) return;

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
      alert("Failed to mark delivered");
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
        <h2> Delivery Dashboard</h2>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <p className="welcome">
        Welcome, <strong>{user?.name}</strong>
      </p>

      {/* ===== SALARY ===== */}
      {salary && (
        <div className="salary-box">
          <h3>Salary — {salary.month}</h3>
          <p>Delivered Orders: {salary.deliveries}</p>
          <p>Base Salary: Rs. {salary.base.toLocaleString()}</p>
          <p>Bonus: Rs. {salary.bonus.toLocaleString()}</p>
          <p>
            <strong>Total: Rs. {salary.total.toLocaleString()}</strong>
          </p>
          <p>
            Status:{" "}
            <strong className={salary.paid ? "paid" : "unpaid"}>
              {salary.paid ? "PAID" : "UNPAID"}
            </strong>
          </p>
        </div>
      )}

      {/* ===== ORDERS ===== */}
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No shipped orders assigned.</p>
      ) : (
        <table className="delivery-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Status</th>
              <th>Action</th>
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
                    Mark Delivered
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
