import React, { useState, useEffect } from "react";
import "./adminDashboard.css";

function Bookings() {
  const [bookings, setBookings] = useState([]);

  // Fetch bookings data from the backend
  useEffect(() => {
    fetch("http://localhost/siraj/homeservice/service-backend/getbookings.php")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          console.error("Invalid data received:", data);
        }
      })
      .catch((err) => console.error("Error fetching bookings:", err));
  }, []);

  return (
    <section className="dashboard-section">
      <h2>Bookings</h2>
      {bookings.length > 0 ? (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Service</th>
              <th>Customer Name</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Area</th>
              <th>Problem</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.serviceType}</td>
                <td>{booking.cname}</td>
                <td>{booking.contact}</td>
                <td>{booking.caddress}</td>
                <td>{booking.area ? `${booking.area} sq. ft.` : "N/A"}</td>
                <td>{booking.problem || "N/A"}</td>
                <td>₹{booking.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No bookings available</p>
      )}
    </section>
  );
}

export default Bookings;
