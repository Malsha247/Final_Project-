import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Styles/PlantDetails.css";

export default function PlantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // logged-in user
  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    name: user?.first_name || "",
    email: user?.email || "",
    phone: "",
    quantity: 1,
    message: "",
  });

  /* ================= LOAD PLANT ================= */
  useEffect(() => {
    fetch(
      `http://localhost:8081/api/plants/getPlant.php?id=${id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPlant(data.plant);
        else setPlant(null);
      })
      .catch(() => setPlant(null))
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= SUBMIT REQUEST ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to send a request.");
      navigate("/login");
      return;
    }

    if (!form.name || !form.email || !form.phone) {
      alert("Please fill name, email and phone number.");
      return;
    }

    setSending(true);

    try {
      const res = await fetch(
        "http://localhost:8081/api/plants/requestPlant.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listing_id: id,
            name: form.name,
            email: form.email,
            phone: form.phone,
            quantity: form.quantity,
            message: form.message,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Request failed");
      }

      alert("Request sent successfully!");

      
      setForm({
        ...form,
        phone: "",
        quantity: 1,
        message: "",
      });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSending(false);
    }
  };

  
  if (loading) return <p className="center">Loading plant...</p>;
  if (!plant) return <p className="center">Plant not found.</p>;

  return (
    <div className="plant-details-page">
      {/* IMAGE */}
      <div className="plant-hero">
        <img
          src={
            plant.image
              ? `http://localhost:8081/${plant.image}`
              : "/placeholder-plant.png"
          }
          alt={plant.owner_name}
        />
      </div>

      {/* PLANT INFO */}
      <div className="plant-content">
        <h2>{plant.owner_name}</h2>
        <p className="plant-address">{plant.address}</p>
        <p className="plant-desc">{plant.description}</p>
      </div>

      <hr />

      {/* REQUEST FORM */}
      <h3>Request This Plant</h3>

      <form onSubmit={handleSubmit} className="request-form">
        <input
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Your Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />

        <input
          type="number"
          min="1"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: Math.max(1, e.target.value) })
          }
        />

        <textarea
          placeholder="Message (optional)"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />

        <button type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send Request"}
        </button>
      </form>
    </div>
  );
}
