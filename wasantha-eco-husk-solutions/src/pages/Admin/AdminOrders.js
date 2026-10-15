import React, { useEffect, useState } from "react";
import "../../Styles/AdminStyle/OrderManage.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE =
    "http://localhost:8081/api/orders";

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/getAllOrders.php`);
      const text = await res.text();

      try {
        const data = JSON.parse(text);
        if (data.success) setOrders(data.orders || []);
        else setOrders([]);
      } catch {
        console.error("Invalid JSON:", text);
        setOrders([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_BASE}/updateOrderStatus.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status }),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (data.success) fetchOrders();
      else alert(data.message || "Update failed");
    } catch (err) {
      alert("Network error");
    }
  };

 
  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/deleteOrder.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (data.success) {
        alert("Order deleted successfully");
        fetchOrders();
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="admin-orders">
      <h2>Manage Orders</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Total</th>
              <th>Status</th>
              <th>Change</th>
              <th>Delete</th> 
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_name}</td>
                <td>{o.shipping_address || "—"}</td>
                <td>Rs. {o.total_price}</td>
                <td>{o.status}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                  >
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Canceled</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => deleteOrder(o.id)}
                    style={{
                      background: "#e53935",
                      color: "#fff",
                      border: "none",
                      padding: "6px 10px",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    Delete
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
