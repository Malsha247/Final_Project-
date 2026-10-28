import API_BASE_URL from "../config/api";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../contexts/PreferencesContext";

export default function PaymentSuccess() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ type: "verifying" });
  const params = new URLSearchParams(window.location.search);
  const session_id = params.get("session_id");
  const order_id = params.get("order_id");

  useEffect(() => {
    if (!session_id || !order_id) {
      setStatus({ type: "missing" });
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
          setStatus({ type: "confirmed" });
          setTimeout(() => navigate("/my-orders"), 1500);
        } else {
          setStatus({ type: "verificationFailed", message: data.message });
        }
      } catch (err) {
        console.error(err);
        setStatus({ type: "networkError" });
      }
    }
    verify();
  }, [session_id, order_id, navigate]);

  const statusText = {
    verifying: t("Verifying payment..."),
    missing: t("Missing session or order id."),
    confirmed: t("Payment confirmed — order placed!"),
    verificationFailed: `${t("Verification failed: ")}${status.message}`,
    networkError: t("Network error while verifying payment."),
  }[status.type];

  return (
    <div style={{ padding: 30 }}>
      <h2>{statusText}</h2>
      <p>
        {t("If you are not redirected automatically,")}{" "}
        <button onClick={() => navigate("/my-orders")}>{t("Go to My Orders")}</button>
      </p>
    </div>
  );
}
