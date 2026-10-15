import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import "../../Styles/AdminStyle/Dashbord.css";
import logo from "../../assests/icon.png";

export const AdminNavbar = () => {
  const [adminName, setAdminName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === "admin") {
        setAdminName(user.name || "Admin");
        setIsLoggedIn(true);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [location.pathname]); 

  
  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        <div className="navbar-left">
          <Link to="/admin/dashboard" className="navbar-logo">
            <img src={logo} alt="Wasantha Eco Husk Logo" className="logo-img" />
            <div className="logo-text">
              <h1>Wasantha Eco Husk</h1>
              <p>Solutions</p>
            </div>
          </Link>
        </div>

      
        {isLoggedIn && (
          <div className="nav-icons">
            <span className="user-greeting">👋 Hello, {adminName}</span>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
