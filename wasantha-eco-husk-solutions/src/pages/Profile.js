
import React from "react";
import { Link } from "react-router-dom";
import { usePreferences } from "../contexts/PreferencesContext";
import "../Styles/Profile.css";

export default function Profile() {
  const { t } = usePreferences();
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  if (!user)
    return (
      <div className="profile-page">
        <p>
          {t("Please")} <Link to="/login">{t("login")}</Link>
        </p>
      </div>
    );

  return (
    <div className="profile-page">
      <h2>{t("My Account")}</h2>
      <div className="profile-card">
        <p>
          <b>{t("Name:")}</b> {user.first_name || user.firstName}
        </p>
        <p>
          <b>{t("Email:")}</b> {user.email}
        </p>
        {user.phone && (
          <p>
            <b>{t("Phone:")}</b> {user.phone}
          </p>
        )}
      </div>

      <div className="profile-links">
        <Link to="/edit-profile" className="profile-btn">
          {t("Edit Profile")}
        </Link>
      </div>
    </div>
  );
}
