
import React, { useEffect, useState } from "react";
import "../Styles/MyHuskSales.css";

export default function MyHuskSales() {
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }
    fetch(
      `http://localhost:8081/api/seller/getHusksByUser.php?user_id=${user.id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setItems(data.husks || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="my-husks-page">
        <p>
          Please <a href="/login">login</a>
        </p>
      </div>
    );
  }
  if (loading) return <p>Loading...</p>;

  return (
    <div className="my-husks-page">
      <h2>My Husk Submissions</h2>
      {items.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <div className="husks-grid">
          {items.map((h) => (
            <div key={h.id} className="husk-card">
              <div className="images">
                {h.image1 && (
                  <img
                    src={`http://localhost:8081/${h.image1}`}
                    alt="img1"
                  />
                )}
                {h.image2 && (
                  <img
                    src={`http://localhost:8081/${h.image2}`}
                    alt="img2"
                  />
                )}
              </div>
              <div className="husk-info">
                <h3>{h.name}</h3>
                <p>
                  <b>Phone:</b> {h.phone}
                </p>
                <p>
                  <b>Address:</b> {h.address}
                </p>
                {h.location_lat && h.location_lng && (
                  <p>
                    <b>Location:</b> {h.location_lat}, {h.location_lng}
                  </p>
                )}
                {h.details && <p>{h.details}</p>}
                <p className="date">
                  {new Date(h.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
