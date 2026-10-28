import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../contexts/PreferencesContext";
import API_BASE_URL from "../config/api";
import "../Styles/SellForm.css";

export default function SellPlant() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const submittingRef = useRef(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [form, setForm] = useState({
    owner_name: "",
    address: "",
    phone: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submittingRef.current) return;

    if (!user?.id) {
      alert(t("Please log in."));
      navigate("/login");
      return;
    }

    if (
      !form.owner_name.trim() ||
      !form.address.trim() ||
      !form.phone.trim()
    ) {
      alert(t("Please fill owner name, address and phone."));
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("user_id", user.id);
      fd.append("owner_name", form.owner_name.trim());
      fd.append("address", form.address.trim());
      fd.append("phone", form.phone.trim());
      fd.append("description", form.description || "");

      if (imageFile) {
        fd.append("image", imageFile);
      }

      const res = await fetch(`${API_BASE_URL}/plants/addPlant.php`, {
        method: "POST",
        body: fd,
      });

      let data;

      try {
        data = await res.json();
      } catch {
        throw new Error(t("The server returned an invalid response."));
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || t("Could not create the listing."));
      }

      alert(data.message || t("Listing created successfully"));

      setForm({
        owner_name: "",
        address: "",
        phone: "",
        description: "",
      });

      setImageFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      navigate("/my-plants");
    } catch (err) {
      console.error("Submit plant failed:", err);
      alert(t("Submit failed: ") + (err.message || t("Unknown error")));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="sell-form-page">
      <h2>{t("Sell Your Coconut Plants")}</h2>

      <form
        onSubmit={handleSubmit}
        className="sell-form"
        encType="multipart/form-data"
      >
        <label htmlFor="owner_name">{t("Owner name")}</label>
        <input
          id="owner_name"
          name="owner_name"
          type="text"
          value={form.owner_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="address">{t("Address")}</label>
        <input
          id="address"
          name="address"
          type="text"
          value={form.address}
          onChange={handleChange}
          required
        />

        <label htmlFor="phone">{t("Phone")}</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">{t("Type of Plant")}</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <label htmlFor="plant_image">{t("Upload Image (optional)")}</label>
        <div className="image-inputs">
          <input
            id="plant_image"
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? t("Submitting...") : t("Submit")}
        </button>
      </form>
    </div>
  );
}