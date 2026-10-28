import API_BASE_URL, { assetUrl } from "../../config/api";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePreferences } from "../../contexts/PreferencesContext";
import "../../Styles/AdminStyle/ProductManage.css";

const API_BASE =
  `${API_BASE_URL}/products`;

export default function EditProductPage() {
  const { t } = usePreferences();
  const { id } = useParams();
  const [form, setForm] = useState({
    id: id,
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/getProductById.php?id=${id}`);
        const j = await res.json();
        if (j.success)
          setForm({
            id: j.product.id,
            name: j.product.name || "",
            description: j.product.description || "",
            price: j.product.price || "",
            stock: j.product.stock || "",
            category: j.product.category || "",
            image_url: j.product.image_url || "",
          });
        else {
          alert(t("Product not found"));
          navigate("/admin/products");
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [id, navigate, t]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let image_url = form.image_url;

      if (imageFile) {
        
        const fd = new FormData();
        fd.append("image", imageFile);
        const r = await fetch(`${API_BASE}/uploadImage.php`, {
          method: "POST",
          body: fd,
        });
        const jr = await r.json();
        if (!jr.success) {
          alert(jr.message || t("Image upload failed"));
          setLoading(false);
          return;
        }
        image_url = jr.image_url;
      }

      
      const res = await fetch(`${API_BASE}/updateProduct.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          category: form.category,
          image_url: image_url,
        }),
      });
      const j = await res.json();
      if (j.success) {
        alert(t("Product updated"));
        navigate("/admin/products");
      } else alert(j.message || t("Update failed"));
    } catch (e) {
      console.error(e);
      alert(t("Error updating product"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-container">
      <div className="pm-header">
        <h2>{t("Edit Product")}</h2>
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
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
          />
        </label>

        <div>
          {t("Current image:")}
          {form.image_url ? (
            <img
              src={assetUrl(form.image_url)}
              alt={t("Current image")}
              className="pm-current"
            />
          ) : (
            <div className="pm-noimage small">{t("No image")}</div>
          )}
        </div>

        <label>
          {t("Replace image (optional)")}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </label>

        <div style={{ marginTop: 12 }}>
          <button className="pm-btn" type="submit" disabled={loading}>
            {loading ? t("Saving...") : t("Save Changes")}
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
