import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import "../Styles/Footer.css";
import logo from "../assests/icon.png";
import { usePreferences } from "../contexts/PreferencesContext";

export const Footer = () => {
  const { t } = usePreferences();
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <img
              className="footer-logo-img"
              src={logo}
              alt="Wasantha Eco Husk Logo"
            />
            <span>Wasantha Eco Husk Solutions</span>
          </div>

          <p className="footer-description">
            {t("Leading the way in sustainable coconut husk products and plant trading. Supporting eco-friendly farming and green growth in Sri Lanka.")}
          </p>

          <div className="footer-social">
            <span className="social-icon" role="img" aria-label="Facebook">
              <Facebook size={20} aria-hidden="true" />
            </span>
            <span className="social-icon" role="img" aria-label="Instagram">
              <Instagram size={20} aria-hidden="true" />
            </span>
            <span className="social-icon" role="img" aria-label="Twitter">
              <Twitter size={20} aria-hidden="true" />
            </span>
          </div>
        </div>

        <div className="footer-section">
          <h3>{t("Products")}</h3>
          <ul>
            <li>
              <Link to="/products?category=husk">{t("Coconut Husk Chips")}</Link>
            </li>
            <li>
              <Link to="/products?category=plants">{t("Coconut Plants")}</Link>
            </li>
            <li>
              <Link to="/products?category=organic">
                {t("Organic Fertilizer Mix")}
              </Link>
            </li>
            <li>
              <Link to="/products?category=accessories">
                {t("Gardening Accessories")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>{t("Company")}</h3>
          <ul>
            <li>
              <Link to="/about-us">{t("About Us")}</Link>
            </li>
            <li>
              <Link to="/contact">{t("Contact")}</Link>
            </li>
            <li>
              <Link to="/sell">{t("Sell with Us")}</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>{t("Contact")}</h3>
          <ul className="footer-contact">
            <li>
              <Phone size={16} className="footer-icon" />
              <span>+94 77 0326787</span>
            </li>
            <li>
              <Mail size={16} className="footer-icon" />
              <span>wasanthaeco2001@gmail.com</span>
            </li>
            <li>
              <MapPin size={16} className="footer-icon" />
              <span>{t("Monaragala, Sri Lanka")}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          {new Date().getFullYear()} Wasantha Eco Husk Solutions. {t("All rights reserved.")}
        </p>
      </div>
    </footer>
  );
};
