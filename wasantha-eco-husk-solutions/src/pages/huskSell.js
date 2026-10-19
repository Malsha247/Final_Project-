import API_BASE_URL from "../config/api";
import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "../Styles/SellForm.css";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function SellHusk() {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
  });

  const [images, setImages] = useState([null, null]);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // -------------------------------
  // INIT FREE MAP (Leaflet + OSM)
  // -------------------------------
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const defaultLoc = [6.9271, 79.8612]; 

    mapInstance.current = L.map(mapRef.current).setView(defaultLoc, 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© OpenStreetMap contributors",
    }).addTo(mapInstance.current);

    const marker = L.marker(defaultLoc, { draggable: true }).addTo(
      mapInstance.current
    );

    setLocation({ lat: defaultLoc[0], lng: defaultLoc[1] });

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      setLocation({ lat: pos.lat, lng: pos.lng });
    });
  }, []);

  // -------------------------------
  // IMAGE HANDLING
  // -------------------------------
  const handleImageChange = (e, index) => {
    setImages((prev) => {
      const copy = [...prev];
      copy[index] = e.target.files[0];
      return copy;
    });
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      `${API_BASE_URL}/seller/uploadImage.php`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    return data.success ? data.url : "";
  };

  // -------------------------------
  // SUBMIT FORM
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const uploaded = [];
    for (const img of images) {
      if (img) uploaded.push(await uploadImage(img));
    }

    const payload = {
      user_id: user.id,
      ...form,
      image_1: uploaded[0] || "",
      image_2: uploaded[1] || "",
      latitude: location.lat,
      longitude: location.lng,
    };

    try {
      const res = await fetch(
        `${API_BASE_URL}/seller/addHusk.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("" + data.message);
        setForm({ name: "", address: "", phone: "", description: "" });
        setImages([null, null]);
      } else {
        alert(" " + data.message);
      }
    } catch (err) {
      alert(" Something went wrong");
    }
  };

  return (
    <div className="sell-form-page">
      <h2>Sell Your Coconut Husk </h2>

      <form onSubmit={handleSubmit} className="sell-form">
        <label>Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label>Address</label>
        <input
          required
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <label>Phone</label>
        <input
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label>Upload Images</label>
        <input type="file" onChange={(e) => handleImageChange(e, 0)} />
        <input type="file" onChange={(e) => handleImageChange(e, 1)} />

        <label>Mark Your Location</label>
        <div ref={mapRef} className="map-box" style={{ height: "300px" }} />

        <button type="submit">Submit for Review</button>
      </form>
    </div>
  );
}
