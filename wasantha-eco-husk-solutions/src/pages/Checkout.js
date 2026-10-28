import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../contexts/PreferencesContext";
import API_BASE_URL from "../config/api";
import "../Styles/Checkout.css";

const PAYPAL_CLIENT_ID =
  "AT4qKjbFY7qUW-16QiinkmuEHKDf5NthAHWCnfi_7LPaWU50S8o_p0oiHPz8LahGRpGB7eGnKDdAQk6v";

const USD_RATE = 300;

export default function Checkout() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const submittingRef = useRef(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [paypalReady, setPaypalReady] = useState(
    () => Boolean(window.paypal)
  );
  const [paypalError, setPaypalError] = useState("");

  const [form, setForm] = useState({
    customer_name: user?.first_name || user?.name || "",
    customer_email: user?.email || "",
    customer_phone: "",
    shipping_address: "",
    payment_method: "Cash on Delivery",
  });

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      ),
    [cart]
  );

  const totalUSD = (total / USD_RATE).toFixed(2);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Load cart.
  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    const controller = new AbortController();

    const loadCart = async () => {
      setCartLoading(true);
      setCartError("");

      try {
        const res = await fetch(
          `${API_BASE_URL}/cart/getCart.php?user_id=${encodeURIComponent(
            user.id
          )}`,
          { signal: controller.signal }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || t("Could not load your cart."));
        }

        setCart(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Load cart failed:", err);
        setCartError(err.message || t("Could not load your cart."));
      } finally {
        if (!controller.signal.aborted) {
          setCartLoading(false);
        }
      }
    };

    loadCart();

    return () => controller.abort();
  }, [user, navigate, t]);

  // Load PayPal SDK.
  useEffect(() => {
    if (window.paypal) {
      setPaypalReady(true);
      return;
    }

    const scriptId = "paypal-sdk";
    let script = document.getElementById(scriptId);
    const isNewScript = !script;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src =
        `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}` +
        "&currency=USD&intent=capture";
      script.async = true;
    }

    const handleLoad = () => {
      if (window.paypal) {
        setPaypalReady(true);
        setPaypalError("");
      } else {
        setPaypalError(t("PayPal could not be loaded. Please refresh the page."));
      }
    };

    const handleError = () => {
      setPaypalError(t("PayPal could not be loaded. Please refresh the page."));
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (isNewScript) {
      document.body.appendChild(script);
    }

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [t]);

  // Render PayPal buttons using the current form and total.
  useEffect(() => {
    if (form.payment_method !== "PayPal") return;
    if (!paypalReady || !window.paypal || !user?.id) return;
    if (cartLoading || cartError || total <= 0) return;

    const container = document.getElementById("paypal-button-container");
    if (!container) return;

    let disposed = false;
    container.innerHTML = "";
    setPaypalError("");

    const buttons = window.paypal.Buttons({
      onClick: (data, actions) => {
        if (!formRef.current?.reportValidity()) {
          return actions.reject();
        }

        return actions.resolve();
      },

      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: totalUSD,
              },
            },
          ],
        });
      },

      onApprove: async (data, actions) => {
        let captured = false;

        try {
          await actions.order.capture();
          captured = true;

          const res = await fetch(`${API_BASE_URL}/orders/checkout.php`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: user.id,
              ...form,
              payment_method: "PayPal",
              total_price: total,
              paypal_order_id: data.orderID,
            }),
          });

          const result = await res.json();

          if (!res.ok || !result.success) {
            throw new Error(result.message || t("Order save failed."));
          }

          alert(
            result.email_sent === false
              ? t("Payment successful and order placed, but the confirmation email could not be sent. Please check My Orders.")
              : t("Payment successful!")
          );
          navigate("/my-orders");
        } catch (err) {
          console.error("PayPal checkout failed:", err);

          alert(
            captured
              ? t("Payment captured, but order confirmation failed. Please contact support before paying again.")
              : t("Payment could not be completed. Please check your payment status.")
          );
        }
      },

      onError: (err) => {
        console.error("PayPal/Card Error:", err);
        alert(t("A payment error occurred. Please check your payment status."));
      },
    });

    const renderButtons = async () => {
      try {
        await buttons.render(container);
      } catch (err) {
        if (!disposed) {
          console.error("PayPal render failed:", err);
          setPaypalError(
            t("PayPal buttons could not be displayed. Please refresh the page.")
          );
        }
      }
    };

    renderButtons();

    return () => {
      disposed = true;

      const closeButtons = async () => {
        try {
          await buttons.close();
        } catch {
          // The buttons may already be closed.
        }
      };

      closeButtons();
    };
  }, [
    form,
    total,
    totalUSD,
    user,
    navigate,
    paypalReady,
    cartLoading,
    cartError,
    t,
  ]);

  // Cash on delivery.
  const placeCODOrder = async (e) => {
    e.preventDefault();

    if (form.payment_method !== "Cash on Delivery") return;
    if (submittingRef.current) return;

    if (!user?.id) {
      navigate("/login");
      return;
    }

    if (cartLoading || cartError || cart.length === 0) {
      alert(t("Please make sure your cart contains items before ordering."));
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/orders/checkout.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          ...form,
          payment_method: "Cash on Delivery",
          total_price: total,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || t("Order failed."));
      }

      alert(
        data.email_sent === false
          ? t("Order placed successfully, but the confirmation email could not be sent. Please check My Orders.")
          : t("Order placed successfully")
      );
      navigate("/my-orders");
    } catch (err) {
      console.error("Checkout failed:", err);
      alert(
        t("Could not confirm your order. Check My Orders before trying again.")
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2>{t("Checkout")}</h2>

      {cartError && (
        <p className="error-msg" role="alert">
          {cartError}
        </p>
      )}

      <form
        ref={formRef}
        onSubmit={placeCODOrder}
        className="checkout-form"
      >
        <input
          name="customer_name"
          placeholder={t("Full Name")}
          value={form.customer_name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="customer_email"
          placeholder={t("Email")}
          value={form.customer_email}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="customer_phone"
          placeholder={t("Phone Number")}
          value={form.customer_phone}
          onChange={handleChange}
          required
        />

        <textarea
          name="shipping_address"
          placeholder={t("Shipping Address")}
          value={form.shipping_address}
          onChange={handleChange}
          required
        />

        <select
          name="payment_method"
          value={form.payment_method}
          onChange={handleChange}
        >
          <option value="Cash on Delivery">{t("Cash on Delivery")}</option>
          <option value="PayPal">{t("PayPal")}</option>
        </select>

        <div className="order-summary">
          <h3>{t("Items")}</h3>

          {cartLoading ? (
            <p>{t("Loading your cart...")}</p>
          ) : cart.length === 0 ? (
            <p>{t("No items in cart")}</p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  fontSize: 14,
                }}
              >
                <span>
                  {item.name} — {item.quantity}
                </span>
                <span>
                  Rs.{" "}
                  {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                </span>
              </div>
            ))
          )}

          <hr />
          <h3>{t("Total:")} Rs. {total.toFixed(2)}</h3>

          {form.payment_method === "PayPal" && (
            <p>{t("PayPal Amount:")} ${totalUSD}</p>
          )}
        </div>

        {form.payment_method === "Cash on Delivery" && (
          <button
            type="submit"
            disabled={
              submitting ||
              cartLoading ||
              Boolean(cartError) ||
              cart.length === 0
            }
          >
            {submitting ? t("Placing Order...") : t("Place Order")}
          </button>
        )}
      </form>

      {form.payment_method === "PayPal" && (
        <div style={{ marginTop: 20 }}>
          <h3>{t("Pay with PayPal / Card")}</h3>

          {paypalError && <p role="alert">{paypalError}</p>}

          {!paypalReady && !paypalError && <p>{t("Loading PayPal...")}</p>}

          <div id="paypal-button-container"></div>
        </div>
      )}
    </div>
  );
}
