import API_BASE_URL, { assetUrl } from "../../config/api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/AdminStyle/ProductManage.css";

const API_BASE =
  `${API_BASE_URL}/products`;

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/getAllProducts.php`);
      const data = await res.json();
      if (data.success) setProducts(data.products);
      else setProducts([]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const res = await fetch(`${API_BASE}/deleteProduct.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        alert("Product deleted.");
      } else alert(data.message || "Delete failed");
    } catch (e) {
      console.error(e);
      alert("Delete error");
    }
  };

  return (
    <div className="pm-container">
      <div className="pm-header">
        <h2>Products</h2>
        <div>
          <button
            className="pm-btn"
            onClick={() => navigate("/admin/products/add")}
          >
            + Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="pm-grid">
          {products.map((p) => (
            <div className="pm-card" key={p.id}>
              <div className="pm-image-wrap">
                {p.image_url ? (
                  <img
                    src={assetUrl(p.image_url)}
                    alt={p.name}
                    className="pm-image"
                  />
                ) : (
                  <div className="pm-noimage">No Image</div>
                )}
              </div>

              <div className="pm-body">
                <h3 className="pm-title">{p.name}</h3>
                <p className="pm-cat">{p.category}</p>
                <p className="pm-price">
                  Rs. {parseFloat(p.price || 0).toFixed(2)}
                </p>
                <p className="pm-stock">
                  {parseInt(p.stock || 0) <= 0 ? (
                    <span className="pm-out">Out of Stock</span>
                  ) : (
                    <span>{p.stock} in stock</span>
                  )}
                </p>

                <div className="pm-actions">
                  <button
                    className="pm-btn small"
                    onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="pm-btn small danger"
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
