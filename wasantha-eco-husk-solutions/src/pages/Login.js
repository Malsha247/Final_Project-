import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../Styles/Login.css";
import logo from "../assests/icon.png";
import API_BASE_URL from "../config/api";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submitting = useRef(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Invalid email format.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting.current || submitted) return;

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    submitting.current = true;
    setLoading(true);
    setApiError("");

    try {
      const res = await fetch(`${API_BASE_URL}/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      let data;

      try {
        data = await res.json();
      } catch {
        setApiError(
          "The login server returned an invalid response. Please try again later."
        );
        return;
      }

      if (
        !data ||
        typeof data !== "object" ||
        typeof data.success !== "boolean"
      ) {
        setApiError(
          "The login server returned an invalid response. Please try again later."
        );
        return;
      }

      if (res.ok && data.success && data.user) {
        const user = data.user;

        sessionStorage.setItem("user_id", user.id);
        sessionStorage.setItem("user", JSON.stringify(user));

        setSubmitted(true);
        setApiError("");

        setTimeout(() => {
          if (user.role === "admin") {
            navigate("/admin/dashboard");
          } else if (user.role === "delivery") {
            navigate("/delivery/dashboard");
          } else {
            navigate("/");
          }
        }, 1200);
      } else {
        setApiError(
          typeof data.message === "string"
            ? data.message
            : "Login failed. Please try again later."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setApiError("Something went wrong. Please try again later.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <img src={logo} alt="Wasantha Eco Husk Logo" />
        </div>

        <h2>Welcome Back</h2>
        <p className="welcome-text">
          Login to your Wasantha Eco Husk account
        </p>

        {submitted && (
          <div className="success-msg">Login successful!</div>
        )}

        {apiError && <div className="error-msg">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          {errors.email && (
            <small className="error">{errors.email}</small>
          )}

          <div className="input-group password-group">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />

            <span
              className="toggle-password"
              role="button"
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowPassword((prev) => !prev);
                }
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {errors.password && (
            <small className="error">{errors.password}</small>
          )}

          <button
            type="submit"
            className="btn-login"
            disabled={loading || submitted}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="extra-links">
          <p>
            Don’t have an account?{" "}
            <Link to="/register" className="link-green">
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;