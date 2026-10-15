
import React, { useEffect, useState } from "react";
import "../Styles/Contact.css";

export default function MyMessages() {
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(
      `http://localhost:8081/api/feedback/getCustomerFeedbacks.php?user_id=${user.id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMsgs(data.feedbacks || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <p>Please login to view messages.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="contact-page">
      <h2>My Messages</h2>
      {msgs.length === 0 ? (
        <p>No messages yet.</p>
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
                <strong>Reply ({m.replied_by}):</strong>
                <div>{m.reply}</div>
                <small>
                  {m.replied_at ? new Date(m.replied_at).toLocaleString() : ""}
                </small>
              </div>
            ) : (
              <div className="msg-no-reply">No reply yet</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
