import React, { useState, useEffect } from "react";
import "./adminDashboard.css";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "desc"
  });

  // Fetch bookings data from the backend
  const fetchBookings = () => {
    setLoading(true);
    fetch("http://localhost/siraj/homeservice/service-backend/getbookings.php")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          throw new Error("Invalid data format received");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
    // Set up an interval to refresh data every 2 minutes
    const intervalId = setInterval(fetchBookings, 120000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-badge pending';
      case 'confirmed':
        return 'status-badge confirmed';
      case 'completed':
        return 'status-badge completed';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle status change
  const handleStatusChange = (bookingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) {
      return;
    }

    fetch("http://localhost/siraj/homeservice/service-backend/updateBookingStatus.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId: bookingId,
        status: newStatus
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Update the local state to reflect the change
          setBookings(bookings.map(booking => 
            booking.id === bookingId ? { ...booking, status: newStatus } : booking
          ));
        } else {
          alert("Failed to update status: " + (data.message || "Unknown error"));
        }
      })
      .catch((err) => {
        console.error("Error updating booking status:", err);
        alert("Failed to update status. Please try again.");
      });
  };

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter(booking => {
      const matchesStatus = statusFilter === "all" || booking.status?.toLowerCase() === statusFilter;
      const matchesService = serviceFilter === "all" || booking.serviceType === serviceFilter;
      const matchesSearch = searchTerm === "" || 
        booking.cname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.contact?.includes(searchTerm) ||
        booking.id?.toString().includes(searchTerm);
      
      return matchesStatus && matchesService && matchesSearch;
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  // Handle page changes
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get unique service types for filter dropdown
  const serviceTypes = [...new Set(bookings.map(booking => booking.serviceType))]
    .filter(type => type); // Filter out undefined/null values

  // Get service icon based on service type and problem
  const getServiceIcon = (serviceType, problem) => {
    if (serviceType === "Electrician") {
      switch (problem) {
        case "Wiring Issues": return "🔌";
        case "Light Fixture Problems": return "💡";
        case "Circuit Breaker Issues": return "⚡";
        case "Switch/Outlet Repair": return "🔧";
        case "Fan Installation/Repair": return "✇";
        case "AC Repair/Service": return "❄️";
        case "Refrigerator Repair": return "🗄";
        case "Washing Machine Repair": return "🫧";
        case "Water Heater Issues": return "🚿";
        case "Home Theater/TV Setup": return "📺";
        default: return "🔌";
      }
    } else if (serviceType === "Cleaning") {
      switch (problem) {
        case "Full House Cleaning": return "🧹";
        case "Kitchen Deep Cleaning": return "🧽";
        case "Bathroom Deep Cleaning": return "🚿";
        case "Refrigerator Cleaning": return "🗄";
        case "Carpet/Sofa Cleaning": return "🛋️";
        case "Pest Control Service": return "🐜";
        default: return "🧹";
      }
    }
    return "🔧"; // Default icon
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div> Loading bookings...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <section className="dashboard-section bookings-section">
      <div className="section-header">
        <h2>📋 Booking Management</h2>
        <button className="refresh-btn" onClick={fetchBookings}>
          🔄 Refresh Data
        </button>
      </div>

      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, contact or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="filter">
            <label>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter">
            <label>Service:</label>
            <select 
              value={serviceFilter} 
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="all">All Services</option>
              {serviceTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bookings-stats">
        <div className="stat-card">
          <div className="stat-title">Total Bookings</div>
          <div className="stat-value">{bookings.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Pending</div>
          <div className="stat-value pending">
            {bookings.filter(b => b.status?.toLowerCase() === 'pending').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Confirmed</div>
          <div className="stat-value confirmed">
            {bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Completed</div>
          <div className="stat-value completed">
            {bookings.filter(b => b.status?.toLowerCase() === 'completed').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Cancelled</div>
          <div className="stat-value cancelled">
            {bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value">
            ₹{bookings.reduce((sum, booking) => sum + parseFloat(booking.amount || 0), 0).toFixed(2)}
          </div>
        </div>
      </div>

      {currentBookings.length > 0 ? (
        <>
          <div className="table-container">
            <table className="dashboard-table bookings-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('id')} className="sortable">
                    ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('serviceType')} className="sortable">
                    Service {sortConfig.key === 'serviceType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('service_date')} className="sortable">
                    Date & Time {sortConfig.key === 'service_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('cname')} className="sortable">
                    Customer {sortConfig.key === 'cname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Problem</th>
                  <th onClick={() => requestSort('amount')} className="sortable">
                    Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('status')} className="sortable">
                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>
                      <div className="service-cell">
                        <span className="service-icon">{getServiceIcon(booking.serviceType, booking.problem)}</span>
                        {booking.serviceType}
                      </div>
                    </td>
                    <td>
                      <div className="datetime-cell">
                        <div>{formatDate(booking.service_date)}</div>
                        <div className="service-time">{booking.service_time}</div>
                      </div>
                    </td>
                    <td>{booking.cname}</td>
                    <td>{booking.contact}</td>
                    <td className="address-cell">{booking.caddress}</td>
                    <td>
                      <div className="problem-cell">
                        <span>{booking.problem || "N/A"}</span>
                        {booking.area && <div className="area-badge">{booking.area} sq. ft.</div>}
                      </div>
                    </td>
                    <td className="amount-cell">₹{parseFloat(booking.amount).toFixed(2)}</td>
                    <td>
                      <span className={getStatusBadgeClass(booking.status)}>
                        {booking.status || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {booking.status === "pending" && (
                          <>
                            <button 
                              className="action-btn confirm"
                              onClick={() => handleStatusChange(booking.id, "confirmed")}
                            >
                              Confirm
                            </button>
                            <button 
                              className="action-btn cancel"
                              onClick={() => handleStatusChange(booking.id, "cancelled")}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <>
                            <button 
                              className="action-btn complete"
                              onClick={() => handleStatusChange(booking.id, "completed")}
                            >
                              Complete
                            </button>
                            <button 
                              className="action-btn cancel"
                              onClick={() => handleStatusChange(booking.id, "cancelled")}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {(booking.status === "completed" || booking.status === "cancelled") && (
                          <span className="action-text">No actions available</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="page-btn"
              >
                &laquo; Prev
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(num => 
                    num === 1 || 
                    num === totalPages || 
                    (num >= currentPage - 1 && num <= currentPage + 1)
                  )
                  .map((number) => {
                    // Add ellipsis
                    if (number === totalPages && currentPage < totalPages - 2) {
                      return (
                        <React.Fragment key={`ellipsis-${number}`}>
                          <span className="ellipsis">...</span>
                          <button
                            onClick={() => paginate(number)}
                            className={`page-btn ${currentPage === number ? 'active' : ''}`}
                          >
                            {number}
                          </button>
                        </React.Fragment>
                      );
                    }
                    
                    if (number === 1 && currentPage > 3) {
                      return (
                        <React.Fragment key={`ellipsis-${number}`}>
                          <button
                            onClick={() => paginate(number)}
                            className={`page-btn ${currentPage === number ? 'active' : ''}`}
                          >
                            {number}
                          </button>
                          <span className="ellipsis">...</span>
                        </React.Fragment>
                      );
                    }
                    
                    return (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`page-btn ${currentPage === number ? 'active' : ''}`}
                      >
                        {number}
                      </button>
                    );
                  })}
              </div>
              
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Next &raquo;
              </button>
              
              <span className="page-info">
                Page {currentPage} of {totalPages} ({filteredBookings.length} results)
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="no-data">
          {searchTerm || statusFilter !== "all" || serviceFilter !== "all" 
            ? "No bookings match your filters" 
            : "No bookings available"}
        </div>
      )}
    </section>
  );
}

export default Bookings;