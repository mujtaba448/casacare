import React, { useState, useEffect } from 'react';
import './bookingReview.css';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Example dummy data
    setBookings([
      { id: 1, service: 'AC Repair', status: 'Pending' },
      { id: 2, service: 'Fan repair', status: 'Completed' },
    ]);
  }, []);

  const handleCancel = (id) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === id ? { ...booking, status: 'Cancelled' } : booking
      )
    );
  };

  return (
    <div className="booking-container">
      <h2>Your Booking History</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <ul>
          {bookings.map(booking => (
            <li key={booking.id}>
              {booking.service} - <strong>{booking.status}</strong>
              {booking.status === 'Pending' && (
                <button onClick={() => handleCancel(booking.id)} className="cancel-button">
                  Cancel
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookingHistory;
