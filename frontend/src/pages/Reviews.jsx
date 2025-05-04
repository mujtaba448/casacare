import React, { useState } from 'react';
import './bookingReview.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([
    { username: 'John', message: 'Great service!' },
    { username: 'Ravi', message: 'Quick response. Loved it!' },
  ]);
  const [newReview, setNewReview] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert("Please login to submit a review.");

    if (newReview.trim() !== '') {
      setReviews([{ username: user.username, message: newReview }, ...reviews]);
      setNewReview('');
    }
  };

  return (
    <div className="review-container">
      <h2>Leave a Review</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Write your review here..."
        />
        <button type="submit">Submit Review</button>
      </form>

      <h3>All Reviews</h3>
      <ul>
        {reviews.map((r, index) => (
          <li key={index}>
            <strong>{r.username}</strong>: {r.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reviews;
