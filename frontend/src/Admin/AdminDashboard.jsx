import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Bookings from "./Bookings";
import Users from "./Users";
import GenerateBill from "./GenerateBill";
import "./adminDashboard.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      alert("Access denied! Please log in first.");
      navigate("/admin/login"); // Redirect to login if no token
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login"); // Redirect after logout
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li 
            className={activeTab === "bookings" ? "active" : ""} 
            onClick={() => setActiveTab("bookings")}
          >
            📅 Bookings
          </li>
          <li 
            className={activeTab === "users" ? "active" : ""} 
            onClick={() => setActiveTab("users")}
          >
            👤 Users
          </li>
          <li 
            className={activeTab === "bill" ? "active" : ""} 
            onClick={() => setActiveTab("bill")}
          >
            🧾 Generate Bill
          </li>
        </ul>

        {/* Logout Button */}
        <button className="logout-button" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {activeTab === "bookings" && <Bookings />}
        {activeTab === "users" && <Users />}
        {activeTab === "bill" && <GenerateBill />}
      </div>
    </div>
  );
}

export default AdminDashboard;