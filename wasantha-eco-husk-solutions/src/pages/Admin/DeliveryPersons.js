import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/AdminStyle/DeliveryPersons.css";

export default function DeliveryPersons() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const BASE_SALARY = 25000;
  const PER_DELIVERY = 100;

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/delivery/getAll.php`
      );
      const data = await res.json();
      setList(data.data || []);
    } catch {
      setMessage("Failed to load delivery persons");
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= CREATE ================= */
  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
      setMessage("Name, Email and Password are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/delivery/create.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessage("Delivery person registered successfully");
        setForm({ name: "", email: "", phone: "", password: "" });
        load();
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PAY SALARY ================= */
  const paySalary = async (deliveryPersonId) => {
    if (!window.confirm("Confirm salary payment for this month?")) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/delivery/paySalary.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delivery_person_id: deliveryPersonId }),
        }
      );

      const data = await res.json();
      alert(data.message);

      if (data.success) {
        setList((prev) =>
          prev.map((d) =>
            d.id === deliveryPersonId
              ? { ...d, paid_delivery_count: d.delivery_count }
              : d
          )
        );
      }
    } catch {
      alert("Salary payment failed");
    }
  };

  /* ================= DELETE (NEW) ================= */
  const deleteDeliveryPerson = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery person?"))
      return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/delivery/delete.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessage("Delivery person deleted successfully");
        setList((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert(data.message || "Delete failed");
      }
    } catch {
      alert("Server error while deleting");
    }
  };

  return (
    <div className="delivery-wrapper">
      <h2> Delivery Persons Management</h2>

      <button className="back-btn" onClick={() => navigate("/admin/dashboard")}>
        ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ Back to Admin Dashboard
      </button>

      {message && <p className="msg">{message}</p>}

      <div className="delivery-form">
        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          type="password"
          placeholder="Temporary Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button onClick={submit} disabled={loading}>
          {loading ? "Creating..." : "Create Delivery Person"}
        </button>
      </div>

      <hr />

      <h3>Registered Delivery Persons</h3>

      {list.length === 0 ? (
        <p>No delivery persons found</p>
      ) : (
        list.map((d) => {
          const unpaidDeliveries =
            (d.delivery_count || 0) - (d.paid_delivery_count || 0);

          const salary =
            unpaidDeliveries > 0
              ? BASE_SALARY + unpaidDeliveries * PER_DELIVERY
              : 0;

          return (
            <div className="delivery-row" key={d.id}>
              <div>
                <strong>{d.name}</strong>
                <div>{d.email}</div>
              </div>

              <div>
                <div> Total Deliveries: {d.delivery_count}</div>
                <div> Unpaid Deliveries: {unpaidDeliveries}</div>
                <div>
                  Salary: <strong>Rs. {salary.toLocaleString()}</strong>
                </div>

                <button
                  className="pay-btn"
                  disabled={salary === 0}
                  onClick={() => paySalary(d.id)}
                >
                  Pay Salary
                </button>

                
                <button
                  className="delete-btn"
                  style={{ marginLeft: 10, background: "#c0392b", color: "#fff" }}
                  onClick={() => deleteDeliveryPerson(d.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
