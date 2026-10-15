import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();

  const user = useMemo(
    () => JSON.parse(sessionStorage.getItem("user") || "null"),
    [],
  );

  const API_BASE = "http://localhost:8081/api";

  /* PAYPAL SANDBOX CLIENT ID */
  const PAYPAL_CLIENT_ID =
    "AT4qKjbFY7qUW-16QiinkmuEHKDf5NthAHWCnfi_7LPaWU50S8o_p0oiHPz8LahGRpGB7eGnKDdAQk6v";

  const paypalRenderedRef = useRef(false);

  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const [form, setForm] = useState({
    customer_name: user?.first_name || "",
    customer_email: user?.email || "",
    customer_phone: "",
    shipping_address: "",
    payment_method: "Cash on Delivery",
  });

  /* ================= RESET PAYPAL RENDER ================= */
  useEffect(() => {
    paypalRenderedRef.current = false;
  }, [form.payment_method]);

  /* ================= LOAD CART ================= */
  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    fetch(`${API_BASE}/cart/getCart.php?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCart(data.items || []);
          setTotal(
            (data.items || []).reduce(
              (sum, i) => sum + Number(i.price) * Number(i.quantity),
              0,
            ),
          );
        }
      });
  }, [user, navigate]);


  useEffect(() => {
    if (window.paypal) return;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* ================= PAYPAL ================= */
  const USD_RATE = 300;
  const totalUSD = (total / USD_RATE).toFixed(2);

  useEffect(() => {
    if (form.payment_method !== "PayPal") return;
    if (!window.paypal) return;
    if (paypalRenderedRef.current) return;

    const container = document.getElementById("paypal-button-container");
    if (!container) return;

    container.innerHTML = "";

    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: totalUSD },
              },
            ],
          });
        },

        onApprove: async (data, actions) => {
          await actions.order.capture();

          const res = await fetch(`${API_BASE}/orders/checkout.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
              ...form,
              payment_method: "PayPal",
              total_price: total,
              paypal_order_id: data.orderID,
            }),
          });

          const result = await res.json();

          if (result.success) {
            alert("Payment successful!");
            navigate("/my-orders");
          } else {
            alert(" Payment done, but order save failed");
          }
        },

        onError: (err) => {
          console.error("PayPal/Card Error:", err);
          alert(
            "Sandbox card used.\nThis is expected for testing and evaluation.",
          );
        },
      })
      .render("#paypal-button-container");

    paypalRenderedRef.current = true;
  }, [form.payment_method, totalUSD, user]);

  /* ================= CASH ON DELIVERY ================= */
  const placeCODOrder = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE}/orders/checkout.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        ...form,
        total_price: total,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Order placed successfully");
      navigate("/my-orders");
    } else {
      alert(data.message || "Order failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <form onSubmit={placeCODOrder} className="checkout-form">
        <input
          placeholder="Full Name"
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          required
        />

        <input
          placeholder="Email"
          value={form.customer_email}
          onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
          required
        />

        <input
          placeholder="Phone Number"
          value={form.customer_phone}
          onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
          required
        />

        <textarea
          placeholder="Shipping Address"
          value={form.shipping_address}
          onChange={(e) =>
            setForm({ ...form, shipping_address: e.target.value })
          }
          required
        />

        <select
          value={form.payment_method}
          onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
        >
          <option>Cash on Delivery</option>
          <option>PayPal</option>
        </select>

        {/* ================= ADDED: ITEM SUMMARY ================= */}
        <div className="order-summary">
          <h3>Items</h3>

          {cart.length === 0 ? (
            <p>No items in cart</p>
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
                  {item.name} × {item.quantity}
                </span>
                <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))
          )}

          <hr />
          <h3>Total: Rs. {total.toFixed(2)}</h3>

          {form.payment_method === "PayPal" && (
            <p>PayPal Amount: ${totalUSD}</p>
          )}
        </div>
        {/* ================= END ADDED SECTION ================= */}

        {form.payment_method === "Cash on Delivery" && (
          <button>Place Order</button>
        )}
      </form>

      {form.payment_method === "PayPal" && (
        <div style={{ marginTop: 20 }}>
          <h3>Pay with PayPal / Card</h3>
          <div id="paypal-button-container"></div>
        </div>
      )}
    </div>
  );
}
