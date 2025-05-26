<?php
// File: getBookingHistory.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Connect to the database
require_once 'db_connect.php';

// Get the request data
$data = json_decode(file_get_contents("php://input"), true);

// Check if userId is provided
if (!isset($data['userId']) || empty($data['userId'])) {
    echo json_encode([
        'success' => false,
        'error' => 'User ID is required'
    ]);
    exit;
}

$userId = $data['userId'];

try {
    // Query to get bookings for the user
    $query = "SELECT 
                b.id, 
                b.user_id, 
                b.name, 
                b.contact, 
                b.address, 
                b.service_type AS serviceType, 
                b.problem, 
                b.amount, 
                b.service_date AS serviceDate, 
                b.service_time AS serviceTime, 
                b.area_size AS areaSize, 
                b.status, 
                b.created_at AS createdAt,
                b.cancellation_date AS cancellationDate
              FROM bookings b 
              WHERE b.user_id = ? 
              ORDER BY b.created_at DESC";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'bookings' => $bookings
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>