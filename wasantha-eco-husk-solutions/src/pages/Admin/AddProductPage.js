import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/AdminStyle/ProductManage.css";

const API_BASE =
  "http://localhost:8081/api/products";

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("price", form.price);
        fd.append("stock", form.stock);
        fd.append("category", form.category);

        const res = await fetch(`${API_BASE}/addProduct.php`, {
          method: "POST",
          body: fd,
        });
        const j = await res.json();
        if (j.success) {
          alert("Product added");
          navigate("/admin/products");
        } else alert(j.message || "Add failed");
      } else {
        const res = await fetch(`${API_BASE}/addProduct.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            price: parseFloat(form.price || 0),
            stock: parseInt(form.stock || 0),
          }),
        });
        const j = await res.json();
        if (j.success) {
          alert("Product added");
          navigate("/admin/products");
        } else alert(j.message || "Add failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-container">
      <div className="pm-header">
        <h2>Add Product</h2>
      </div>

      <form className="pm-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <label>
          Price
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Stock
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
          />
        </label>

     
        <label>
          Category
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Category --</option>
            <option value="chips">Coconut Husk Chips</option>
            <option value="By-products">Chips By-Products</option>
          </select>
        </label>

        <label>
          Image (optional)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </label>

        <div style={{ marginTop: 12 }}>
          <button className="pm-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Product"}
          </button>
          <button
            className="pm-btn"
            type="button"
            onClick={() => navigate("/admin/products")}
            style={{ marginLeft: 8 }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
