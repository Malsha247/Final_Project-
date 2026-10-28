// src/pages/Payment/PaymentForm.js
import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { usePreferences } from "../../contexts/PreferencesContext";

/*
 Props:
  - clientSecret: string (from createPaymentIntent)
  - orderId: order id (for redirect or messages)
  - onSuccess(orderId) optional callback
*/
export default function PaymentForm({ clientSecret, orderId, onSuccess }) {
  const { t } = usePreferences();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            // you can pass billing details here if available
          },
        }
      );

      if (error) {
        console.error("Payment error:", error);
        alert(error.message || t("Payment failed"));
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded client-side. Final status will be updated by webhook.
        alert(t("Payment successful — we will confirm your order shortly."));
        if (onSuccess) onSuccess(orderId);
        // redirect to orders page (include order id as query param)
        window.location.href = `${
          process.env.PUBLIC_URL || ""
        }/my-orders?order_id=${encodeURIComponent(orderId)}`;
      } else {
        alert(
          t("Unexpected payment status: ") + (paymentIntent?.status || t("unknown"))
        );
      }
    } catch (err) {
      console.error("confirmCardPayment error:", err);
      alert(t("Payment confirmation error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 520, margin: "0 auto" }}>
      <div
        style={{ padding: 12, border: "1px solid #e6e6e6", borderRadius: 6 }}
      >
        <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
      </div>
      <div
        style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}
      >
        <button disabled={!stripe || loading} type="submit" className="pm-btn">
          {loading ? t("Processing...") : t("Pay now")}
        </button>
      </div>
    </form>
  );
}
