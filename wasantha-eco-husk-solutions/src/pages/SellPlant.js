// src/pages/SellPlant.js
import React, { useState, useRef, useEffect } from "react";
import "../Styles/SellForm.css";
import { useNavigate } from "react-router-dom";

export default function SellPlant() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  // get logged-in user from session
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    owner_name: "",
    address: "",
    phone: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // require login
  useEffect(() => {
    if (!user || !user.id) {
      alert("Please log in first to sell your coconut plants.");
      navigate("/login");
    }
  }, []);

  const handleFileChange = (e) => {
    setImageFile(e.target.files && e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert("Please log in.");
      return;
    }

    // basic validation
    if (!form.owner_name.trim() || !form.address.trim() || !form.phone.trim()) {
      alert("Please fill owner name, address and phone.");
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("user_id", user.id);
      fd.append("owner_name", form.owner_name);
      fd.append("address", form.address);
      fd.append("phone", form.phone);
      fd.append("description", form.description || "");
      if (imageFile) fd.append("image", imageFile);

      console.log("Sending formdata to addPlant.php", {
        user_id: user.id,
        owner_name: form.owner_name,
        address: form.address,
        phone: form.phone,
        hasImage: !!imageFile,
      });

      const res = await fetch(
        "http://localhost:8081/api/plants/addPlant.php",
        {
          method: "POST",
          body: fd, // DO NOT set Content-Type header — browser will set multipart/form-data
        }
      );

      // network/server status
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Server returned ${res.status} ${res.statusText}: ${text}`
        );
      }

      const data = await res.json();
      console.log("addPlant response:", data);

      if (!data.success) {
        throw new Error(data.message || "Server returned unsuccessful result");
      }

      alert(data.message || "Listing created successfully");

      // clear form + file input
      setForm({ owner_name: "", address: "", phone: "", description: "" });
      setImageFile(null);
      if (fileRef.current) fileRef.current.value = "";

      // go to user's plant listings (adjust route if needed)
      navigate("/my-plants");
    } catch (err) {
      console.error("Submit plant failed:", err);
      alert("Submit failed: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sell-form-page">
      <h2>Sell Your Coconut Plants</h2>

      <form
        onSubmit={handleSubmit}
        className="sell-form"
        encType="multipart/form-data"
      >
        <label>Owner name</label>
        <input
          type="text"
          value={form.owner_name}
          onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
          required
        />

        <label>Address</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          required
        />

        <label>Phone</label>
        <input
          type="text"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />

        <label>Type of Plant</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label>Upload Image (optional)</label>
        <div className="image-inputs">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
