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

export const Footer = () => {
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
            Leading the way in sustainable coconut husk products and plant
            trading. Supporting eco-friendly farming and green growth in Sri
            Lanka.
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
          <h3>Products</h3>
          <ul>
            <li>
              <Link to="/products?category=husk">Coconut Husk Chips</Link>
            </li>
            <li>
              <Link to="/products?category=plants">Coconut Plants</Link>
            </li>
            <li>
              <Link to="/products?category=organic">
                Organic Fertilizer Mix
              </Link>
            </li>
            <li>
              <Link to="/products?category=accessories">
                Gardening Accessories
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li>
              <Link to="/about-us">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/sell">Sell with Us</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
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
              <span>Monaragala, Sri Lanka</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          {new Date().getFullYear()} Wasantha Eco Husk Solutions. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};
