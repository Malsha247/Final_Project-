
import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Sell.css";
import huskImg from "../assests/husk.png";
import plantImg from "../assests/plant.jpg";

export default function Sell() {
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Invalid session user:", error);
  }

  const handleSellClick = (path) => {
    if (!user) {
      alert("Please log in to continue.");
      navigate("/login");
      return;
    }
    navigate(path);
  };

  return (
    <main className="sell-page">
      <header className="sell-header">
        <p className="sell-eyebrow">Join our growing community</p>
        <h2>Sell with Wasantha Eco Husk</h2>
        <p>Choose a product type to create your listing and reach local customers.</p>
      </header>

      <div className="sell-options" aria-label="Choose what to sell">
        <button
          type="button"
          className="sell-card"
          onClick={() => handleSellClick("/sell-husk")}
        >
          <img src={huskImg} alt="" />
          <span className="sell-card-content">
            <span className="sell-card-eyebrow">Natural materials</span>
            <span className="sell-card-title">Coconut Husk</span>
            <span className="sell-card-description">
              List your husk chips and related coconut coir products.
            </span>
            <span className="sell-card-action">Create a husk listing</span>
          </span>
        </button>

        <button
          type="button"
          className="sell-card"
          onClick={() => handleSellClick("/sell-plant")}
        >
          <img src={plantImg} alt="" />
          <span className="sell-card-content">
            <span className="sell-card-eyebrow">Grow and share</span>
            <span className="sell-card-title">Coconut Plants</span>
            <span className="sell-card-description">
              Connect with buyers looking for healthy coconut plants.
            </span>
            <span className="sell-card-action">Create a plant listing</span>
          </span>
        </button>
      </div>
    </main>
  );
}
