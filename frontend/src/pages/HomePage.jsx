import React from "react";
import { useNavigate } from "react-router-dom";
import "./homePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to CasaCare</h1>
        <p>Your trusted partner for expert electricians and professional house cleaning services.</p>
      </header>

      {/* Problem Solving Section with Images/Emojis */}
      <div className="service-issues">
        <div className="service-issue">
          <img
            src={require("./assets/fan.jpg")}
            alt="Fan Repair"
            className="service-issue-image"
          />
          <p>Fan Repair ✇🌫</p>
        </div>
        <div className="service-issue">
          <img
            src={require("./assets/ac.jpg")}
            alt="AC Repair"
            className="service-issue-image"
          />
          <p>AC Repair ❄️</p>
        </div>
        <div className="service-issue">
          <img
            src={require("./assets/washing-machine.jpg")}
            alt="Washing Machine Repair"
            className="service-issue-image"
          />
          <p>Washing Machine Repair 🫧</p>
        </div>
        <div className="service-issue">
          <img
            src={require("./assets/fridge.jpg")}
            alt="Fridge Repair"
            className="service-issue-image"
          />
          <p>Refrigerator Repair 🗄</p>
        </div>
        <div className="service-issue">
          <img
            src={require("./assets/kitchen-cleaning.jpg")}
            alt="Kitchen Cleaning"
            className="service-issue-image"
          />
          <p>Kitchen Cleaning 🧽</p>
        </div>
        <div className="service-issue">
          <img
            src={require("./assets/bathroom-cleaning.jpg")}
            alt="Bathroom Cleaning"
            className="service-issue-image"
          />
          <p>Bathroom Cleaning 🛁</p>
        </div>
      </div>

      <div className="service-cards">
        <div className="service-card">
          <img
            src={require("./assets/elec.jpg")}
            alt="Electrician Service"
            className="service-image"
          />
          <h2>Electrician Services</h2>
          <p>Expert solutions for all your electrical needs. Reliable and safe service at your doorstep.</p>
          <button
            className="service-button"
            onClick={() => navigate("/booking", { state: { serviceType: "Electrician" } })}
          >
            Book Electrician
          </button>
          <div className="rating">
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">☆</span>
          </div>
        </div>

        <div className="service-card">
          <img
            src={require("./assets/clean.jpg")}
            alt="House Cleaning Service"
            className="service-image"
          />
          <h2>House Cleaning Services</h2>
          <p>Professional cleaning to make your home spotless and welcoming.</p>
          <button
            className="service-button"
            onClick={() => navigate("/booking", { state: { serviceType: "Cleaning" } })}
          >
            Book Cleaning
          </button>
          <div className="rating">
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">☆</span>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="review-section">
        <div className="review-card">
          <p>"Amazing service! The electrician was professional and quick."</p>
          <span>- Ramesh K., Mumbai</span>
          <div className="review-avatar">
            <img src={require("./assets/avatar1.jpg")} alt="Avatar 1" />
          </div>
          <div className="review-rating">
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">☆</span>
          </div>
        </div>
        <div className="review-card">
          <p>"Our house was spotless after the cleaning session. Highly recommended!"</p>
          <span>- Priya S., Delhi</span>
          <div className="review-avatar">
            <img src={require("./assets/avatar2.jpg")} alt="Avatar 2" />
          </div>
          <div className="review-rating">
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
          </div>
        </div>
        <div className="review-card">
          <p>"Quick response time and great quality work. Will book again."</p>
          <span>- Aman T., Bangalore</span>
          <div className="review-avatar">
            <img src={require("./assets/avatar3.jpg")} alt="Avatar 3" />
          </div>
          <div className="review-rating">
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">☆</span>
          </div>
        </div>
        <div className="review-card">
          <p>"Friendly staff and thorough service. Excellent job!"</p>
          <span>- Sneha M., Pune</span>
          <div className="review-avatar">
            <img src={require("./assets/avatar4.jpg")} alt="Avatar 4" />
          </div>
          <div className="review-rating">
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
            <span className="star">⭐</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
