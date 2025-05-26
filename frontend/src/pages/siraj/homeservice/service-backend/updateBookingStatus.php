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
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

require_once "db.php";

// Get the POST data
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

// Log the received data
file_put_contents('status_update_log.txt', date('Y-m-d H:i:s') . " - Received data: " . $rawData . "\n", FILE_APPEND);

// Validate required fields
if (!isset($data['bookingId']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields: bookingId and status']);
    exit();
}

// Sanitize and validate input
$bookingId = filter_var($data['bookingId'], FILTER_VALIDATE_INT);
$status = htmlspecialchars(strip_tags($data['status']));

// Validate booking ID
if (!$bookingId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid booking ID']);
    exit();
}

// Validate status value
$allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
if (!in_array(strtolower($status), $allowedStatuses)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status value']);
    exit();
}

try {
    // First, check if the booking exists
    $checkStmt = $pdo->prepare("SELECT id, status FROM bookings WHERE id = :id");
    $checkStmt->bindParam(':id', $bookingId, PDO::PARAM_INT);
    $checkStmt->execute();
    
    $booking = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$booking) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Booking not found']);
        exit();
    }
    
    // Check if the status is already the requested one
    if (strtolower($booking['status']) === strtolower($status)) {
        echo json_encode(['success' => true, 'message' => 'Booking already has this status']);
        exit();
    }
    
    // Update the booking status
    $updateStmt = $pdo->prepare("UPDATE bookings SET status = :status, updated_at = NOW() WHERE id = :id");
    $updateStmt->bindParam(':status', $status, PDO::PARAM_STR);
    $updateStmt->bindParam(':id', $bookingId, PDO::PARAM_INT);
    
    $result = $updateStmt->execute();
    
    if ($result) {
        // Log the successful update
        file_put_contents('status_update_log.txt', 
            date('Y-m-d H:i:s') . " - Successfully updated booking #$bookingId status from {$booking['status']} to $status\n", 
            FILE_APPEND);
        
        echo json_encode(['success' => true, 'message' => 'Booking status updated successfully']);
    } else {
        throw new PDOException("Failed to update status");
    }
    
} catch (PDOException $e) {
    // Log the error
    file_put_contents('status_update_error_log.txt', 
        date('Y-m-d H:i:s') . " - Error updating booking status: " . $e->getMessage() . "\n", 
        FILE_APPEND);
    
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>