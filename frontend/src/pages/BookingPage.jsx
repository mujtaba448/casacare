import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./bookingPage.css";

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Custom dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  
  // Payment dialog state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [paymentError, setPaymentError] = useState("");

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
  const [authCode, setAuthCode] = useState("");

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
      "Fan Installation/Repair": "✇🌫",
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

  // Always return fixed amount of 150 rupees
  const calculateAmount = () => {
    return 150;
  };

  // Generate a random auth code
  const generateAuthCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    if (!value) return value;
    const inputVal = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const inputNumbersOnly = inputVal.substring(0, 16);
    
    // Add space after every 4 digits
    const splits = inputNumbersOnly.match(/.{1,4}/g);
    let spacedNumber = splits ? splits.join(' ') : inputNumbersOnly;
    
    return spacedNumber;
  };

  // Format card expiry as MM/YY
  const formatExpiry = (value) => {
    if (!value) return value;
    const inputVal = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (inputVal.length <= 2) {
      return inputVal;
    } else {
      return `${inputVal.substring(0, 2)}/${inputVal.substring(2, 4)}`;
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!name || !contact || !buildingName || !street || !area || !city || !state || !pincode || !country || 
        !serviceType || !serviceDate || !serviceTime) {
      alert("Please fill all fields correctly.");
      return;
    }

    // Generate auth code now
    const newAuthCode = generateAuthCode();
    setAuthCode(newAuthCode);
    
    // Show payment dialog
    setShowPaymentDialog(true);
  };

  // Handle payment submission
 // Update the handlePaymentSubmit function in BookingPage.jsx to match the updated backend

const handlePaymentSubmit = async (e) => {
  e.preventDefault();
  setPaymentError("");
  
  // Validate payment form
  if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
    setPaymentError("Please enter a valid card number");
    return;
  }
  
  if (!cardExpiry || cardExpiry.length < 5) {
    setPaymentError("Please enter a valid expiry date");
    return;
  }
  
  if (!cardCvv || cardCvv.length < 3) {
    setPaymentError("Please enter a valid CVV");
    return;
  }
  
  if (!cardName) {
    setPaymentError("Please enter the cardholder name");
    return;
  }
  
  // Simulate payment processing
  setPaymentProcessing(true);
  
  // Create the address string
  const address = `${buildingName}, ${street}, ${area}, ${city}, ${state}, ${pincode}, ${country}`;
  const amount = 150; // Fixed amount of 150 rupees
  
  // Create booking data with payment info
  const bookingData = {
    name,
    contact,
    address,
    serviceType,
    problem,
    amount,
    serviceDate,
    serviceTime,
    authCode,
    area: serviceType === "Cleaning" && problem === "Full House Cleaning" ? area : null,
    // Add payment information
    cardNumber: cardNumber,
    cardName: cardName,
    cardExpiry: cardExpiry
  };

  try {
    // First validate the card (optional, can be implemented on the backend)
    const validateResponse = await fetch("http://localhost/siraj/homeservice/service-backend/paymentService.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "validate_card",
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardExpiry: cardExpiry,
        cardCvv: cardCvv
      }),
    });

    const validationData = await validateResponse.json();
    
    // If card validation failed
    if (validateResponse.ok && !validationData.valid) {
      setPaymentProcessing(false);
      setPaymentError(validationData.message || "Payment card validation failed");
      return;
    }
    
    // If validation passed or skipped, process the booking
    const response = await fetch("http://localhost/siraj/homeservice/service-backend/bookService.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();
    
    setPaymentProcessing(false);
    setShowPaymentDialog(false);

    if (data.message) {
      // Add transaction ID to the success message if available
      const successMessage = data.transactionId 
        ? `${data.message}\n\nTransaction ID: ${data.transactionId}\nAuthentication code for service provider: ${authCode}`
        : `${data.message}\n\nAuthentication code for service provider: ${authCode}`;
        
      setDialogMessage(successMessage);
      setShowDialog(true);
    } else if (data.error) {
      setPaymentError(data.error);
      alert(data.error);
    }
  } catch (error) {
    setPaymentProcessing(false);
    console.error("Error:", error);
    setPaymentError("An error occurred while processing your payment. Please try again.");
  }
};
  
  // Cancel payment
  const handleCancelPayment = () => {
    setShowPaymentDialog(false);
    setCardNumber("");
    setCardExpiry("");
    setCvv("");
    setCardName("");
    setPaymentError("");
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setShowDialog(false);
    navigate("/");
  };

  // Get current location and convert to address - FURTHER FIXED VERSION
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          const data = await response.json();
          console.log("Location data received:", data); // Debug log
          
          // Extract address components more carefully
          const address = data.address || {};
          
          // More robust handling of street field
          let streetValue = "";
          // Check for common street-related fields in priority order
          if (address.road) {
            streetValue = address.road;
            if (address.house_number) {
              streetValue = `${address.house_number} ${streetValue}`;
            }
          } else if (address.street) { // Some regions use 'street' instead of 'road'
            streetValue = address.street;
          } else if (address.thoroughfare) { // Alternative field
            streetValue = address.thoroughfare;
          } else if (address.pedestrian) {
            streetValue = address.pedestrian;
          } else if (address.footway) {
            streetValue = address.footway;
          } else if (address.path) {
            streetValue = address.path;
          } else if (data.display_name) {
            // As a fallback, try to extract the street from display_name
            const parts = data.display_name.split(',');
            if (parts.length > 0) {
              streetValue = parts[0].trim();
            }
          }
          
          // Try multiple possible fields for area
          let areaValue = "";
          if (address.suburb) {
            areaValue = address.suburb;
          } else if (address.neighbourhood) {
            areaValue = address.neighbourhood;
          } else if (address.residential) {
            areaValue = address.residential;
          } else if (address.quarter) {
            areaValue = address.quarter;
          } else if (address.borough) {
            areaValue = address.borough;
          } else if (address.district) {
            areaValue = address.district;
          } else if (address.subdistrict) {
            areaValue = address.subdistrict;
          } else if (data.display_name) {
            // As a fallback, use the second part of display_name
            const parts = data.display_name.split(',');
            if (parts && parts.length > 1) {
              areaValue = parts[1].trim();
            }
          }
          
          console.log("Extracted street:", streetValue);
          console.log("Extracted area:", areaValue);
          
          // Update state with retrieved values, with more fallback options
          setStreet(streetValue || "");
          setArea(areaValue || "");
          setCity(address.city || address.town || address.village || address.municipality || address.county || "");
          setState(address.state || address.province || address.region || "");
          setPincode(address.postcode || address.postal_code || address.zip || address.zip_code || "");
          setCountry(address.country || "");
          
          // Suggest a building name based on nearby POI or from address
          if (address.building || address.amenity || address.shop) {
            setBuildingName(address.building || address.amenity || address.shop);
          } else if (address.building_name) {
            setBuildingName(address.building_name);
          } else if (address.place_name) {
            setBuildingName(address.place_name);
          }
          
        } catch (error) {
          console.error("Error fetching address:", error);
          alert("Failed to get address from coordinates.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(`Unable to retrieve location: ${error.message}. Please allow location access.`);
      }
    );
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
        "Fan Installation/Repair", // ✇🌫
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

      {/* Payment Dialog */}
      {showPaymentDialog && (
        <div className="custom-dialog-overlay">
          <div className="custom-dialog payment-dialog">
            <div className="dialog-header">
              <h2>Payment - ₹{calculateAmount()}</h2>
            </div>
            <div className="dialog-content">
              <form className="payment-form" onSubmit={handlePaymentSubmit}>
                <div className="card-element-container">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input 
                      type="text" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input 
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => {
                          const formattedValue = formatExpiry(e.target.value);
                          setCardExpiry(formattedValue);
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>CVV</label>
                      <input 
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                        placeholder="123"
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input 
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                
                {paymentError && <div className="error-message">{paymentError}</div>}
                
                <div className="dialog-footer payment-buttons">
                  <button 
                    type="button" 
                    onClick={handleCancelPayment} 
                    className="dialog-button cancel-button"
                    disabled={paymentProcessing}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="dialog-button payment-button"
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? "Processing..." : "Pay Now"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="booking-container">
        <h1>👨‍🔧 Book Your Service 👨‍🔧</h1>
        <form onSubmit={handleFormSubmit}>
          <div className="input-row">
            <label>Your Name:</label>
            <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          
          <div className="input-row">
            <label>Contact Number:</label>
            <input type="text" placeholder="Contact Number" value={contact} onChange={(e) => setContact(e.target.value)} required />
          </div>
          
          <div className="input-row">
            <label>Building Name:</label>
            <input type="text" placeholder="Building Name" value={buildingName} onChange={(e) => setBuildingName(e.target.value)} required />
          </div>
          
          <div className="address-row">
            <label>Address:</label>
            <div className="address-fields">
              <input type="text" placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} required />
              <input type="text" placeholder="Area" value={area} onChange={(e) => setArea(e.target.value)} required />
              <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required />
              <input type="text" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
              <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
            </div>
          </div>

          {/* Get Address Button */}
          <button type="button" onClick={handleGetLocation} className="location-btn">
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
                value={area} 
                onChange={(e) => setArea(e.target.value)} 
                min="100"
                required 
              />
            </div>
          )}

          <h3>Booking Fee: ₹{calculateAmount()}</h3>
          <button type="submit" className="submit-btn">Pay Now</button>
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