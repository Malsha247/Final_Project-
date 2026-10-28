import API_BASE_URL from "../config/api";
// src/pages/EditProfile.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../contexts/PreferencesContext";
import "../Styles/Profile.css";

export default function EditProfile() {
  const { t } = usePreferences();
  const navigate = useNavigate();

  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false); 

  /* ================= LOAD USER DATA ================= */
  useEffect(() => {
    if (!user || !user.id) {
      alert(t("Please log in to edit your profile."));
      navigate("/login");
      return;
    }

    // Load once only
    if (loaded) return;

    fetch(
      `${API_BASE_URL}/user/getUser.php?id=${user.id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setForm({
            first_name: data.user.first_name || "",
            last_name: data.user.last_name || "",
            email: data.user.email || "",
            password: "",
          });
        } else {
          setForm({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            password: "",
          });
        }
        setLoaded(true);
      })
      .catch(() => {
        setForm({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          password: "",
        });
        setLoaded(true);
      });
  }, [user, navigate, loaded, t]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert(t("User not logged in!"));
      return;
    }

    setLoading(true);

    const payload = {
      id: user.id,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      password: form.password || null,
    };

    try {
      const res = await fetch(
        `${API_BASE_URL}/user/updateUser.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(t("Profile updated successfully!"));

        // Update session storage
        const updatedUser = {
          ...user,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
        };

        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        navigate("/profile");
      } else {
        alert(data.message || t("Update failed"));
      }
    } catch (err) {
      console.error("Update error:", err);
      alert(t("Server error. Please try again later."));
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="profile-page">
      <h2>{t("Edit Profile")}</h2>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>{t("First Name")}</label>
        <input
          type="text"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          required
        />

        <label>{t("Last Name")}</label>
        <input
          type="text"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />

        <label>{t("Email")}</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <label>{t("Change Password (optional)")}</label>
        <input
          type="password"
          placeholder={t("Enter new password if you want to change it")}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button type="submit" disabled={loading}>
          {loading ? t("Saving...") : t("Save Changes")}
        </button>
      </form>

      <button className="back-btn" onClick={() => navigate("/profile")}>
        {t("Back to Profile")}
      </button>
    </div>
  );
}
