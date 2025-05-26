<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// For debugging - log received data to a file
$logFile = 'payment_log.txt';
$rawData = file_get_contents("php://input");
file_put_contents($logFile, date('Y-m-d H:i:s') . " - Received payment data: " . $rawData . PHP_EOL, FILE_APPEND);

require_once "db.php";

// Decode JSON
$data = json_decode($rawData, true);

// Handle decode failure
if ($data === null) {
    echo json_encode(["error" => "Invalid JSON: " . json_last_error_msg()]);
    exit;
}

// Validate required fields
$required = ["bookingId", "cardNumber", "cardHolder", "expiryMonth", "expiryYear", "cvv", "amount", "paymentMethod"];
$missing = array_filter($required, fn($field) => empty($data[$field]));
if (!empty($missing)) {
    echo json_encode(["error" => "Missing fields: " . implode(", ", $missing)]);
    exit;
}

// Validate booking ID
if (!is_numeric($data["bookingId"])) {
    echo json_encode(["error" => "Invalid booking ID"]);
    exit;
}

// Validate card number using Luhn algorithm
function validateCardNumber($number) {
    // Remove spaces and non-digit characters
    $number = preg_replace('/\D/', '', $number);
    
    // Check if the card number is valid length
    if (strlen($number) < 13 || strlen($number) > 19) {
        return false;
    }
    
    // Apply Luhn algorithm
    $sum = 0;
    $shouldDouble = false;
    
    // Loop through values starting from the rightmost digit
    for ($i = strlen($number) - 1; $i >= 0; $i--) {
        $digit = (int)$number[$i];
        
        if ($shouldDouble) {
            $digit *= 2;
            if ($digit > 9) {
                $digit -= 9;
            }
        }
        
        $sum += $digit;
        $shouldDouble = !$shouldDouble;
    }
    
    return $sum % 10 === 0;
}

// Validate card number
$cardNumber = preg_replace('/\s+/', '', $data["cardNumber"]);
if (!validateCardNumber($cardNumber)) {
    echo json_encode(["error" => "Invalid card number"]);
    exit;
}

// Validate CVV (3-4 digits)
if (strlen($data["cvv"]) < 3 || strlen($data["cvv"]) > 4 || !ctype_digit($data["cvv"])) {
    echo json_encode(["error" => "CVV must be 3-4 digits"]);
    exit;
}

// Validate expiry date
$currentYear = (int)date('Y');
$currentMonth = (int)date('m');
$expiryMonth = (int)$data["expiryMonth"];
$expiryYear = (int)$data["expiryYear"];

if ($expiryYear < $currentYear || ($expiryYear === $currentYear && $expiryMonth < $currentMonth)) {
    echo json_encode(["error" => "Card has expired"]);
    exit;
}

// Sanitize input
$bookingId = (int)$data["bookingId"];
$amount = floatval($data["amount"]);
$paymentMethod = htmlspecialchars(strip_tags($data["paymentMethod"]));
$cardHolder = htmlspecialchars(strip_tags($data["cardHolder"]));
$last4Digits = substr($cardNumber, -4); // Store only last 4 digits for security

// Generate OTP or use provided OTP
$otp = isset($data["otp"]) ? $data["otp"] : rand(100000, 999999);

// Generate a random transaction ID
$transactionId = 'TXN' . time() . rand(1000, 9999);

// Get current date/time
$currentDateTime = date('Y-m-d H:i:s');

// Insert into payments table
try {
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare("INSERT INTO payments (
        booking_id, transaction_id, amount, payment_method, card_number, card_holder, payment_status, otp, created_at
    ) VALUES (
        :booking_id, :transaction_id, :amount, :payment_method, :card_number, :card_holder, :payment_status, :otp, :created_at
    )");

    $paymentStatus = "completed"; // Simulating a successful payment
    
    $stmt->bindParam(":booking_id", $bookingId);
    $stmt->bindParam(":transaction_id", $transactionId);
    $stmt->bindParam(":amount", $amount);
    $stmt->bindParam(":payment_method", $paymentMethod);
    $stmt->bindParam(":card_number", $last4Digits);
    $stmt->bindParam(":card_holder", $cardHolder);
    $stmt->bindParam(":payment_status", $paymentStatus);
    $stmt->bindParam(":otp", $otp);
    $stmt->bindParam(":created_at", $currentDateTime);

    $paymentResult = $stmt->execute();

    // If payment is successful, update the booking status
    if ($paymentResult) {
        $updateStmt = $pdo->prepare("UPDATE bookings SET status = 'confirmed', otp = :otp WHERE id = :booking_id");
        $updateStmt->bindParam(":otp", $otp);
        $updateStmt->bindParam(":booking_id", $bookingId);
        $updateResult = $updateStmt->execute();
        
        if (!$updateResult) {
            // If booking update fails, rollback the transaction
            $pdo->rollBack();
            $error = $updateStmt->errorInfo();
            echo json_encode(["error" => "Failed to update booking status: " . $error[2]]);
            exit;
        }
    } else {
        // If payment insert fails, rollback the transaction
        $pdo->rollBack();
        $error = $stmt->errorInfo();
        echo json_encode(["error" => "Payment processing failed: " . $error[2]]);
        exit;
    }
    
    // Commit the transaction
    $pdo->commit();
    
    // Log successful payment
    file_put_contents('payment_success_log.txt', 
        date('Y-m-d H:i:s') . 
        " - Payment processed successfully: Booking ID: $bookingId, Transaction ID: $transactionId, Amount: $amount, OTP: $otp" . 
        PHP_EOL, FILE_APPEND);
    
    echo json_encode([
        "success" => true,
        "message" => "Payment processed successfully!",
        "transactionId" => $transactionId,
        "paymentId" => $pdo->lastInsertId(),
        "otp" => $otp
    ]);

} catch (Exception $e) {
    // Rollback the transaction in case of any exception
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Log the error
    file_put_contents('payment_error_log.txt', 
        date('Y-m-d H:i:s') . " - Payment Error: " . $e->getMessage() . PHP_EOL, FILE_APPEND);

    echo json_encode(["error" => "Exception: " . $e->getMessage()]);
}
?>