import React from "react";
import "../Styles/About.css";
import heroImg from "../assests/main.jpg";

export default function AboutUs() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <img src={heroImg} alt="Coconut Farm" className="hero-image" />

        <div className="hero-content">
          <h1>About Wasantha Eco Husk Solutions</h1>
          <p>
            Sustainable coconut husk products made with passion, care, and a
            vision for a greener Sri Lanka.
          </p>
        </div>
      </section>

      <section className="mission-vision-section">
        <div className="mv-container">
          <div className="mv-card">
            <h2>Our Mission</h2>
            <p>
              To transform natural coconut by-products into high-quality,
              eco-friendly solutions while supporting local farmers and
              promoting sustainable living.
            </p>
          </div>

          <div className="mv-card">
            <h2>Our Vision</h2>
            <p>
              To become Sri Lanka’s leading trusted provider of coconut husk
              products, inspiring a future where agriculture and sustainability
              grow hand-in-hand.
            </p>
          </div>
        </div>
      </section>

      <section className="what-we-do">
        <h2>What We Do</h2>
        <div className="wwd-grid">
          <div className="wwd-card">
            <h3>Coconut Husk Products</h3>
            <p>High-quality husk chips, coco peat blocks & natural fibers.</p>
          </div>

          <div className="wwd-card">
            <h3>Coconut Plants</h3>
            <p>Trusted supplier of healthy & fast-growing coconut plants.</p>
          </div>

          <div className="wwd-card">
            <h3>Farmer Partnerships</h3>
            <p>
              We empower farmers through fair pricing & sustainable training.
            </p>
          </div>
        </div>
      </section>

      <section className="team-section">
        <h2>Meet Our Team</h2>
        <p className="team-subtitle">
          The passionate people behind Wasantha Eco Husk Solutions.
        </p>

        <div className="team-grid">
          <div className="team-card">
            <h3>Wasantha</h3>
            <p className="team-role">Founder & Director</p>
          </div>

          <div className="team-card">
            <h3>Malsha</h3>
            <p className="team-role">Technical Support</p>
          </div>

          <div className="team-card">
            <h3>Manel</h3>
            <p className="team-role">Financial Management</p>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <h2>Building a cleaner future together</h2>
        <p>
          Support sustainable farming by choosing eco-friendly coconut-based
          products.
        </p>
        <a href="/products" className="cta-btn">
          Explore Products
        </a>
      </section>
    </div>
  );
}
