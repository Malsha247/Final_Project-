import API_BASE_URL from "../config/api";

import React, { useEffect, useState } from "react";
import { usePreferences } from "../contexts/PreferencesContext";
import "../Styles/Contact.css";

export default function MyMessages() {
  const { t } = usePreferences();
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(
      `${API_BASE_URL}/feedback/getCustomerFeedbacks.php?user_id=${user.id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMsgs(data.feedbacks || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <p>{t("Please login to view messages.")}</p>;
  if (loading) return <p>{t("Loading...")}</p>;

  return (
    <div className="contact-page">
      <h2>{t("My Messages")}</h2>
      {msgs.length === 0 ? (
        <p>{t("No messages yet.")}</p>
      ) : (
        msgs.map((m) => (
          <div key={m.id} className="message-card">
            <div className="msg-head">
              <strong>{m.subject}</strong>
              <span>{new Date(m.created_at).toLocaleString()}</span>
            </div>
            <div className="msg-body">{m.message}</div>
            {m.is_replied ? (
              <div className="msg-reply">
                <strong>{t("Reply")} ({m.replied_by}):</strong>
                <div>{m.reply}</div>
                <small>
                  {m.replied_at ? new Date(m.replied_at).toLocaleString() : ""}
                </small>
              </div>
            ) : (
              <div className="msg-no-reply">{t("No reply yet")}</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
