import API_BASE_URL, { assetUrl } from "../config/api";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/Plants.css";
import plantPlaceholder from "../assests/plant.jpg";

export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/plants/getPlants.php`)
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

  return (
    <main className="plants-page">
      <header className="plants-header">
        <p className="plants-eyebrow">Grow greener with us</p>
        <h2>Plants for Sale</h2>
        <p>Find coconut plants from growers across Sri Lanka.</p>
      </header>

      {loading ? (
        <p className="plants-status" role="status">Loading plants...</p>
      ) : plants.length === 0 ? (
        <p className="plants-status">No plants available right now.</p>
      ) : (
        <>
          <p className="plants-count">
            <strong>{plants.length}</strong>{" "}
            {plants.length === 1 ? "listing" : "listings"} available
          </p>
          <div className="plants-grid">
            {plants.map((plant) => (
              <Link
                key={plant.id}
                className="plants-card"
                to={`/plant/${plant.id}`}
              >
                <div className="plants-thumb-wrap">
                  <img
                    src={plant.image ? assetUrl(plant.image) : plantPlaceholder}
                    alt={`${plant.owner_name || "Coconut plant"} listing`}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = plantPlaceholder;
                    }}
                  />
                </div>
                <div className="plants-info">
                  <h3>{plant.owner_name || "Local grower"}</h3>
                  {plant.description && (
                    <p className="plants-description">{plant.description}</p>
                  )}
                  <p className="plants-address">{plant.address}</p>
                  <p className="plants-meta">
                    Posted: {new Date(plant.created_at).toLocaleDateString()}
                  </p>
                  <span className="plants-card-link">View plant details</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
