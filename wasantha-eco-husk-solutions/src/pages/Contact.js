import API_BASE_URL from "../config/api";
import React, { useState } from "react";
import "../Styles/Contact.css";
import { useNavigate } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import contactImage from "../assests/main.jpg";

export default function Contact() {
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Invalid session user:", error);
  }

  const [form, setForm] = useState({
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

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
    <main className="contact-page">
      <header className="contact-intro">
        <p className="contact-eyebrow">We are happy to help</p>
        <h1>Contact us</h1>
        <p>Questions about our products or your order? Send us a message.</p>
      </header>

      <div className="contact-wrapper">
        <section
          className="contact-left"
          style={{ "--contact-image": `url(${contactImage})` }}
          aria-labelledby="contact-details-title"
        >
          <div className="contact-copy">
            <p className="contact-card-eyebrow">Wasantha Eco Husk Solutions</p>
            <h2 id="contact-details-title">Get in touch</h2>
            <p>
              Have questions about our coconut products or need assistance?
              We’re here to help and will get back to you as soon as possible.
            </p>
          </div>

          <div className="contact-info">
            <a className="info-item" href="tel:+94770326787">
              <span className="info-icon"><Phone size={19} aria-hidden="true" /></span>
              <span className="info-copy">
                <strong>+94 77 0326787</strong>
                <small>Daily, 8:00 AM to 6:00 PM</small>
              </span>
            </a>

            <a className="info-item" href="mailto:wasanthaeco2001@gmail.com">
              <span className="info-icon"><Mail size={19} aria-hidden="true" /></span>
              <span className="info-copy">
                <strong>wasanthaeco2001@gmail.com</strong>
                <small>We’ll respond as soon as possible</small>
              </span>
            </a>

            <div className="info-item">
              <span className="info-icon"><MapPin size={19} aria-hidden="true" /></span>
              <span className="info-copy">
                <strong>Court Road</strong>
                <small>Monaragala, Sri Lanka</small>
              </span>
            </div>
          </div>
        </section>

        <section className="contact-right" aria-labelledby="contact-form-title">
          <div className="contact-form-heading">
            <p className="contact-card-eyebrow">Send us a message</p>
            <h2 id="contact-form-title">How can we help?</h2>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="row">
              <div className="col">
                <label htmlFor="contact-name">Full name</label>
                <input
                  id="contact-name"
                  readOnly
                  value={
                    isLoggedIn ? user.first_name || user.firstName || "" : "Guest"
                  }
                />
              </div>

              <div className="col">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  readOnly
                  value={isLoggedIn ? user.email || "" : "guest@example.com"}
                />
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                placeholder="Brief subject"
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows="6"
                required
                placeholder="Write your message here..."
              />
            </div>

            {!isLoggedIn ? (
              <>
                <p className="login-hint">
                  Please log in to send a message.
                </p>
                <button
                  type="button"
                  className="btn-login"
                  onClick={() => navigate("/login")}
                >
                  Log in to send
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send message"}
              </button>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
