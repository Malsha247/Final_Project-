import API_BASE_URL from "../config/api";
import React, { useState } from "react";
import "../Styles/Contact.css";
import { useNavigate } from "react-router-dom";

export default function Contact() {
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const LEFT_DECOR_IMAGE = "/mnt/data/551b4166-afcd-4d14-ac30-646c4f336af5.png";

  const isLoggedIn = Boolean(user && user.id);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      alert("Please login to send a message.");
      return;
    }

    setLoading(true);

    const payload = {
      user_id: user.id,
      user_name: user.first_name || user.firstName || "",
      user_email: user.email,
      subject: form.subject,
      message: form.message,
    };

    try {
      const res = await fetch(
        `${API_BASE_URL}/feedback/sendFeedback.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      const text = await res.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { success: false, message: "Invalid server response" };
        }
      } else {
        data = { success: false, message: "Empty response from server" };
      }

      if (res.ok && data && data.success) {
        alert("Message sent!");
        setForm({ subject: "", message: "" });
        navigate("/my-messages");
      } else {
        const msg =
          (data && data.message) || `Request failed (status ${res.status})`;
        alert("Failed: " + msg);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Could not connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-wrapper">
      <div
        className="contact-left"
        style={{
          backgroundImage: `linear-gradient(rgba(27,94,32,0.03), rgba(46,125,50,0.03)), url(${LEFT_DECOR_IMAGE})`,
        }}
      >
        <h2>Get in touch</h2>
        <p>
          Have questions about our coconut products or need assistance? We're
          here to help! Fill out the form and we'll get back to you as soon as
          possible.
        </p>

        <div className="contact-info">
          <div className="info-item">
            <span></span>
            <div>
              <p>+94 77 0326787</p>
              <small>Monday to Sunday, 8:00 AM to 6:00 PM</small>
            </div>
          </div>

          <div className="info-item">
            <span></span>
            <div>
              <p>wasanthaeco2001@gmail.com</p>
              <small>We'll respond as soon as possible</small>
            </div>
          </div>

          <div className="info-item">
            <span></span>
            <div>
              <p>Court Road</p>
              <small>Monaragala, Sri Lanka</small>
            </div>
          </div>
        </div>
      </div>

      <div className="contact-right">
        <h2>Send us a message</h2>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col">
              <label>Full name</label>
              <input
                readOnly
                value={
                  isLoggedIn ? user.first_name || user.firstName || "" : "Guest"
                }
              />
            </div>

            <div className="col">
              <label>Email</label>
              <input
                readOnly
                value={isLoggedIn ? user.email || "" : "guest@example.com"}
              />
            </div>
          </div>

          <label>Subject</label>
          <input
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            required
            placeholder="Brief subject"
          />

          <label>Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows="6"
            required
            placeholder="Write your message here..."
          />

          {!isLoggedIn ? (
            <>
              <div className="login-hint"></div>
              <button
                type="button"
                className="btn-login"
                onClick={() => navigate("/login")}
              >
                Log in to Send
              </button>
            </>
          ) : (
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
