import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/AdminStyle/Dashbord.css";

import huskImg from "../../assests/husk.png";
import plantImg from "../../assests/plant.jpg";
import productsImg from "../../assests/products.jpg";
import ordersImg from "../../assests/orders.png";
import feedbackImg from "../../assests/feedback.png";
import reportImg from "../../assests/reports.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchTotalOrders = () => {
    fetch(
      "http://localhost:8081/api/orders/getOrderStats.php"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTotalOrders(data.total);
      })
      .catch((err) => console.error("Failed to load total orders:", err));
  };

  useEffect(() => {
    fetchTotalOrders();

    const interval = setInterval(() => {
      const updated = sessionStorage.getItem("ordersUpdated");
      if (updated) fetchTotalOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const tiles = [
    { title: `Orders (${totalOrders})`, img: ordersImg, link: "/admin/order" },
    { title: "Products", img: productsImg, link: "/admin/products" },
    { title: "Coconut Husk", img: huskImg, link: "/admin/huskList" },
    {
      title: "Delivery Persons Management",
      img: plantImg,
      link: "/admin/delivery-persons",
    },
    {
      title: "Feedbacks and Inquiries",
      img: feedbackImg,
      link: "/admin/feedbacks",
    },
    { title: "Reports", img: reportImg, link: "/admin/reports" },
  ];

  return (
    <div className="eco-dashboard">
      <main className="dashboard-main">
        <h2>Admin Dashboard</h2>

        <div className="dashboard-grid">
          {tiles.map((tile, i) => (
            <div
              key={i}
              className="dashboard-card"
              onClick={() => navigate(tile.link)}
            >
              <img src={tile.img} alt={tile.title} />
              <button>{tile.title}</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
