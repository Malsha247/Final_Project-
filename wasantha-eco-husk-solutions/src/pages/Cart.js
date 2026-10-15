import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  // -------------------------------
  // FETCH CART (useCallback FIX)
  // -------------------------------
  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `http://localhost:8081/api/cart/getCart.php?user.id=${user.id}`
      );
      const data = await res.json();
      if (data.success) setCart(data.items);
      else setCart([]);
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // -------------------------------
  // LOAD CART ON PAGE LOAD
  // -------------------------------
  useEffect(() => {
    if (!user) {
      alert("Please log in to view your cart.");
      navigate("/login");
      return;
    }
    fetchCart();
  }, [navigate, user, fetchCart]);

  // -------------------------------
  // UPDATE QUANTITY
  // -------------------------------
  const handleUpdateQty = async (cartId, newQty, productId) => {
    if (newQty < 1) return;
    try {
      const res = await fetch(
        "http://localhost:8081/api/cart/updateCart.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: cartId,
            product_id: productId,
            quantity: newQty,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setCart((prev) =>
          prev.map((item) =>
            item.id === cartId ? { ...item, quantity: newQty } : item
          )
        );
      } else {
        alert("⚠️ " + data.message);
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // -------------------------------
  // REMOVE ITEM
  // -------------------------------
  const handleRemove = async (id) => {
    try {
      await fetch(
        `http://localhost:8081/api/cart/removeFromCart.php?id=${id}`
      );
      setCart((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Remove failed:", err);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <p>Loading cart...</p>;

  return (
    <div className="cart-page">
      <h2>Your Shopping Cart</h2>

      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td className="cart-product">
                    <img
                      src={`http://localhost:8081/${item.image_url}`}
                      alt={item.name}
                      className="cart-thumb"
                    />
                    <span>{item.name}</span>
                  </td>

                  <td>
                    <div className="qty-wrapper">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          handleUpdateQty(
                            item.id,
                            item.quantity - 1,
                            item.product_id
                          )
                        }
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        readOnly
                        className="qty-input"
                      />
                      <button
                        className="qty-btn"
                        onClick={() =>
                          handleUpdateQty(
                            item.id,
                            item.quantity + 1,
                            item.product_id
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td>Rs. {item.price}</td>
                  <td>Rs. {(item.price * item.quantity).toFixed(2)}</td>

                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(item.id)}
                    >
                      
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/*  SUMMARY + CONTINUE SHOPPING */}
          <div className="cart-summary">
            <h3>
              Total: <span>Rs. {total.toFixed(2)}</span>
            </h3>

            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button
                className="btn-continue"
                onClick={() => navigate("/products")}
              >
                ← Continue Shopping
              </button>

              <button
                className="btn-checkout"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
