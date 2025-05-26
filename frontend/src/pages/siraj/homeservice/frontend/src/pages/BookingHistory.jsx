import React, { useState, useEffect } from 'react';
import './bookingHistory.css';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setError('Please login to view your bookings');
        setLoading(false);
        return;
      }

      // For testing/development - use this mock data if the API isn't ready yet
      // Comment this part out when your backend is working
      if (process.env.NODE_ENV === 'development' || true) { // Set to true to force using mock data
        console.log('Using mock booking data for development');
        setTimeout(() => {
          const mockBookings = [
            {
              id: 1,
              serviceType: 'Electrician',
              problem: 'Fan Installation/Repair',
              status: 'Pending',
              serviceDate: '2025-05-25',
              serviceTime: '10:00 AM',
              amount: 1150,
              address: 'Tilak Maharashtra Vidyapeeth, T.M.V colony, Mukund nagar, Pune, Maharashtra, 411037, India',
              cancellationDate: null
            },
            {
              id: 2,
              serviceType: 'Cleaning',
              problem: 'Bathroom Deep Cleaning',
              status: 'Completed',
              serviceDate: '2025-05-10',
              serviceTime: '02:00 PM',
              amount: 1650,
              address: 'Halima-B-Heritage, Nawaish chowk, Kondhwa, Pune, Maharashtra, 411037, India',
              cancellationDate: null
            },
            {
              id: 3,
              serviceType: 'Electrician',
              problem: 'Circuit Breaker Issues',
              status: 'Cancelled',
              serviceDate: '2025-05-15',
              serviceTime: '09:00 AM',
              amount: 1350,
              address: 'Halima-B-Heritage, Nawaish chowk, Kondhwa, Pune, Maharashtra, 411037, India',
              cancellationDate: '2025-05-12'
            }
          ];
          setBookings(mockBookings);
          setLoading(false);
        }, 1000);
        return;
      }

      // Fetch bookings from the backend when ready
      try {
        const response = await fetch('http://localhost/siraj/homeservice/service-backend/getBookingHistory.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });

        const data = await response.json();
        
        if (data.success) {
          setBookings(data.bookings);
        } else {
          setError(data.error || 'Failed to fetch bookings');
        }
      } catch (networkError) {
        console.error('Network error fetching bookings:', networkError);
        setError('Network error connecting to the server. Please check your connection or try again later.');
      }
    } catch (error) {
      console.error('Error in booking history component:', error);
      setError('An unexpected error occurred. Please refresh the page and try again.');
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (bookingId) => {
    setCancelBookingId(bookingId);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelBookingId(null);
    setCancelSuccess(null);
  };

  const handleCancel = async () => {
    if (!cancelBookingId) return;
    
    setCancellingBooking(true);
    setCancelSuccess(null);
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setError('Please login to cancel your booking');
        setCancellingBooking(false);
        return;
      }

      // For testing/development - handle cancellation with mock data if API isn't ready
      // Comment this out when backend is working
      if (process.env.NODE_ENV === 'development' || true) { // Set to true to force using mock data
        console.log('Using mock cancellation for development');
        // Simulate server processing time
        setTimeout(() => {
          // Update the booking status in the local state
          setBookings(prev =>
            prev.map(booking =>
              booking.id === cancelBookingId 
                ? { ...booking, status: 'Cancelled', cancellationDate: new Date().toISOString().split('T')[0] } 
                : booking
            )
          );
          setCancelSuccess(true);
          
          // Close the modal after 3 seconds
          setTimeout(() => {
            closeCancelModal();
          }, 3000);
          setCancellingBooking(false);
        }, 1500);
        return;
      }

      // Send cancel request to backend when ready
      try {
        const response = await fetch('http://localhost/siraj/homeservice/service-backend/cancelBooking.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            bookingId: cancelBookingId,
            userId: user.id 
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          // Update the booking status in the local state
          setBookings(prev =>
            prev.map(booking =>
              booking.id === cancelBookingId 
                ? { ...booking, status: 'Cancelled', cancellationDate: new Date().toISOString().split('T')[0] } 
                : booking
            )
          );
          setCancelSuccess(true);
          
          // Close the modal after 3 seconds
          setTimeout(() => {
            closeCancelModal();
          }, 3000);
        } else {
          setCancelSuccess(false);
          setError(data.error || 'Failed to cancel booking');
        }
      } catch (networkError) {
        console.error('Network error cancelling booking:', networkError);
        setCancelSuccess(false);
        setError('Network error connecting to the server. Please check your connection or try again later.');
      }
    } catch (error) {
      console.error('Error in cancel booking process:', error);
      setCancelSuccess(false);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setCancellingBooking(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getStatusBadgeClass = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  return (
    <div className="booking-history-container">
      <h1>Your Booking History</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="no-bookings">
          <div className="empty-state-icon">📅</div>
          <p>No bookings found. Book a service to see your history here!</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="service-type">
                  {booking.serviceType === "Electrician" ? "⚡" : "🧹"} {booking.serviceType}
                </div>
                <div className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status}
                </div>
              </div>
              
              <div className="booking-details">
                <div className="detail-row">
                  <div className="detail-label">Service:</div>
                  <div className="detail-value">{booking.problem}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Date & Time:</div>
                  <div className="detail-value">
                    {formatDate(booking.serviceDate)} at {formatTime(booking.serviceTime)}
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Amount:</div>
                  <div className="detail-value price">₹{booking.amount}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Address:</div>
                  <div className="detail-value address">{booking.address}</div>
                </div>
                
                {booking.cancellationDate && (
                  <div className="detail-row cancellation">
                    <div className="detail-label">Cancelled on:</div>
                    <div className="detail-value">{formatDate(booking.cancellationDate)}</div>
                  </div>
                )}
              </div>
              
              <div className="booking-footer">
                {booking.status.toLowerCase() === 'pending' || booking.status.toLowerCase() === 'confirmed' ? (
                  <button 
                    className="cancel-btn" 
                    onClick={() => openCancelModal(booking.id)}
                  >
                    Cancel Booking
                  </button>
                ) : null}
                
                <div className="booking-id">
                  Booking ID: #{booking.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="cancel-modal">
            <div className="modal-header">
              <h3>Cancel Booking</h3>
              <button className="close-btn" onClick={closeCancelModal}>×</button>
            </div>
            
            <div className="modal-content">
              {cancelSuccess === true ? (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <p>Your booking has been successfully cancelled!</p>
                  <p className="refund-info">
                    Your refund of ₹{bookings.find(b => b.id === cancelBookingId)?.amount || 0} will be processed within 2-3 business days.
                  </p>
                </div>
              ) : (
                <>
                  <p>Are you sure you want to cancel this booking?</p>
                  <p className="refund-policy">
                    <strong>Refund Policy:</strong> Your payment will be refunded to your original payment method within 2-3 business days.
                  </p>
                  
                  {cancelSuccess === false && (
                    <div className="error-message">
                      Failed to cancel booking. Please try again.
                    </div>
                  )}
                  
                  <div className="modal-actions">
                    <button 
                      className="cancel-action" 
                      onClick={handleCancel}
                      disabled={cancellingBooking}
                    >
                      {cancellingBooking ? 'Processing...' : 'Yes, Cancel Booking'}
                    </button>
                    <button 
                      className="keep-booking" 
                      onClick={closeCancelModal}
                      disabled={cancellingBooking}
                    >
                      No, Keep My Booking
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;