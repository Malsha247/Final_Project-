// src/components/Navbar.js
import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import "../Styles/Navbar.css";
import logo from "../assests/icon.png";
import { PreferenceControls, usePreferences } from "../contexts/PreferencesContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const { language, t } = usePreferences();

  /* ================= LOAD USER FROM SESSION ================= */
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || user.first_name || user.firstName || null);
      } catch (err) {
        console.error("Invalid session user:", err);
        sessionStorage.clear();
      }
    }

    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    sessionStorage.clear();
    setUserName(null);
    setShowProfileMenu(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* ===== LOGO ===== */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src={logo} alt="Wasantha Eco Husk Logo" className="logo-img" />
            <div className="logo-text">
              <h1>Wasantha Eco Husk</h1>
              <p>Solutions</p>
            </div>
          </Link>
        </div>

        {/* ===== NAV LINKS ===== */}
        <ul
          id="primary-navigation"
          className={`nav-links ${isMenuOpen ? "open" : ""}`}
        >
          {[
            { name: t("Home"), path: "/" },
            { name: t("Products"), path: "/products" },
            { name: t("Plants"), path: "/plants" },
            { name: t("Sell"), path: "/sell" },
            { name: t("About"), path: "/about-us" },
            { name: t("Contact"), path: "/contact" },
          ].map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => (isActive ? "active" : undefined)}
              >
                {link.name}
              </NavLink>
            </li>
          ))}

          {/* ===== ORDERS LINK (ONLY WHEN LOGGED IN) ===== */}
          {userName && (
            <li>
              <NavLink
                to="/my-orders"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => (isActive ? "active" : undefined)}
              >
                {t("Orders")}
              </NavLink>
            </li>
          )}

          <li className="mobile-only-link">
            {userName ? (
              <Link
                to="/"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
              >
                {t("Log out")}
              </Link>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                {t("Log in")}
              </Link>
            )}
          </li>
        </ul>

        {/* ===== RIGHT ICONS ===== */}
        <div className="nav-icons">
          <PreferenceControls />
          {/* ===== USER PROFILE ===== */}
          {userName ? (
            <div className="profile-dropdown" ref={profileRef}>
              <button
                className="profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <User size={18} />
                <span className="user-greeting">{language === "si" ? "ආයුබෝවන්" : "Hi"}, {userName}</span>
                <ChevronDown size={14} />
              </button>

              {showProfileMenu && (
                <div className="profile-menu">
                  <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                    {t("My Account")}
                  </Link>

                  <Link
                    to="/my-orders"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    {t("My Orders")}
                  </Link>

                  <Link
                    to="/MyHuskSales"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    {t("My Husk Sales")}
                  </Link>

                 

                  <button className="logout-menu-btn" onClick={handleLogout}>
                    <LogOut size={14} /> {t("Logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="icon-btn">
              <User size={20} />
            </Link>
          )}

          {/* ===== CART ===== */}
          <Link to="/cart" className="icon-btn">
            <ShoppingCart size={20} />
          </Link>

          {/* ===== MOBILE TOGGLE ===== */}
          <button
            type="button"
            className="menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
            aria-label={t(isMenuOpen ? "Close navigation menu" : "Open navigation menu")}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
