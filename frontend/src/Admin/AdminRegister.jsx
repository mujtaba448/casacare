import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./adminRegister.css";

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost/siraj/homeservice/service-backend/adminregister.php",
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage(response.data.message);

      if (response.data.status === "success") {
        alert("Admin registered successfully!");
        setName("");
        setEmail("");
        setPassword("");
        navigate("/admin/login"); // Redirect to login page after successful registration
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Register</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <button type="submit" className="auth-button">Register</button>
      </form>
      <p>
        Already have an account? <a href="/admin/login">Login here</a>.
      </p>
    </div>
  );
};

export default AdminRegister;
