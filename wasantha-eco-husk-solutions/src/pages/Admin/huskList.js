import API_BASE_URL, { assetUrl } from "../../config/api";
import React, { useEffect, useState } from "react";
import "../../Styles/AdminStyle/adminHusks.css";

export default function AdminHusks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${API_BASE_URL}/seller/getAllHusks.php`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setItems(data.husks || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // -------------------------------
  // SEND RESPONSE (existing)
  // -------------------------------
  const handleResponse = async (sellerId) => {
    const res = await fetch(
      `${API_BASE_URL}/seller/sendResponse.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: sellerId }),
      }
    );
    const data = await res.json();
    alert(data.message);

    if (data.success) window.location.reload();
  };

 
  const handleDeleteHusk = async (sellerId) => {
    if (!window.confirm("Delete this husk submission permanently?")) return;

    const res = await fetch(
      `${API_BASE_URL}/seller/deleteHusk.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: sellerId }),
      }
    );

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      setItems((prev) => prev.filter((h) => h.id !== sellerId));
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-husks-page">
      <h2>All Husk Submissions</h2>

      {items.length === 0 ? (
        <p>No entries.</p>
      ) : (
        <table className="admin-husks-table">
          <thead>
            <tr>
              <th>Owner</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Images</th>
              <th>Description</th>
              <th>Admin Response</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>{h.phone}</td>
                <td>{h.address}</td>

                <td>
                  {h.image_1 && (
                    <img
                      src={assetUrl(h.image_1)}
                      alt=""
                      width="70"
                    />
                  )}
                  {h.image_2 && (
                    <img
                      src={assetUrl(h.image_2)}
                      alt=""
                      width="70"
                      style={{ marginLeft: 5 }}
                    />
                  )}
                </td>

                <td>{h.description}</td>

                <td>{h.admin_response || "No response"}</td>

                <td>
                  {h.map_link ? (
                    <a href={h.map_link} target="_blank" rel="noreferrer">
                      View Map
                    </a>
                  ) : (
                    "Not set"
                  )}
                </td>

                <td>
                  <button onClick={() => handleResponse(h.id)}>
                    Send Response
                  </button>

                  
                  {h.admin_response && (
                    <button
                      onClick={() => handleDeleteHusk(h.id)}
                      style={{
                        marginLeft: 6,
                        background: "#d9534f",
                        color: "#fff",
                      }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
