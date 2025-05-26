<?php
// File: cancelBooking.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just exit with 200 OK status
    exit(0);
}

// Connect to the database
require_once 'db_connect.php';

// Get the request data
$data = json_decode(file_get_contents("php://input"), true);

// Check if bookingId and userId are provided
if (!isset($data['bookingId']) || empty($data['bookingId']) || !isset($data['userId']) || empty($data['userId'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Booking ID and User ID are required'
    ]);
    exit;
}

$bookingId = $data['bookingId'];
$userId = $data['userId'];

try {
    // Check if the booking exists and belongs to the user
    $checkQuery = "SELECT id, status FROM bookings WHERE id = ? AND user_id = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param("ii", $bookingId, $userId);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Booking not found or does not belong to this user'
        ]);
        exit;
    }
    
    $booking = $result->fetch_assoc();
    
    // Check if the booking is already cancelled or completed
    if ($booking['status'] === 'Cancelled') {
        echo json_encode([
            'success' => false,
            'error' => 'This booking has already been cancelled'
        ]);
        exit;
    }
    
    if ($booking['status'] === 'Completed') {
        echo json_encode([
            'success' => false,
            'error' => 'Completed bookings cannot be cancelled'
        ]);
        exit;
    }
    
    // Update the booking status to Cancelled and set cancellation date
    $today = date('Y-m-d');
    $updateQuery = "UPDATE bookings SET status = 'Cancelled', cancellation_date = ? WHERE id = ?";
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->bind_param("si", $today, $bookingId);
    $updateResult = $updateStmt->execute();
    
    if ($updateResult) {
        echo json_encode([
            'success' => true,
            'message' => 'Booking cancelled successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to cancel booking'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>