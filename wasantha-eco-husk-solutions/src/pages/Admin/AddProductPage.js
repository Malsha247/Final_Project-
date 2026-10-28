import API_BASE_URL from "../../config/api";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../../contexts/PreferencesContext";
import "../../Styles/AdminStyle/ProductManage.css";

const API_BASE =
  `${API_BASE_URL}/products`;

export default function AddProductPage() {
  const { t } = usePreferences();
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
          alert(t("Product added"));
          navigate("/admin/products");
        } else alert(j.message || t("Add failed"));
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
          alert(t("Product added"));
          navigate("/admin/products");
        } else alert(j.message || t("Add failed"));
      }
    } catch (err) {
      console.error(err);
      alert(t("Error adding product"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-container">
      <div className="pm-header">
        <h2>{t("Add Product")}</h2>
      </div>

      <form className="pm-form" onSubmit={handleSubmit}>
        <label>
          {t("Name")}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          {t("Description")}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <label>
          {t("Price")}
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
          {t("Stock")}
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
          />
        </label>

     
        <label>
          {t("Category")}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">{t("-- Select Category --")}</option>
            <option value="chips">{t("Coconut Husk Chips")}</option>
            <option value="By-products">{t("Chips By-Products")}</option>
          </select>
        </label>

        <label>
          {t("Image (optional)")}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </label>

        <div style={{ marginTop: 12 }}>
          <button className="pm-btn" type="submit" disabled={loading}>
            {loading ? t("Saving...") : t("Save Product")}
          </button>
          <button
            className="pm-btn"
            type="button"
            onClick={() => navigate("/admin/products")}
            style={{ marginLeft: 8 }}
          >
            {t("Cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
