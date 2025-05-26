import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./adminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost/siraj/homeservice/service-backend/adminlogin.php",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage(response.data.message);

      if (response.data.status === "success") {
        alert("Login successful!");
        localStorage.setItem("adminToken", response.data.token); // Save token
        navigate("/admin/dashboard"); // Redirect to dashboard
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Login</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/admin/register">Register here</a>.
      </p>
    </div>
  );
};

export default AdminLogin;
