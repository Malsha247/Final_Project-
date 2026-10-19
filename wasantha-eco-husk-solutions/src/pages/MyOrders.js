import API_BASE_URL from "../config/api";
import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "../Styles/MyOrders.css";

export default function MyOrders() {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const location = useLocation();

  const API_BASE =
    process.env.REACT_APP_API_BASE ||
    `${API_BASE_URL}`;

  const fetchOrders = useCallback(() => {
    if (!user || !user.id) {
      setOrders([]);
      return;
    }
    const url = `${API_BASE}/orders/getOrdersByUser.php?user_id=${user.id}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.orders || []);
        else setOrders([]);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setOrders([]);
      });
  }, [API_BASE, user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (location) {
      if (location.state && location.state.orderPlaced) {
        const id = location.state.orderId;
        setMessage(`Order #${id} placed successfully.`);
      } else {
        const params = new URLSearchParams(location.search);
        const qid = params.get("order_id");
        if (qid) setMessage(`Order #${qid} placed successfully.`);
      }
      fetchOrders();
      const t = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(t);
    }
  }, [location, fetchOrders]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?"))
      return;
    try {
      const res = await fetch(`${API_BASE}/orders/cancelOrder.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          actor: user.first_name || user.id || "Customer",
        }),
      });
      const text = await res.text();
      const data = JSON.parse(text);
      if (!data.success) {
        alert("Failed to cancel: " + (data.message || "unknown"));
      } else {
        // remove from state so it disappears immediately
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        alert("Order canceled");
      }
    } catch (err) {
      console.error("cancelOrder network error:", err);
      alert("Network error while canceling order");
    }
  };

  return (
    <div className="orders-page">
      <h2>My Orders</h2>

      {message && <div className="order-message">{message}</div>}
      <button onClick={fetchOrders} style={{ marginBottom: 12 }}>
        Refresh
      </button>

      {orders.length === 0 ? (
        <p className="no-orders">No orders found.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Created</th>
              <th>Cancel</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>Rs. {o.total_price}</td>
                <td>{o.payment_method}</td>
                <td className={o.status ? o.status.toLowerCase() : ""}>
                  {o.status}
                </td>
                <td>
                  {o.created_at ? new Date(o.created_at).toLocaleString() : "-"}
                </td>
                <td>
                  {o.status === "Pending" || o.status === "Processing" ? (
                    <button onClick={() => cancelOrder(o.id)}>Cancel</button>
                  ) : (
                    <span style={{ color: "#888" }}>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
