import API_BASE_URL from "../config/api";
import React, { useEffect, useState } from "react";
import { usePreferences } from "../contexts/PreferencesContext";
import "../Styles/MyRequests.css";

const API = `${API_BASE_URL}/plants/getRequests.php`;

export default function MyRequests() {
  const { t } = usePreferences();
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
        alert(data.message || t("Failed to load requests"));
      }
    } catch (err) {
      console.error(err);
      alert(t("Failed to fetch requests"));
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
      <h2>{t("Requests for your listings")}</h2>

      <div className="controls">
        <input
          placeholder={t("Search name/email/phone/message")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={() => { setOffset(0); load(); }}>{t("Search")}</button>
      </div>

      <div className="summary">
        <span>{t("Total:")} {total}</span>
      </div>

      {loading ? (
        <p>{t("Loading...")}</p>
      ) : (
        <ul className="requests-list">
          {requests.map((r) => (
            <li key={r.request_id} className="req-item">
              <div className="req-top">
                <div className="req-title">{r.owner_name} ({t("Listing #")}{r.listing_id})</div>
                <div className="req-time">{new Date(r.requested_at).toLocaleString()}</div>
              </div>

              <div className="req-body">
                <div><strong>{t("Requester:")}</strong> {r.requester_name || t("Not provided")}</div>
                  <div><strong>{t("Email:")}</strong> {r.requester_email || t("Not provided")}</div>
                  <div><strong>{t("Phone:")}</strong> {r.requester_phone || t("Not provided")}</div>
                  <div><strong>{t("Quantity:")}</strong> {r.quantity}</div>
                  <div className="req-msg"><strong>{t("Message:")}</strong><div>{r.request_message || t("No message")}</div></div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="pagination">
        <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}>{t("Prev")}</button>
        <button onClick={() => setOffset(offset + limit)} disabled={offset + limit >= total}>{t("Next")}</button>
        <span> {t("Page:")} {Math.floor(offset / limit) + 1} </span>
      </div>
    </div>
  );
}
