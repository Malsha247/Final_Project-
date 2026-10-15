import React, { useEffect, useState } from "react";
import "../Styles/MyRequests.css";

const API = "http://localhost:8081/api/plants/getRequests.php";

export default function MyRequests() {
  const [q, setQ] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const load = async (opts = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      params.append("limit", limit);
      params.append("offset", offset);
      // If you are testing without server-session, you can append seller_id=1 here
      const url = `${API}?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        setTotal(data.total || 0);
      } else {
        alert(data.message || "Failed to load requests");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [offset]);

  return (
    <div className="my-requests-page">
      <h2>Requests for your listings</h2>

      <div className="controls">
        <input
          placeholder="Search name/email/phone/message"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={() => { setOffset(0); load(); }}>Search</button>
      </div>

      <div className="summary">
        <span>Total: {total}</span>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="requests-list">
          {requests.map((r) => (
            <li key={r.request_id} className="req-item">
              <div className="req-top">
                <div className="req-title">{r.owner_name} (Listing #{r.listing_id})</div>
                <div className="req-time">{new Date(r.requested_at).toLocaleString()}</div>
              </div>

              <div className="req-body">
                <div><strong>Requester:</strong> {r.requester_name || "—"}</div>
                <div><strong>Email:</strong> {r.requester_email || "—"}</div>
                <div><strong>Phone:</strong> {r.requester_phone || "—"}</div>
                <div><strong>Quantity:</strong> {r.quantity}</div>
                <div className="req-msg"><strong>Message:</strong><div>{r.request_message || "—"}</div></div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="pagination">
        <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}>Prev</button>
        <button onClick={() => setOffset(offset + limit)} disabled={offset + limit >= total}>Next</button>
        <span> Page: {Math.floor(offset / limit) + 1} </span>
      </div>
    </div>
  );
}
