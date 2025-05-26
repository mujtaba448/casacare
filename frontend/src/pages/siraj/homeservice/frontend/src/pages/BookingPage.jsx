import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./bookingPage.css";

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Custom dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  
  // State for location fetch loading
  const [fetchingLocation, setFetchingLocation] = useState(false);
  // State for form submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for form submission error
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      alert("You must be logged in to book a service.");
      navigate("/login");
    }
  }, [navigate]);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("");
  const [serviceType, setServiceType] = useState(location.state?.serviceType || "");
  const [problem, setProblem] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceTime, setServiceTime] = useState("");
  const [areaSize, setAreaSize] = useState("");
  const [bookingId, setBookingId] = useState(null);

  // Validate name to accept only alphabets and spaces
  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[A-Za-z\s]+$/.test(value)) {
      setName(value);
    }
  };

  // Validate contact to accept only 10 digits
  const handleContactChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && value.length <= 10)) {
      setContact(value);
    }
  };

  // Price lists for different services (kept for display purposes)
  const electricianPrices = {
    "Wiring Issues": 1500,
    "Light Fixture Problems": 800,
    "Circuit Breaker Issues": 1200,
    "Switch/Outlet Repair": 600,
    "Fan Installation/Repair": 1000,
    "AC Repair/Service": 2500,
    "Refrigerator Repair": 2000,
    "Washing Machine Repair": 1800,
    "Water Heater Issues": 1500,
    "Home Theater/TV Setup": 1200,
    "Doorbell/Intercom Repair": 700,
    "Electrical Safety Inspection": 1500,
    "Generator Issues": 2000,
    "Smart Home Installation": 3000,
    "Inverter Installation/Repair": 1800
  };

  const cleaningPrices = {
    "Full House Cleaning": 15,  // per sq ft
    "Kitchen Deep Cleaning": 2000, // fixed price
    "Bathroom Deep Cleaning": 1500, // fixed price
    "Refrigerator Cleaning": 800, // fixed price
    "Carpet/Sofa Cleaning": 1200, // fixed price
    "Pest Control Service": 3000  // fixed price
  };

  // Icons for problems
  const serviceIcons = {
    "Electrician": {
      "Wiring Issues": "🔌",
      "Light Fixture Problems": "💡",
      "Circuit Breaker Issues": "⚡",
      "Switch/Outlet Repair": "🔧",
      "Fan Installation/Repair": "✇",
      "AC Repair/Service": "❄️",
      "Refrigerator Repair": "🗄",
      "Washing Machine Repair": "🫧",
      "Water Heater Issues": "🚿",
      "Home Theater/TV Setup": "📺",
      "Doorbell/Intercom Repair": "🔔",
      "Electrical Safety Inspection": "🔍",
      "Generator Issues": "⚙️",
      "Smart Home Installation": "🏠",
      "Inverter Installation/Repair": "🔋"
    },
    "Cleaning": {
      "Full House Cleaning": "🧹",
      "Kitchen Deep Cleaning": "🧽",
      "Bathroom Deep Cleaning": "🚿",
      "Refrigerator Cleaning": "🗄",
      "Carpet/Sofa Cleaning": "🛋️",
      "Pest Control Service": "🐜"
    }
  };

  // Calculate booking fee - fixed 150 rupees
  const calculateAmount = () => {
    // Base booking fee
    let amount = 150;
    
    // Add service-specific charges based on problem selection
    if (serviceType === "Electrician" && problem) {
      amount += electricianPrices[problem] || 0;
    }
    
    if (serviceType === "Cleaning") {
      if (problem === "Full House Cleaning" && areaSize) {
        // Per square foot pricing
        amount += cleaningPrices[problem] * parseInt(areaSize);
      } else if (problem) {
        // Fixed price for other cleaning services
        amount += cleaningPrices[problem] || 0;
      }
    }
    
    return amount;
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    
    // Validate all fields
    if (!name || !contact || !buildingName || !street || !area || !city || !state || !pincode || !country || 
        !serviceType || !serviceDate || !serviceTime || !problem) {
      setSubmitError("Please fill all fields correctly.");
      return;
    }
  
    if (contact.length !== 10) {
      setSubmitError("Contact number must be 10 digits.");
      return;
    }
  
    if (serviceType === "Cleaning" && problem === "Full House Cleaning" && (!areaSize || areaSize < 100)) {
      setSubmitError("Please enter valid area in square feet (minimum 100 sq ft).");
      return;
    }
  
    // Create the address string
    const address = `${buildingName}, ${street}, ${area}, ${city}, ${state}, ${pincode}, ${country}`;
    
    // Calculate the actual total amount including service charges
    const amount = calculateAmount();
    
    // Create booking data
    const bookingData = {
      name,
      contact,
      address,
      serviceType,
      problem,
      amount,
      serviceDate,
      serviceTime,
      area: serviceType === "Cleaning" && problem === "Full House Cleaning" ? parseInt(areaSize) : null,
    };
  
    // Set submitting state
    setIsSubmitting(true);
    
    try {
      // Send booking data to the server first
      const response = await fetch("http://localhost/siraj/homeservice/service-backend/bookService.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });
      
      const data = await response.json();
      setIsSubmitting(false);
      
      if (data.success) {
        // Store booking info with booking ID for payment page
        const paymentData = {
          ...bookingData,
          bookingId: data.bookingId
        };
        
        localStorage.setItem("currentBooking", JSON.stringify(paymentData));
        setBookingId(data.bookingId);
        
        // Navigate to payment page
        navigate("/payment");
      } else {
        // Show error dialog
        setSubmitError(data.error || "An error occurred while creating your booking.");
      }
    } catch (error) {
      setIsSubmitting(false);
      setSubmitError("Network error. Please try again.");
      console.error("Booking submission error:", error);
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setShowDialog(false);
    navigate("/");
  };

  // Simulated location fetching
  const handleGetLocation = () => {
    setFetchingLocation(true);
    
    // Simulate a delay to show the loading state
    setTimeout(() => {
      setBuildingName("Tilak Maharashtra Vidyapeeth");
      setStreet("T.M.V colony");
      setArea("Mukund nagar");
      setCity("Pune");
      setState("Maharashtra");
      setPincode("411037");
      setCountry("India");
      setFetchingLocation(false);
    }, 1500);
  };

  // Get tomorrow's date in YYYY-MM-DD format for the min date attribute
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // This function returns exactly 10 electrician problems in 5 groups of 2
  const getProblemGroups = () => {
    if (!serviceType || !Object.keys(serviceIcons).includes(serviceType)) {
      return [];
    }

    if (serviceType === "Electrician") {
      // Limit to exactly 10 electrician problems with emojis
      const electricianProblemsToShow = [
        "Wiring Issues",           // 🔌
        "Light Fixture Problems",  // 💡
        "Circuit Breaker Issues",  // ⚡
        "Switch/Outlet Repair",    // 🔧
        "Fan Installation/Repair", // ✇
        "AC Repair/Service",       // ❄️
        "Refrigerator Repair",     // 🗄
        "Washing Machine Repair",  // 🫧
        "Water Heater Issues",     // 🚿
        "Home Theater/TV Setup"    // 📺
      ];
      
      // Group into exactly 5 rows of 2 items each
      return [
        [electricianProblemsToShow[0], electricianProblemsToShow[1]],
        [electricianProblemsToShow[2], electricianProblemsToShow[3]],
        [electricianProblemsToShow[4], electricianProblemsToShow[5]],
        [electricianProblemsToShow[6], electricianProblemsToShow[7]],
        [electricianProblemsToShow[8], electricianProblemsToShow[9]]
      ];
    } else {
      // For other service types, keep original behavior
      const problems = Object.keys(serviceIcons[serviceType]);
      const groups = [];
      
      for (let i = 0; i < problems.length; i += 2) {
        if (i + 1 < problems.length) {
          groups.push([problems[i], problems[i + 1]]);
        } else {
          groups.push([problems[i]]);
        }
      }
      
      return groups;
    }
  };

  return (
    <div className="page-container">
      {/* Custom Dialog Component */}
      {showDialog && (
        <div className="custom-dialog-overlay">
          <div className="custom-dialog">
            <div className="dialog-header">
              <h2>CasaCare says</h2>
            </div>
            <div className="dialog-content">
              <p>{dialogMessage}</p>
            </div>
            <div className="dialog-footer">
              <button onClick={handleCloseDialog} className="dialog-button">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Location fetching indicator */}
      {fetchingLocation && (
        <div className="custom-dialog-overlay">
          <div className="custom-dialog">
            <div className="dialog-header">
              <h2>CasaCare</h2>
            </div>
            <div className="dialog-content">
              <p>Fetching your location...</p>
              <div className="loading-spinner"></div>
            </div>
          </div>
        </div>
      )}

      <div className="booking-container">
        <h1>👨‍🔧 Book Your Service 👨‍🔧</h1>
        <form onSubmit={handleFormSubmit}>
          <div className="input-row">
            <label>Your Name:</label>
            <input 
              type="text" 
              placeholder="Your Name (alphabets only)" 
              value={name} 
              onChange={handleNameChange} 
              required 
            />
          </div>
          
          <div className="input-row contact-row">
            <label>Contact Number:</label>
            <div className="contact-input-container">
              <input 
                type="text" 
                placeholder="10-digit Contact Number" 
                value={contact} 
                onChange={handleContactChange} 
                required 
              />
              {contact && contact.length !== 10 && (
                <div className="error-message">Contact number must be 10 digits</div>
              )}
            </div>
          </div>
          
          <div className="input-row">
            <label>Building Name:</label>
            <input 
              type="text" 
              placeholder="Building Name" 
              value={buildingName} 
              onChange={(e) => setBuildingName(e.target.value)} 
              required
            />
          </div>
          
          <div className="address-row">
            <label>Address:</label>
            <div className="address-fields">
              <input 
                type="text" 
                placeholder="Street" 
                value={street} 
                onChange={(e) => setStreet(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Area" 
                value={area} 
                onChange={(e) => setArea(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="City" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="State" 
                value={state} 
                onChange={(e) => setState(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Pincode" 
                value={pincode} 
                onChange={(e) => setPincode(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Country" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Get Address Button */}
          <button 
            type="button" 
            onClick={handleGetLocation} 
            className="location-btn"
            disabled={fetchingLocation}
          >
            📍 Get My Address
          </button>

          {/* Date and Time Selection */}
          <div className="date-time-container">
            <div className="input-group">
              <label>Service Date:</label>
              <input 
                type="date" 
                value={serviceDate} 
                onChange={(e) => setServiceDate(e.target.value)}
                min={getTomorrowDate()}
                required 
              />
            </div>
            <div className="input-group">
              <label>Service Time:</label>
              <select 
                value={serviceTime} 
                onChange={(e) => setServiceTime(e.target.value)}
                required
              >
                <option value="">--Select Time--</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>
          </div>

          <div className="dropdown">
            <label>Select Service:</label>
            <select value={serviceType} onChange={(e) => {
              setServiceType(e.target.value);
              setProblem(""); // Reset problem when service type changes
            }} required>
              <option value="">--Select Service--</option>
              <option value="Cleaning">House Cleaning</option>
              <option value="Electrician">Electrician</option>
            </select>
          </div>

          {serviceType === "Electrician" && (
            <div className="dropdown">
              <label>Select Problem:</label>
              <select value={problem} onChange={(e) => setProblem(e.target.value)} required>
                <option value="">--Select Problem--</option>
                {Object.keys(electricianPrices).map((item) => (
                  <option key={item} value={item}>{item} - ₹{electricianPrices[item]}</option>
                ))}
              </select>
            </div>
          )}

          {serviceType === "Cleaning" && (
            <div className="dropdown">
              <label>Select Cleaning Service:</label>
              <select value={problem} onChange={(e) => setProblem(e.target.value)} required>
                <option value="">--Select Cleaning Service--</option>
                {Object.keys(cleaningPrices).map((item) => (
                  <option key={item} value={item}>
                    {item} 
                    {item === "Full House Cleaning" 
                      ? ` - ₹${cleaningPrices[item]}/sq ft` 
                      : ` - ₹${cleaningPrices[item]}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {serviceType === "Cleaning" && problem === "Full House Cleaning" && (
            <div className="input-row">
              <label>Area in Square Feet:</label>
              <input 
                type="number" 
                placeholder="Enter area in sq ft" 
                value={areaSize} 
                onChange={(e) => setAreaSize(e.target.value)} 
                min="100"
                required 
              />
            </div>
          )}

          {submitError && (
            <div className="error-message submit-error">{submitError}</div>
          )}

          <h3>Booking Fee: ₹{calculateAmount()}</h3>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Proceed to Payment"}
          </button>
        </form>
      </div>
      
      {/* Service Icons Display */}
      {serviceType && (
        <div className="service-icons">
          <h2>{serviceType} Services</h2>
          {getProblemGroups().map((group, index) => (
            <div key={index} className="icon-group">
              {group.map(item => (
                <div 
                  key={item} 
                  className={`service-icon ${problem === item ? "selected" : ""}`}
                  onClick={() => setProblem(item)}
                >
                  <div className="icon">{serviceIcons[serviceType][item]}</div>
                  <p>{item}</p>
                  <span className="price">₹{
                    serviceType === "Cleaning" && item === "Full House Cleaning" 
                      ? `${cleaningPrices[item]}/sq ft` 
                      : serviceType === "Cleaning" 
                        ? cleaningPrices[item] 
                        : electricianPrices[item]
                  }</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingPage;