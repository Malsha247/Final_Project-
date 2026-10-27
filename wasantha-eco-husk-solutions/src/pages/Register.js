import API_BASE_URL from "../config/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../Styles/Register.css";
import logo from "../assests/icon.png"; 

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 
  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required.";

    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format.";

    if (!formData.password.trim()) newErrors.password = "Password is required.";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters long.";

    if (!formData.confirmPassword.trim())
      newErrors.confirmPassword = "Please confirm your password.";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    return newErrors;
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/register.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Registration server returned HTTP ${res.status}.`);
      }

      if (res.ok && data.success) {
        setSubmitted(true);
        setApiError("");
        setTimeout(() => navigate("/login"), 2000); 
      } else {
        setApiError(data.message || "Registration failed. Try again.");
      }
    } catch (err) {
      console.error("Register error:", err);
      setApiError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-box">
        
        <div className="register-logo">
          <img src={logo} alt="Wasantha Eco Husk Logo" />
        </div>

        <h2>Create Your Account </h2>
        <p className="welcome-text">Join Wasantha Eco Husk Solutions today</p>

        {submitted && (
          <div className="success-msg">
             Registration successful! Redirecting...
          </div>
        )}
        {apiError && <div className="error-msg">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          
          <div className="input-group">
            <FaUser className="icon" />
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          {errors.firstName && (
            <small className="error">{errors.firstName}</small>
          )}

         
          <div className="input-group">
            <FaUser className="icon" />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          {errors.lastName && (
            <small className="error">{errors.lastName}</small>
          )}

          
          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && <small className="error">{errors.email}</small>}

          
          <div className="input-group password-group">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.password && (
            <small className="error">{errors.password}</small>
          )}

         
          <div className="input-group password-group">
            <FaLock className="icon" />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <span
              className="toggle-password"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.confirmPassword && (
            <small className="error">{errors.confirmPassword}</small>
          )}

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="extra-links">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="link-green">
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
