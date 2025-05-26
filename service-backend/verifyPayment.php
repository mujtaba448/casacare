<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure this is a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

require_once "db.php";

// Check if booking_id is provided
if (!isset($_GET['booking_id']) || !is_numeric($_GET['booking_id'])) {
    echo json_encode(["error" => "Valid booking ID is required"]);
    exit;
}

$bookingId = (int)$_GET['booking_id'];

try {
    // Get booking and payment details
    $stmt = $pdo->prepare("
        SELECT b.id as booking_id, b.name, b.service_type, b.amount, b.status as booking_status,
               p.id as payment_id, p.transaction_id, p.payment_status, p.created_at as payment_date
        FROM bookings b
        LEFT JOIN payments p ON b.id = p.booking_id
        WHERE b.id = :booking_id
    ");
    
    $stmt->bindParam(":booking_id", $bookingId);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result) {
        echo json_encode(["error" => "Booking not found"]);
        exit;
    }
    
    echo json_encode([
        "success" => true,
        "booking" => [
            "id" => $result['booking_id'],
            "name" => $result['name'],
            "serviceType" => $result['service_type'],
            "amount" => $result['amount'],
            "status" => $result['booking_status']
        ],
        "payment" => $result['payment_id'] ? [
            "id" => $result['payment_id'],
            "transactionId" => $result['transaction_id'],
            "status" => $result['payment_status'],
            "date" => $result['payment_date']
        ] : null
    ]);
    
} catch (Exception $e) {
    echo json_encode(["error" => "Exception: " . $e->getMessage()]);
}
?>