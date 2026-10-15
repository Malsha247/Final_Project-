
import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Sell.css";
import huskImg from "../assests/husk.png";
import plantImg from "../assests/plant.jpg";

export default function Sell() {
  const navigate = useNavigate();


  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;


  const handleSellClick = (path) => {
    if (!user) {
      alert(" Please log in to continue.");
      navigate("/login");
      return;
    }
    navigate(path);
  };

  return (
    <div className="sell-page">
      <h2>Sell Your Coconut Products </h2>
      <p>Select what you want to sell</p>

      <div className="sell-options">
        <div
          className="sell-card"
          onClick={() => handleSellClick("/sell-husk")}
        >
          <img src={huskImg} alt="Coconut Husk" />
          <h3>Coconut Husk</h3>
        </div>

        <div
          className="sell-card"
          onClick={() => handleSellClick("/sell-plant")}
        >
          <img src={plantImg} alt="Coconut Plant" />
          <h3>Coconut Plant</h3>
        </div>
      </div>
    </div>
  );
}
