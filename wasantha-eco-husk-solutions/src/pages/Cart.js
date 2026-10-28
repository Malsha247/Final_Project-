import API_BASE_URL, { assetUrl } from "../config/api";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import "../Styles/Cart.css";
import productPlaceholder from "../assests/main.jpg";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem("user") || "null");
  } catch (sessionError) {
    console.error("Invalid session user:", sessionError);
  }

  const fetchCart = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setError("");
      const res = await fetch(
        `${API_BASE_URL}/cart/getCart.php?user_id=${encodeURIComponent(user.id)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not load your cart.");
      }

      setCart(Array.isArray(data.items) ? data.items : []);
    } catch (fetchError) {
      console.error("Error fetching cart:", fetchError);
      setError(fetchError.message || "Could not load your cart.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      alert("Please log in to view your cart.");
      navigate("/login");
      return;
    }
    fetchCart();
  }, [navigate, user?.id, fetchCart]);

  const handleUpdateQty = async (cartId, newQty, productId) => {
    if (newQty < 1) return;

    try {
      const res = await fetch(`${API_BASE_URL}/cart/updateCart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cartId,
          product_id: productId,
          quantity: newQty,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not update cart quantity.");
      }

      setCart((previous) =>
        previous.map((item) =>
          Number(item.id) === Number(cartId)
            ? { ...item, quantity: newQty }
            : item
        )
      );
      setError("");
    } catch (updateError) {
      console.error("Update cart quantity failed:", updateError);
      setError(updateError.message || "Could not update cart quantity.");
    }
  };

  const handleRemove = async (cartId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/cart/removeFromCart.php?id=${encodeURIComponent(cartId)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not remove the item.");
      }

      setCart((previous) =>
        previous.filter((item) => Number(item.id) !== Number(cartId))
      );
      setError("");
    } catch (removeError) {
      console.error("Remove cart item failed:", removeError);
      setError(removeError.message || "Could not remove the item.");
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  if (loading) {
    return <p className="cart-loading" role="status">Loading your cart...</p>;
  }

  return (
    <main className="cart-page">
      <header className="cart-header">
        <p className="cart-eyebrow">Your selections</p>
        <h2>Your shopping cart</h2>
        <p className="cart-subtitle">
          {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
        </p>
      </header>

      {error && <p className="cart-error" role="alert">{error}</p>}

      {cart.length === 0 ? (
        <section className="empty-cart">
          <h3>Your cart is empty</h3>
          <p>Explore our products and add something you love.</p>
          <Link className="cart-empty-action" to="/products">
            Browse products
          </Link>
        </section>
      ) : (
        <>
          <div className="cart-table-wrap">
            <table className="cart-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Price</th>
                  <th scope="col">Subtotal</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td className="cart-product" data-label="Product">
                      <img
                        src={item.image_url ? assetUrl(item.image_url) : productPlaceholder}
                        alt={item.name}
                        className="cart-thumb"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = productPlaceholder;
                        }}
                      />
                      <span>{item.name}</span>
                    </td>
                    <td data-label="Quantity">
                      <div className="qty-wrapper">
                        <button
                          type="button"
                          className="qty-btn"
                          aria-label={`Decrease ${item.name} quantity`}
                          disabled={Number(item.quantity) <= 1}
                          onClick={() =>
                            handleUpdateQty(
                              item.id,
                              Number(item.quantity) - 1,
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
                          aria-label={`${item.name} quantity`}
                          className="qty-input"
                        />
                        <button
                          type="button"
                          className="qty-btn"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() =>
                            handleUpdateQty(
                              item.id,
                              Number(item.quantity) + 1,
                              item.product_id
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td data-label="Price">
                      Rs. {Number(item.price).toFixed(2)}
                    </td>
                    <td className="cart-line-total" data-label="Subtotal">
                      Rs. {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </td>
                    <td className="cart-remove-cell" data-label="Remove item">
                      <button
                        type="button"
                        className="remove-btn"
                        aria-label={`Remove ${item.name} from cart`}
                        onClick={() => handleRemove(item.id)}
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="cart-summary" aria-label="Order summary">
            <h3>Cart total <span>Rs. {total.toFixed(2)}</span></h3>
            <div className="cart-actions">
              <button
                type="button"
                className="btn-continue"
                onClick={() => navigate("/products")}
              >
                Continue shopping
              </button>
              <button
                type="button"
                className="btn-checkout"
                onClick={() => navigate("/checkout")}
              >
                Proceed to checkout
              </button>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
