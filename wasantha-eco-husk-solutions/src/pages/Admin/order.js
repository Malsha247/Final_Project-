import API_BASE_URL from "../../config/api";
import React, { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(
      `${API_BASE_URL}/orders/getAllOrders.php`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
      });
  }, []);

  return (
    <div className="admin-orders">
      <h2>Recent Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Customer</th>
            <th>Phone Number</th>
            <th>Address</th> {}
            <th>Payment</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer_name}</td>
              <td>{o.customer_phone}</td>
              <td>{o.shipping_address || "Not provided"}</td>
              <td>{o.payment_status}</td>
              <td>{o.status}</td>
              <td>Rs. {o.total_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
