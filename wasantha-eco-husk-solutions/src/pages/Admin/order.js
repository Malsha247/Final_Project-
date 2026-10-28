import API_BASE_URL from "../../config/api";
import React, { useEffect, useState } from "react";
import { usePreferences } from "../../contexts/PreferencesContext";

export default function AdminOrders() {
  const { t } = usePreferences();
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
      <h2>{t("Recent Orders")}</h2>
      <table>
        <thead>
          <tr>
            <th>{t("Order Number")}</th>
            <th>{t("Customer")}</th>
            <th>{t("Phone Number")}</th>
            <th>{t("Address")}</th> {}
            <th>{t("Payment")}</th>
            <th>{t("Status")}</th>
            <th>{t("Total")}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer_name}</td>
              <td>{o.customer_phone}</td>
              <td>{o.shipping_address || t("Not provided")}</td>
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
