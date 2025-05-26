import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./reviewPage.css";

const ReviewPage = () => {
  const navigate = useNavigate();
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [serviceType, setServiceType] = useState("Electrician");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  // User info
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || "mujtaba1");
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    
    // Fetch all reviews
    fetchReviews();
  }, []);

  // Fetch all reviews from the server
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost/siraj/homeservice/service-backend/getReviews.php", {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        cache: "no-cache" // Avoid caching issues
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
      } else {
        setError("Failed to load reviews: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setError("Network error when loading reviews. Please try again. Error: " + err.message);
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert("You must be logged in to post a review.");
      navigate("/login");
      return;
    }
    
    // Validate form
    if (!reviewText.trim()) {
      setSubmitError("Please enter review text.");
      return;
    }
    
    // Clear previous errors/successes
    setSubmitError("");
    setSubmitSuccess(false);
    setSubmitting(true);
    
    try {
      // Create review data
      const reviewData = {
        userName: userName,
        serviceType: serviceType,
        rating: rating,
        reviewText: reviewText,
        timestamp: new Date().toISOString()
      };
      
      console.log("Submitting review data:", reviewData);
      
      // Submit to server
      const response = await fetch("http://localhost/siraj/homeservice/service-backend/submitReviews.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(reviewData),
        cache: "no-cache" // Prevent caching issues
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server response is not JSON format!");
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Show success message
        setSubmitSuccess(true);
        
        // Clear form
        setReviewText("");
        setRating(5);
        
        // Refresh reviews list
        fetchReviews();
      } else {
        setSubmitError(data.error || "Failed to submit review. Please try again.");
      }
    } catch (err) {
      setSubmitError("Network error. Please try again. Error: " + err.message);
      console.error("Error submitting review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate average rating from all reviews
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + parseInt(review.rating), 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Format timestamp for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Render star rating
  const renderStars = (count) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= count ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    
    return stars;
  };

  return (
    <div className="review-page-wrapper">
      <div className="review-page-container">
        <h1>✨ Customer Reviews ✨</h1>
        
        {/* Reviews summary stats */}
        <div className="reviews-summary">
          <div className="average-rating">
            <div className="rating-number">{calculateAverageRating()}</div>
            <div className="rating-stars">
              <div className="stars-container">
                {renderStars(Math.round(calculateAverageRating()))}
              </div>
              <div className="rating-count">Based on {reviews.length} reviews</div>
            </div>
          </div>
        </div>
        
        {/* Submit review form */}
        <div className="submit-review-container">
          <h2>Share Your Experience</h2>
          {!isLoggedIn ? (
            <div className="login-prompt">
              <p>Please <a href="/login">login</a> to submit a review.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group">
                <label>Service Type:</label>
                <select 
                  value={serviceType} 
                  onChange={(e) => setServiceType(e.target.value)}
                  required
                >
                  <option value="Electrician">Electrician</option>
                  <option value="Cleaning">House Cleaning</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Your Rating:</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= rating ? "star-select filled" : "star-select"}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Your Review:</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with the service..."
                  required
                  rows={4}
                />
              </div>
              
              {submitError && <div className="error-message">{submitError}</div>}
              {submitSuccess && (
                <div className="success-message">
                  Thank you for your review! It has been posted successfully.
                </div>
              )}
              
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Post Review"}
              </button>
            </form>
          )}
        </div>
        
        {/* Reviews list */}
        <div className="reviews-container">
          <h2>What Our Customers Say</h2>
          
          {loading ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
              <p>Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="no-reviews-message">
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.userName ? review.userName.charAt(0) : 'A'}
                      </div>
                      <div className="reviewer-name">
                        {review.userName || "Anonymous User"}
                      </div>
                    </div>
                    <div className="review-service-type">
                      {review.serviceType === "Electrician" ? "⚡ Electrician" : 
                       review.serviceType === "Cleaning" ? "🧹 House Cleaning" : review.serviceType}
                    </div>
                  </div>
                  
                  <div className="review-rating">
                    <div className="stars-row">
                      {renderStars(review.rating)}
                    </div>
                    <span className="review-date">{formatDate(review.timestamp)}</span>
                  </div>
                  
                  <div className="review-text">
                    {review.reviewText}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;