import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./homePage.css";

// Import images directly
import fanImage from "./assets/fan.jpg";
import acImage from "./assets/ac.jpg";
import washingMachineImage from "./assets/washing-machine.jpg";
import fridgeImage from "./assets/fridge.jpg";
import kitchenCleaningImage from "./assets/kitchen-cleaning.jpg";
import bathroomCleaningImage from "./assets/bathroom-cleaning.jpg";
import electricianImage from "./assets/elec.jpg";
import cleaningImage from "./assets/clean.jpg";
import avatar1 from "./assets/avatar1.jpg";
import avatar2 from "./assets/avatar2.jpg";
import avatar3 from "./assets/avatar3.jpg";
import avatar4 from "./assets/avatar4.jpg";

const HomePage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // Animation effect when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const serviceIssues = [
    { image: fanImage, title: "Fan Repair", emoji: "✇" },
    { image: acImage, title: "AC Repair", emoji: "❄️" },
    { image: washingMachineImage, title: "Washing Machine Repair", emoji: "🫧" },
    { image: fridgeImage, title: "Refrigerator Repair", emoji: "🗄" },
    { image: kitchenCleaningImage, title: "Kitchen Cleaning", emoji: "🧽" },
    { image: bathroomCleaningImage, title: "Bathroom Cleaning", emoji: "🛁" }
  ];

  const reviews = [
    {
      text: "Amazing service! The electrician was professional and quick. I was impressed with the attention to detail.",
      author: "Ramesh K., Mumbai",
      avatar: avatar1,
      rating: 4
    },
    {
      text: "Our house was spotless after the cleaning session. Highly recommended for deep cleaning!",
      author: "Priya S., Delhi",
      avatar: avatar2,
      rating: 5
    },
    {
      text: "Quick response time and great quality work. Will definitely book again for my next repair.",
      author: "Aman T., Bangalore",
      avatar: avatar3,
      rating: 4
    },
    {
      text: "Friendly staff and thorough service. They fixed our AC when others couldn't. Excellent job!",
      author: "Sneha M., Pune",
      avatar: avatar4,
      rating: 5
    },
    {
      text: "I've used CasaCare three times now and have never been disappointed. Consistent quality service!",
      author: "Vikram P., Chennai",
      avatar: avatar1,
      rating: 5
    },
    {
      text: "Professional team that arrived on time and completed the job efficiently. Great value for money.",
      author: "Meera J., Hyderabad",
      avatar: avatar3,
      rating: 4
    }
  ];

  // Helper function to render star ratings
  const renderStars = (count) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={`star ${i < count ? "filled" : "empty"}`}>
        {i < count ? "⭐" : "☆"}
      </span>
    ));
  };

  return (
    <div className={`home-container ${isVisible ? "visible" : ""}`}>
      <header className="home-header">
        <div className="header-content">
          <h1>Welcome to CasaCare</h1>
          <p>Your trusted partner for expert electricians and professional house cleaning services.</p>
          {/* Removed the Book Service button as requested */}
        </div>
      </header>

      <section className="section-title">
        <h2>Our Popular Services</h2>
        <div className="section-underline"></div>
      </section>

      <div className="service-issues">
        {serviceIssues.map((issue, index) => (
          <div className="service-issue" key={index}>
            <div className="service-issue-image-container">
              <img
                src={issue.image}
                alt={issue.title}
                className="service-issue-image"
              />
            </div>
            <p>{issue.title} <span className="service-emoji">{issue.emoji}</span></p>
          </div>
        ))}
      </div>

      <section className="section-title">
        <h2>Book Our Services</h2>
        <div className="section-underline"></div>
      </section>

      <div className="service-cards">
        <div className="service-card electrician-service">
          <div className="service-card-badge">Popular</div>
          <img
            src={electricianImage}
            alt="Electrician Service"
            className="service-image"
          />
          <h2>Electrician Services</h2>
          <p>Expert solutions for all your electrical needs. Reliable and safe service at your doorstep.</p>
          <div className="pricing">
            <span className="price">Starting at ₹499</span>
          </div>
          <button
            className="service-button"
            onClick={() => navigate("/booking", { state: { serviceType: "Electrician" } })}
          >
            Book Electrician
          </button>
          <div className="rating">
            {renderStars(4)}
          </div>
        </div>

        <div className="service-card house-cleaning-service">
          <div className="service-card-badge best-value">Best Value</div>
          <img
            src={cleaningImage}
            alt="House Cleaning Service"
            className="service-image"
          />
          <h2>House Cleaning Services</h2>
          <p>Professional cleaning to make your home spotless and welcoming.</p>
          <div className="pricing">
            <span className="price">Starting at ₹699</span>
          </div>
          <button
            className="service-button"
            onClick={() => navigate("/booking", { state: { serviceType: "Cleaning" } })}
          >
            Book Cleaning
          </button>
          <div className="rating">
            {renderStars(4)}
          </div>
        </div>
      </div>

      <section className="section-title">
        <h2>What Our Customers Say</h2>
        <div className="section-underline"></div>
      </section>

      <div className="review-section">
        {reviews.map((review, index) => (
          <div className="review-card" key={index}>
            <div className="review-content">
              <div className="review-quote">"</div>
              <p>{review.text}</p>
              <div className="review-author">
                <div className="review-avatar">
                  <img src={review.avatar} alt={`Avatar ${index + 1}`} />
                </div>
                <span>{review.author}</span>
              </div>
            </div>
            <div className="review-rating">
              {renderStars(review.rating)}
            </div>
          </div>
        ))}
      </div>

      <section className="trust-banner">
        <div className="trust-item">
          <div className="trust-icon">✓</div>
          <h3>Trusted Professionals</h3>
          <p>All service providers are verified and well-trained</p>
        </div>
        <div className="trust-item">
          <div className="trust-icon">⚡</div>
          <h3>Quick Service</h3>
          <p>Same-day appointments available</p>
        </div>
        <div className="trust-item">
          <div className="trust-icon">💰</div>
          <h3>Best Prices</h3>
          <p>Affordable rates with no hidden charges</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;