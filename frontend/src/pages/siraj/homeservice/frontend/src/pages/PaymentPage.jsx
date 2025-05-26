import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentPage.css";

const PaymentPage = () => {
  const navigate = useNavigate();
  
  // State for payment form
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  
  // State for booking details
  const [bookingDetails, setBookingDetails] = useState(null);
  
  // Form submission states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  // Card type detection
  const [cardType, setCardType] = useState("");
  const [cardError, setCardError] = useState("");
  
  // Months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') };
  });
  
  // Years for dropdown (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear + i;
    return { value: year.toString(), label: year.toString() };
  });
  
  // Load booking details from localStorage on component mount
  useEffect(() => {
    const booking = localStorage.getItem("currentBooking");
    
    if (!booking) {
      setErrorMessage("No booking found. Please book a service first.");
      setTimeout(() => {
        navigate("/");
      }, 3000);
      return;
    }
    
    try {
      const parsedBooking = JSON.parse(booking);
      setBookingDetails(parsedBooking);
    } catch (error) {
      console.error("Error parsing booking data:", error);
      setErrorMessage("Invalid booking data.");
    }
  }, [navigate]);
  
  // Format card number with spaces for better readability
  const formatCardNumber = (value) => {
    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, "");
    
    // Check if empty
    if (!cleaned) return "";
    
    // Add space after every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    
    // Detect card type based on first digits
    if (cleaned.startsWith("4")) {
      setCardType("visa");
      setCardError("");
    } else if (/^5[1-5]/.test(cleaned)) {
      setCardType("mastercard");
      setCardError("");
    } else if (/^3[47]/.test(cleaned)) {
      setCardType("amex");
      setCardError("");
    } else if (/^6(?:011|5)/.test(cleaned)) {
      setCardType("discover");
      setCardError("");
    } else if (cleaned.length > 0) {
      setCardType("");
      setCardError("Invalid card number");
    } else {
      setCardType("");
      setCardError("");
    }
    
    return formatted;
  };
  
  // Validate card number using Luhn algorithm
  const isValidCardNumber = (number) => {
    // Remove spaces and non-digit characters
    const value = number.replace(/\D/g, "");
    
    if (!value || value.length < 13 || value.length > 19) {
      return false;
    }
    
    let sum = 0;
    let shouldDouble = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  };
  
  // Handle card number input change
  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    // Limit to 19 characters (16 digits + 3 spaces)
    if (value.length <= 19) {
      setCardNumber(formatCardNumber(value));
    }
  };
  
  // Handle CVV input change
  const handleCvvChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && value.length <= 4)) {
      setCvv(value);
    }
  };
  
  // Handle card holder name input
  const handleCardHolderChange = (e) => {
    const value = e.target.value;
    // Allow only letters and spaces
    if (value === "" || /^[A-Za-z\s]+$/.test(value)) {
      setCardHolder(value);
    }
  };
  
  // Generate random OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setCardError("");
    setIsProcessing(true);
    
    // Basic validations
    if (!cardNumber.trim()) {
      setErrorMessage("Please enter a card number.");
      setIsProcessing(false);
      return;
    }
    
    const cardNumberClean = cardNumber.replace(/\s/g, "");
    if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      setErrorMessage("Card number should be between 13 and 19 digits.");
      setIsProcessing(false);
      return;
    }
    
    if (!isValidCardNumber(cardNumber)) {
      setErrorMessage("Please enter a valid card number.");
      setIsProcessing(false);
      return;
    }
    
    if (!cardHolder.trim()) {
      setErrorMessage("Please enter the cardholder name.");
      setIsProcessing(false);
      return;
    }
    
    if (!expiryMonth || !expiryYear) {
      setErrorMessage("Please select card expiry date.");
      setIsProcessing(false);
      return;
    }
    
    if (cvv.length < 3) {
      setErrorMessage("Please enter a valid CVV.");
      setIsProcessing(false);
      return;
    }
    
    // Check if card type is recognized
    if (!cardType) {
      setErrorMessage("Unsupported card type.");
      setIsProcessing(false);
      return;
    }
    
    // Generate OTP for successful payment
    const generatedOTP = generateOTP();
    
    // Prepare payment data
    const paymentData = {
      bookingId: bookingDetails.bookingId,
      amount: bookingDetails.amount,
      cardNumber: cardNumber.replace(/\s/g, ""), // Remove spaces
      cardHolder,
      expiryMonth,
      expiryYear,
      cvv,
      paymentMethod,
      otp: generatedOTP
    };
    
    try {
      // Send payment data to server
      const response = await fetch("http://localhost/siraj/homeservice/service-backend/processPayment.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });
      
      const data = await response.json();
      setIsProcessing(false);
      
      if (data.success) {
        setPaymentSuccess(true);
        setTransactionId(data.transactionId);
        setOtpCode(data.otp);
        setSuccessMessage(`Payment successful! Transaction ID: ${data.transactionId}`);
        
        // Clear current booking from localStorage
        setTimeout(() => {
          localStorage.removeItem("currentBooking");
        }, 1000);
      } else {
        setErrorMessage(data.error || "Payment failed. Please try again.");
      }
    } catch (error) {
      setIsProcessing(false);
      setErrorMessage("Network error. Please try again.");
      console.error("Payment submission error:", error);
    }
  };
  
  // Handle cancel payment
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this payment? This will cancel your booking.")) {
      navigate("/");
    }
  };
  
  // Go to home page after successful payment
  const goToHome = () => {
    navigate("/");
  };
  
  // Handle receipt download
  const downloadReceipt = () => {
    // Format current date for the receipt
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();
    
    // Create receipt content with HTML for better formatting
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ccc;
            padding: 20px;
          }
          .receipt-header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
          }
          .receipt-title {
            font-size: 18px;
            margin-top: 5px;
          }
          .receipt-section {
            margin-bottom: 20px;
          }
          .receipt-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .receipt-label {
            font-weight: bold;
            width: 40%;
          }
          .receipt-value {
            width: 60%;
          }
          .amount-box {
            background-color: #f9f9f9;
            padding: 10px 15px;
            margin-top: 20px;
            border-radius: 4px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
          }
          .receipt-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="receipt-header">
            <div class="company-name">Home Service Company</div>
            <div class="receipt-title">Payment Receipt</div>
          </div>
          
          <div class="receipt-section">
            <div class="receipt-row">
              <div class="receipt-label">Transaction ID:</div>
              <div class="receipt-value">${transactionId}</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">Payment Date:</div>
              <div class="receipt-value">${formattedDate}</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">Payment Method:</div>
              <div class="receipt-value">${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} Card</div>
            </div>
          </div>
          
          <div class="receipt-section">
            <h3>Customer Details</h3>
            <div class="receipt-row">
              <div class="receipt-label">Customer Name:</div>
              <div class="receipt-value">${bookingDetails.name}</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">Contact Number:</div>
              <div class="receipt-value">${bookingDetails.contact}</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">Address:</div>
              <div class="receipt-value">${bookingDetails.address}</div>
            </div>
          </div>
          
          <div class="receipt-section">
            <h3>Service Details</h3>
            <div class="receipt-row">
              <div class="receipt-label">Service Type:</div>
              <div class="receipt-value">${bookingDetails.serviceType}</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">Service Problem:</div>
              <div class="receipt-value">${bookingDetails.problem}</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">Scheduled Date:</div>
              <div class="receipt-value">${bookingDetails.serviceDate}</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">Scheduled Time:</div>
              <div class="receipt-value">${bookingDetails.serviceTime}</div>
            </div>
          </div>
          
          <div class="amount-box">
            <span>Total Amount Paid:</span>
            <span>₹${bookingDetails.amount}</span>
          </div>
          
          <div class="receipt-section">
            <h3>Service Provider Details</h3>
            <div class="receipt-row">
              <div class="receipt-label">OTP Code:</div>
              <div class="receipt-value">${otpCode} (Show this to service provider)</div>
            </div>
          </div>
          
          <div class="receipt-footer">
            <p>Thank you for choosing our services!</p>
            <p>For any assistance, please contact our customer support.</p>
            <p>This is a computer-generated receipt and does not require a signature.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Create a Blob for the HTML content
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment_receipt_${transactionId}.html`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  // Render booking details
  const renderBookingDetails = () => {
    if (!bookingDetails) return null;
    
    return (
      <div className="booking-summary">
        <h3>Booking Summary</h3>
        <div className="summary-details">
          <p><strong>Service Type:</strong> {bookingDetails.serviceType}</p>
          <p><strong>Problem:</strong> {bookingDetails.problem}</p>
          <p><strong>Service Date:</strong> {bookingDetails.serviceDate}</p>
          <p><strong>Service Time:</strong> {bookingDetails.serviceTime}</p>
          <p><strong>Name:</strong> {bookingDetails.name}</p>
          <p><strong>Contact:</strong> {bookingDetails.contact}</p>
          <div className="amount-box">
            <span>Total Amount:</span>
            <span className="amount">₹{bookingDetails.amount}</span>
          </div>
        </div>
      </div>
    );
  };
  
  // If payment is successful, show success screen with OTP
  if (paymentSuccess) {
    return (
      <div className="payment-success-container">
        <div className="payment-success">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Thank you for your payment.</p>
          <p>Transaction ID: <strong>{transactionId}</strong></p>
          <p>Amount Paid: <strong>₹{bookingDetails?.amount}</strong></p>
          
          <div className="otp-container">
            <h3>Your OTP Code</h3>
            <div className="otp-code">{otpCode}</div>
            <p className="otp-instruction">Please show this OTP to the service provider upon arrival</p>
          </div>
          
          <p>Your service booking has been confirmed.</p>
          <p>Our professional will arrive at your address on:</p>
          <p><strong>{bookingDetails?.serviceDate} at {bookingDetails?.serviceTime}</strong></p>
          <div className="success-buttons">
            <button onClick={goToHome} className="home-btn">Back to Home</button>
            <button onClick={downloadReceipt} className="download-receipt-btn">Download Receipt</button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="payment-page-container">
      <div className="payment-container">
        <h1>Payment Gateway</h1>
        <p className="secure-text">🔒 Secure Payment</p>
        
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <div className="payment-content">
          {renderBookingDetails()}
          
          <div className="payment-form-container">
            <div className="card-container">
              <div className={`card ${cardType}`}>
                <div className="card-logo">
                  {cardType && (
                    <div className={`card-type ${cardType}`}>
                      {cardType === "visa" && "VISA"}
                      {cardType === "mastercard" && "MasterCard"}
                      {cardType === "amex" && "AMEX"}
                      {cardType === "discover" && "Discover"}
                    </div>
                  )}
                </div>
                <div className="chip"></div>
                <div className="card-number">
                  {cardNumber || "•••• •••• •••• ••••"}
                </div>
                <div className="card-details">
                  <div className="card-holder">
                    <span>Card Holder</span>
                    <div>{cardHolder || "YOUR NAME"}</div>
                  </div>
                  <div className="card-expiry">
                    <span>Expires</span>
                    <div>{expiryMonth || "MM"}/{expiryYear?.slice(-2) || "YY"}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-methods">
                  <label className={`payment-method ${paymentMethod === "credit" ? "selected" : ""}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="credit" 
                      checked={paymentMethod === "credit"}
                      onChange={() => setPaymentMethod("credit")}
                    />
                    <span className="method-icon credit">💳</span>
                    <span>Credit Card</span>
                  </label>
                  <label className={`payment-method ${paymentMethod === "debit" ? "selected" : ""}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="debit"
                      checked={paymentMethod === "debit"}
                      onChange={() => setPaymentMethod("debit")}
                    />
                    <span className="method-icon debit">💳</span>
                    <span>Debit Card</span>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label>Card Number</label>
                <input 
                  type="text" 
                  value={cardNumber} 
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className={`card-number-input ${cardError ? 'input-error' : ''}`}
                  required
                />
                {cardError && <div className="field-error">{cardError}</div>}
              </div>
              
              <div className="form-group">
                <label>Card Holder Name</label>
                <input 
                  type="text" 
                  value={cardHolder} 
                  onChange={handleCardHolderChange}
                  placeholder="Name as on card"
                  required
                />
              </div>
              
              <div className="card-extra-details">
                <div className="form-group expiration">
                  <label>Expiration Date</label>
                  <div className="expiry-inputs">
                    <select
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                      required
                    >
                      <option value="">MM</option>
                      {months.map(month => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                    </select>
                    <span>/</span>
                    <select
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value)}
                      required
                    >
                      <option value="">YYYY</option>
                      {years.map(year => (
                        <option key={year.value} value={year.value}>{year.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group cvv">
                  <label>CVV Code</label>
                  <input 
                    type="password" 
                    value={cvv} 
                    onChange={handleCvvChange}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                  <span className="cvv-info" title="3-4 digit security code on the back of your card">?</span>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="pay-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Pay ₹${bookingDetails?.amount || "0"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="payment-footer">
          <p>This payment is secured by advanced encryption. Your card details are safe with us.</p>
          <div className="payment-logos">
            <span className="logo visa">VISA</span>
            <span className="logo mastercard">MasterCard</span>
            <span className="logo amex">American Express</span>
            <span className="logo discover">Discover</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;