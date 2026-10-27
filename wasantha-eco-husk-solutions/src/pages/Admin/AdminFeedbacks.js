import API_BASE_URL from "../../config/api";
import React, { useEffect, useState } from "react";
import "../../Styles/AdminStyle/adminFeedbacks.css";

export default function AdminFeedbacks() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const adminName =
    (JSON.parse(sessionStorage.getItem("user") || "null") || {}).first_name ||
    "Admin";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/feedback/getAllFeedbacks.php`
        );

        const text = await res.text();
        let data = null;
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            console.warn("getAllFeedbacks returned non-JSON:", text);
            data = null;
          }
        }

        if (res.ok && data && data.success) {
          setList(data.feedbacks || []);
        } else {
          console.error("Failed to load feedbacks", data);
        }
      } catch (err) {
        console.error("Network error while loading feedbacks", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const sendReply = async (id) => {
    const text = (replyText[id] || "").trim();
    if (!text) return alert("Reply cannot be empty");

    try {
      const res = await fetch(
        `${API_BASE_URL}/feedback/replyFeedback.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedback_id: id,
            reply: text
          })
        }
      );

      const respText = await res.text();
      let data = null;
      if (respText) {
        try {
          data = JSON.parse(respText);
        } catch {
          console.warn("replyFeedback returned non-JSON:", respText);
          data = {
            success: false,
            message: "Invalid JSON response from server",
          };
        }
      } else {
        data = { success: false, message: "Empty response from server" };
      }

      if (res.ok && data && data.success) {
        alert("Reply sent");
        setList((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  reply: text,
                  is_replied: 1,
                  replied_by: adminName,
                  replied_at: new Date().toISOString(),
                }
              : item
          )
        );

        setReplyText((prev) => ({ ...prev, [id]: "" }));
      } else {
        alert(
          "Failed: " +
            (data && data.message ? data.message : `Status ${res.status}`)
        );
      }
    } catch (err) {
      console.error("Network / fetch error:", err);
      alert("Could not connect to backend");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-feedbacks-page">
      <h2>Feedback & Inquiries</h2>
      {list.length === 0 ? (
        <p>No feedbacks.</p>
      ) : (
        <div className="feedbacks-list">
          {list.map((f) => (
            <div key={f.id} className="feedback-card">
              <div className="fb-header">
                <div>
                  <strong>{f.user_name}</strong> — {f.user_email}
                </div>
                <div>{new Date(f.created_at).toLocaleString()}</div>
              </div>
              <div className="fb-subject">{f.subject}</div>
              <div className="fb-message">{f.message}</div>

              {f.is_replied ? (
                <div className="fb-reply">
                  <strong>Replied by {f.replied_by}:</strong>
                  <div>{f.reply}</div>
                </div>
              ) : (
                <div className="fb-reply-form">
                  <textarea
                    rows="3"
                    value={replyText[f.id] || ""}
                    onChange={(e) =>
                      setReplyText({ ...replyText, [f.id]: e.target.value })
                    }
                  />
                  <button onClick={() => sendReply(f.id)}>Send Reply</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
