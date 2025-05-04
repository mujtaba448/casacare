<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "db.php";

// Receive payment verification or status update requests
$data = json_decode(file_get_contents("php://input"), true);

// Function to validate card (simplified for demonstration)
function validateCard($cardNumber, $expiry, $cvv) {
    // Remove spaces from card number
    $cardNumber = preg_replace('/\s+/', '', $cardNumber);
    
    // Basic validation
    if (strlen($cardNumber) < 13 || strlen($cardNumber) > 19) {
        return false;
    }
    
    // Check if expiry is valid
    list($month, $year) = explode('/', $expiry);
    $month = (int)$month;
    $year = (int)("20" . $year); // Assume 20xx format
    
    $currentYear = (int)date('Y');
    $currentMonth = (int)date('m');
    
    if ($year < $currentYear || ($year === $currentYear && $month < $currentMonth)) {
        return false;
    }
    
    // Simple Luhn algorithm check for card number validity
    $sum = 0;
    $alt = false;
    
    for ($i = strlen($cardNumber) - 1; $i >= 0; $i--) {
        $n = (int)$cardNumber[$i];
        
        if ($alt) {
            $n *= 2;
            if ($n > 9) {
                $n = ($n % 10) + 1;
            }
        }
        
        $sum += $n;
        $alt = !$alt;
    }
    
    return ($sum % 10 === 0);
}

if (isset($data['action']) && $data['action'] === 'validate_card') {
    // Extract card details
    $cardNumber = isset($data['cardNumber']) ? preg_replace('/\s+/', '', $data['cardNumber']) : '';
    $cardExpiry = isset($data['cardExpiry']) ? $data['cardExpiry'] : '';
    $cardCvv = isset($data['cardCvv']) ? $data['cardCvv'] : '';
    
    // Validate card
    $isValid = validateCard($cardNumber, $cardExpiry, $cardCvv);
    
    echo json_encode([
        'valid' => $isValid,
        'message' => $isValid ? 'Card is valid' : 'Invalid card details'
    ]);
    exit;
}

if (isset($data['action']) && $data['action'] === 'payment_status') {
    if (!isset($data['bookingId'])) {
        echo json_encode(['error' => 'Booking ID required']);
        exit;
    }
    
    $bookingId = (int)$data['bookingId'];
    
    try {
        $stmt = $pdo->prepare("
            SELECT b.id, b.cname, b.serviceType, b.problem, b.amount, b.payment_status, 
                   b.service_date, b.service_time, b.authCode, b.booking_status,
                   p.payment_date, p.transaction_id, p.card_last_four
            FROM bookings b
            LEFT JOIN payments p ON b.payment_id = p.payment_id
            WHERE b.id = :bookingId
        ");
        $stmt->bindParam(':bookingId', $bookingId);
        $stmt->execute();
        
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($booking) {
            echo json_encode([
                'success' => true,
                'booking' => $booking
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Booking not found'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
    exit;
}

if (isset($data['action']) && $data['action'] === 'cancel_booking') {
    if (!isset($data['bookingId'], $data['authCode'])) {
        echo json_encode(['error' => 'Booking ID and Auth Code required']);
        exit;
    }
    
    $bookingId = (int)$data['bookingId'];
    $authCode = $data['authCode'];
    
    try {
        // Verify booking exists with matching auth code
        $checkStmt = $pdo->prepare("SELECT id FROM bookings WHERE id = :bookingId AND authCode = :authCode");
        $checkStmt->bindParam(':bookingId', $bookingId);
        $checkStmt->bindParam(':authCode', $authCode);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() === 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid booking ID or authentication code'
            ]);
            exit;
        }
        
        // Update booking status to cancelled
        $updateStmt = $pdo->prepare("UPDATE bookings SET booking_status = 'cancelled' WHERE id = :bookingId");
        $updateStmt->bindParam(':bookingId', $bookingId);
        $updateStmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Booking cancelled successfully'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
    exit;
}

// Default response for invalid requests
echo json_encode(['error' => 'Invalid action or missing parameters']);
?>