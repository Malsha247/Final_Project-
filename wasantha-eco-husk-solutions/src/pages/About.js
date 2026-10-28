import React from "react";
import { Link } from "react-router-dom";
import { usePreferences } from "../contexts/PreferencesContext";
import "../Styles/About.css";
import heroImg from "../assests/main.jpg";

export default function AboutUs() {
  const { t } = usePreferences();
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="hero-overlay" />
        <img src={heroImg} alt={t("Coconut Farm")} className="hero-image" />

        <div className="hero-content">
          <p className="about-eyebrow">{t("Rooted in Sri Lanka")}</p>
          <h1>{t("About Wasantha Eco Husk Solutions")}</h1>
          <p>
            {t("Sustainable coconut husk products made with passion, care, and a vision for a greener Sri Lanka.")}
          </p>
        </div>
      </section>

      <section className="mission-vision-section">
        <div className="mv-container">
          <article className="mv-card">
            <span className="about-card-label">{t("Our purpose")}</span>
            <h2>{t("Our Mission")}</h2>
            <p>
              {t("To transform natural coconut by-products into high-quality, eco-friendly solutions while supporting local farmers and promoting sustainable living.")}
            </p>
          </article>

          <article className="mv-card">
            <span className="about-card-label">{t("Our future")}</span>
            <h2>{t("Our Vision")}</h2>
            <p>
              {t("To become Sri Lanka’s leading trusted provider of coconut husk products, inspiring a future where agriculture and sustainability grow hand-in-hand.")}
            </p>
          </article>
        </div>
      </section>

      <section className="what-we-do">
        <h2>{t("What We Do")}</h2>
        <div className="wwd-grid">
          <article className="wwd-card">
            <h3>{t("Coconut Husk Products")}</h3>
            <p>{t("High-quality husk chips, coco peat blocks & natural fibers.")}</p>
          </article>

          <article className="wwd-card">
            <h3>{t("Coconut Plants")}</h3>
            <p>{t("Trusted supplier of healthy & fast-growing coconut plants.")}</p>
          </article>

          <article className="wwd-card">
            <h3>{t("Farmer Partnerships")}</h3>
            <p>
              {t("We empower farmers through fair pricing & sustainable training.")}
            </p>
          </article>
        </div>
      </section>

      <section className="team-section">
        <h2>{t("Meet Our Team")}</h2>
        <p className="team-subtitle">
          {t("The passionate people behind Wasantha Eco Husk Solutions.")}
        </p>

        <div className="team-grid">
          <article className="team-card">
            <h3>Wasantha</h3>
            <p className="team-role">{t("Founder & Director")}</p>
          </article>

          <article className="team-card">
            <h3>Malsha</h3>
            <p className="team-role">{t("Technical Support")}</p>
          </article>

          <article className="team-card">
            <h3>Manel</h3>
            <p className="team-role">{t("Financial Management")}</p>
          </article>
        </div>
      </section>

      <section className="about-cta">
        <h2>{t("Building a cleaner future together")}</h2>
        <p>
          {t("Support sustainable farming by choosing eco-friendly coconut-based products.")}
        </p>
        <Link to="/products" className="cta-btn">
          {t("Explore Products")}
        </Link>
      </section>
    </main>
  );
}
