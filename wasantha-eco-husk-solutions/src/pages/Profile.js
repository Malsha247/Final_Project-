
import React from "react";
import { Link } from "react-router-dom";
import "../Styles/Profile.css";

export default function Profile() {
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  if (!user)
    return (
      <div className="profile-page">
        <p>
          Please <Link to="/login">login</Link>
        </p>
      </div>
    );

  return (
    <div className="profile-page">
      <h2>My Account</h2>
      <div className="profile-card">
        <p>
          <b>Name:</b> {user.first_name || user.firstName}
        </p>
        <p>
          <b>Email:</b> {user.email}
        </p>
        {user.phone && (
          <p>
            <b>Phone:</b> {user.phone}
          </p>
        )}
      </div>

      <div className="profile-links">
        <Link to="/edit-profile" className="profile-btn">
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
