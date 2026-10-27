import API_BASE_URL from "../config/api";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying payment...");
  const params = new URLSearchParams(window.location.search);
  const session_id = params.get("session_id");
  const order_id = params.get("order_id");

  useEffect(() => {
    if (!session_id || !order_id) {
      setStatus("Missing session or order id.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/payment/paymentSuccess.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id, order_id }),
          }
        );
        const data = await res.json();
        if (data.success) {
          setStatus("Payment confirmed — order placed!");
          setTimeout(() => navigate("/my-orders"), 1500);
        } else {
          setStatus("Verification failed: " + data.message);
        }
      } catch (err) {
        console.error(err);
        setStatus("Network error while verifying payment.");
      }
    }
    verify();
  }, [session_id, order_id, navigate]);

  return (
    <div style={{ padding: 30 }}>
      <h2>{status}</h2>
      <p>
        If you are not redirected automatically,{" "}
        <button onClick={() => navigate("/my-orders")}>Go to My Orders</button>
      </p>
    </div>
  );
}
