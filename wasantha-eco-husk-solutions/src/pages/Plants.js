// src/pages/Plants.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Plants.css";

export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8081/api/plants/getPlants.php")
      .then((res) => res.json())
      .then((data) => {
        
        if (data && data.success && Array.isArray(data.plants)) {
          setPlants(data.plants);
        } else {
          setPlants([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch plants:", err);
        setPlants([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="center">Loading plants...</p>;

  return (
    <div className="plants-page">
      <h2>Plants For Sale</h2>

      {plants.length === 0 ? (
        <p className="center">No plants available right now.</p>
      ) : (
        <div className="plants-grid">
          {plants.map((p) => (
            <div key={p.id} className="plants-card" onClick={() => navigate(`/plant/${p.id}`)}>
              <div className="plants-thumb-wrap">
                <img
                  src={p.image ? `http://localhost:8081/${p.image}` : "/placeholder-plant.png"}
                  alt={p.owner_name}
                />
              </div>
              <div className="plants-info">
                <h3>{p.owner_name}</h3>
                <p className="plants-address">{p.address}</p>
                <p className="plants-meta">Posted: {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
