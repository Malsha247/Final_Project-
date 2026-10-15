
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Styles/ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    if (!id) {
      setError("Invalid or missing product ID");
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      try {
        const res = await fetch(
          `http://localhost:8081/api/products/getProductById.php?id=${id}`
        );
        const data = await res.json();
        if (data.success) setProduct(data.product);
        else setError(data.message);
      } catch (err) {
        setError("Failed to fetch product.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login to add to cart.");
      navigate("/login");
      return;
    }

    const res = await fetch(
      "http://localhost:8081/api/cart/addToCart.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          product_id: id,
          quantity: qty,
        }),
      }
    );
    const data = await res.json();
    if (data.success) {
      alert(" Added to cart!");
      navigate("/cart");
    } else {
      alert(" " + data.message);
    }
  };

  if (loading) return <p>Loading product details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!product) return <p> Product not found.</p>;

  return (
    <div className="product-details">
      <img
        src={`http://localhost:8081/${product.image_url}`}
        alt={product.name}
        className="pd-image"
      />
      <div className="details-info">
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p className="price">Rs. {parseFloat(product.price).toFixed(2)}</p>
        <div className="quantity-section">
          <label>Quantity:</label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, e.target.value))}
          />
        </div>
        <button onClick={handleAddToCart}>Add to Cart</button>
      </div>
    </div>
  );
}
