import API_BASE_URL, { assetUrl } from "../config/api";

import React, { useEffect, useState } from "react";
import { usePreferences } from "../contexts/PreferencesContext";
import "../Styles/MyHuskSales.css";

export default function MyHuskSales() {
  const { t } = usePreferences();
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }
    fetch(
      `${API_BASE_URL}/Seller/getHusksByUser.php?user_id=${user.id}`
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
          {t("Please")} <a href="/login">{t("login")}</a>
        </p>
      </div>
    );
  }
  if (loading) return <p>{t("Loading...")}</p>;

  return (
    <div className="my-husks-page">
      <h2>{t("My Husk Submissions")}</h2>
      {items.length === 0 ? (
        <p>{t("No submissions yet.")}</p>
      ) : (
        <div className="husks-grid">
          {items.map((h) => (
            <div key={h.id} className="husk-card">
              <div className="images">
                {h.image1 && (
                  <img
                    src={assetUrl(h.image1)}
                    alt={t("First uploaded image")}
                  />
                )}
                {h.image2 && (
                  <img
                    src={assetUrl(h.image2)}
                    alt={t("Second uploaded image")}
                  />
                )}
              </div>
              <div className="husk-info">
                <h3>{h.name}</h3>
                <p>
                  <b>{t("Phone:")}</b> {h.phone}
                </p>
                <p>
                  <b>{t("Address:")}</b> {h.address}
                </p>
                {h.location_lat && h.location_lng && (
                  <p>
                    <b>{t("Location:")}</b> {h.location_lat}, {h.location_lng}
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
