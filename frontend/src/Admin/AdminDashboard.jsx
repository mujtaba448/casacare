import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Bookings from "./Bookings";
import Users from "./Users";
import GenerateBill from "./GenerateBill";
import "./adminDashboard.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Hide user navbar when admin dashboard loads
    const userNavbar = document.querySelector('.user-navbar, .navbar, .header-navbar');
    if (userNavbar) {
      userNavbar.style.display = 'none';
    }

    // Hide any other user-specific UI elements
    const userElements = document.querySelectorAll('.user-header, .user-sidebar, .user-menu');
    userElements.forEach(element => {
      element.style.display = 'none';
    });

    // Verify admin authentication
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      alert("Access denied! Please log in as admin first.");
      navigate("/admin/login");
    } else {
      setIsLoading(false);
    }

    // Cleanup function to restore user navbar when component unmounts
    return () => {
      const userNavbar = document.querySelector('.user-navbar, .navbar, .header-navbar');
      if (userNavbar) {
        userNavbar.style.display = '';
      }

      const userElements = document.querySelectorAll('.user-header, .user-sidebar, .user-menu');
      userElements.forEach(element => {
        element.style.display = '';
      });
    };
  }, [navigate]);

  const handleLogout = () => {
    // Clear admin token
    localStorage.removeItem("adminToken");
    
    // Restore user navbar before navigating away
    const userNavbar = document.querySelector('.user-navbar, .navbar, .header-navbar');
    if (userNavbar) {
      userNavbar.style.display = '';
    }

    const userElements = document.querySelectorAll('.user-header, .user-sidebar, .user-menu');
    userElements.forEach(element => {
      element.style.display = '';
    });

    // Navigate to admin login
    navigate("/admin/login");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Admin-only header to ensure no user elements show */}
      <div className="admin-header">
        <div className="admin-brand">
          <h1>Service Management System - Admin</h1>
        </div>
      </div>

      <div className="admin-main-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Admin Panel</h2>
            <div className="admin-indicator">
              <span className="admin-badge">ADMIN</span>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              <li 
                className={activeTab === "bookings" ? "active" : ""} 
                onClick={() => handleTabChange("bookings")}
              >
                <span className="nav-icon">📅</span>
                <span className="nav-text">Bookings</span>
              </li>
              <li 
                className={activeTab === "users" ? "active" : ""} 
                onClick={() => handleTabChange("users")}
              >
                <span className="nav-icon">👤</span>
                <span className="nav-text">Users</span>
              </li>
              <li 
                className={activeTab === "bill" ? "active" : ""} 
                onClick={() => handleTabChange("bill")}
              >
                <span className="nav-icon">🧾</span>
                <span className="nav-text">Generate Bill</span>
              </li>
            </ul>
          </nav>

          {/* Admin Info */}
          <div className="admin-info">
            <div className="admin-profile">
              <div className="admin-avatar">
                <span>👨‍💼</span>
              </div>
              <div className="admin-details">
                <p className="admin-name">Administrator</p>
                <p className="admin-role">System Admin</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button className="logout-button" onClick={handleLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          <div className="content-header">
            <h2 className="page-title">
              {activeTab === "bookings" && "📅 Booking Management"}
              {activeTab === "users" && "👤 User Management"}
              {activeTab === "bill" && "🧾 Bill Generation"}
            </h2>
            <div className="admin-actions">
              <button className="refresh-btn" onClick={() => window.location.reload()}>
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="content-body">
            {activeTab === "bookings" && <Bookings />}
            {activeTab === "users" && <Users />}
            {activeTab === "bill" && <GenerateBill />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;