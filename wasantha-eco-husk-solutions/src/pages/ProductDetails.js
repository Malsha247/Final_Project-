import API_BASE_URL, { assetUrl } from "../config/api";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePreferences } from "../contexts/PreferencesContext";
import "../Styles/ProductDetails.css";
import productPlaceholder from "../assests/main.jpg";

export default function ProductDetails() {
  const { t } = usePreferences();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState("");

  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem("user") || "null");
  } catch (sessionError) {
    console.error("Invalid session user:", sessionError);
  }

  useEffect(() => {
    if (!id) {
      setError(t("Invalid or missing product ID."));
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/products/getProductById.php?id=${encodeURIComponent(id)}`
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || t("Product details could not be loaded."));
        }

        setProduct(data.product);
      } catch (fetchError) {
        console.error("Failed to fetch product:", fetchError);
        setError(fetchError.message || t("Failed to fetch product."));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, t]);

  const stock = Number(product?.stock) || 0;

  const handleAddToCart = async () => {
    if (!user?.id) {
      alert(t("Please log in to add to cart."));
      navigate("/login");
      return;
    }

    if (!product || stock <= 0 || qty > stock) {
      alert(stock <= 0 ? t("This product is out of stock.") : t("Please select a valid quantity."));
      return;
    }

    setAddingToCart(true);

    try {
      const res = await fetch(`${API_BASE_URL}/cart/addToCart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          product_id: id,
          quantity: qty,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || t("Could not add the product to your cart."));
      }

      alert(t("Product added to cart."));
      navigate("/cart");
    } catch (addError) {
      console.error("Add to cart failed:", addError);
      alert(addError.message || t("Could not add the product to your cart."));
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <p className="product-details-status" role="status">{t("Loading product details...")}</p>;
  }
  if (error) {
    return <p className="product-details-status error" role="alert">{error}</p>;
  }
  if (!product) {
    return <p className="product-details-status">{t("Product not found.")}</p>;
  }

  return (
    <main className="product-details-page">
      <section className="product-details" aria-labelledby="product-title">
        <div className="pd-image-wrap">
          <img
            src={product.image_url ? assetUrl(product.image_url) : productPlaceholder}
            alt={product.name}
            className="pd-image"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = productPlaceholder;
            }}
          />
        </div>
        <div className="details-info">
          <p className="pd-eyebrow">{t("Wasantha Eco Husk product")}</p>
          <h2 id="product-title">{product.name}</h2>
          {product.description && (
            <p className="pd-description">{product.description}</p>
          )}
          <p className="pd-price">Rs. {Number(product.price).toFixed(2)}</p>
          <p className={`pd-stock ${stock <= 0 ? "out-of-stock" : ""}`}>
            {stock > 0 ? `${stock} ${t("available")}` : t("Out of stock")}
          </p>
          <div className="quantity-section">
            <label htmlFor="product-quantity">{t("Quantity")}</label>
            <input
              id="product-quantity"
              type="number"
              min="1"
              max={stock || 1}
              value={qty}
              onChange={(event) => {
                const nextQuantity = Number.parseInt(event.target.value, 10);
                setQty(Number.isNaN(nextQuantity) ? 1 : Math.min(stock || 1, Math.max(1, nextQuantity)));
              }}
            />
          </div>
          <button
            type="button"
            className="pd-add-button"
            onClick={handleAddToCart}
            disabled={stock <= 0 || addingToCart}
          >
            {addingToCart ? t("Adding to cart...") : stock > 0 ? t("Add to cart") : t("Out of stock")}
          </button>
        </div>
      </section>
    </main>
  );
}
