<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "db.php";

// Get booking history for a user
function getBookingHistory($userId) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT b.id, b.user_id, b.service_type, b.problem, b.service_date, b.service_time, 
                   b.name, b.contact, b.address, b.amount, b.status, b.otp, b.created_at,
                   c.reason as cancellation_reason, c.created_at as cancellation_date
            FROM bookings b
            LEFT JOIN cancellations c ON b.id = c.booking_id
            WHERE b.user_id = :user_id
            ORDER BY b.created_at DESC
        ");
        
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            "success" => true,
            "bookings" => $bookings
        ];
    } catch (Exception $e) {
        return [
            "success" => false,
            "error" => "Error fetching booking history: " . $e->getMessage()
        ];
    }
}

// Cancel a booking
function cancelBooking($bookingId, $userId, $reason) {
    global $pdo;
    
    try {
        $pdo->beginTransaction();
        
        // First verify this booking belongs to this user
        $checkStmt = $pdo->prepare("SELECT id, status FROM bookings WHERE id = :booking_id AND user_id = :user_id");
        $checkStmt->bindParam(":booking_id", $bookingId);
        $checkStmt->bindParam(":user_id", $userId);
        $checkStmt->execute();
        
        $booking = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$booking) {
            return [
                "success" => false,
                "error" => "Booking not found or doesn't belong to this user"
            ];
        }
        
        // Check if booking status allows cancellation
        $status = strtolower($booking['status']);
        if ($status !== 'pending' && $status !== 'confirmed') {
            return [
                "success" => false,
                "error" => "Cannot cancel a booking with status: " . $status
            ];
        }
        
        // Update booking status to cancelled
        $updateStmt = $pdo->prepare("UPDATE bookings SET status = 'cancelled' WHERE id = :booking_id");
        $updateStmt->bindParam(":booking_id", $bookingId);
        $updateSuccess = $updateStmt->execute();
        
        if (!$updateSuccess) {
            $pdo->rollBack();
            return [
                "success" => false,
                "error" => "Failed to update booking status"
            ];
        }
        
        // Record cancellation details
        $insertStmt = $pdo->prepare("
            INSERT INTO cancellations (booking_id, user_id, reason, created_at)
            VALUES (:booking_id, :user_id, :reason, NOW())
        ");
        
        $insertStmt->bindParam(":booking_id", $bookingId);
        $insertStmt->bindParam(":user_id", $userId);
        $insertStmt->bindParam(":reason", $reason);
        $insertSuccess = $insertStmt->execute();
        
        if (!$insertSuccess) {
            $pdo->rollBack();
            return [
                "success" => false,
                "error" => "Failed to record cancellation details"
            ];
        }
        
        // If there's a payment associated with this booking, mark it for refund
        // This is just a placeholder - actual refund processing would depend on your payment system
        $paymentStmt = $pdo->prepare("
            UPDATE payments 
            SET payment_status = 'refund_pending', 
                notes = CONCAT(IFNULL(notes, ''), ' Cancelled on ', NOW())
            WHERE booking_id = :booking_id
        ");
        $paymentStmt->bindParam(":booking_id", $bookingId);
        $paymentStmt->execute();
        
        $pdo->commit();
        
        // Log the cancellation
        $logFile = 'cancellation_log.txt';
        $logMsg = date('Y-m-d H:i:s') . " - Booking ID: $bookingId, User ID: $userId, Reason: $reason" . PHP_EOL;
        file_put_contents($logFile, $logMsg, FILE_APPEND);
        
        return [
            "success" => true,
            "message" => "Booking cancelled successfully"
        ];
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        
        return [
            "success" => false,
            "error" => "Error cancelling booking: " . $e->getMessage()
        ];
    }
}

// Process the request based on method
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get booking history
    if (!isset($_GET['user_id']) || !is_numeric($_GET['user_id'])) {
        echo json_encode(["success" => false, "error" => "Valid user ID is required"]);
        exit();
    }
    
    $userId = (int)$_GET['user_id'];
    $result = getBookingHistory($userId);
    echo json_encode($result);
} 
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Cancel booking
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate request
    if (!isset($data['booking_id']) || !isset($data['user_id']) || !isset($data['reason'])) {
        echo json_encode([
            "success" => false,
            "error" => "Missing required fields: booking_id, user_id, and reason are required"
        ]);
        exit();
    }
    
    // Validate and sanitize inputs
    $bookingId = (int)$data['booking_id'];
    $userId = (int)$data['user_id'];
    $reason = htmlspecialchars(trim($data['reason']));
    
    if (empty($reason)) {
        echo json_encode([
            "success" => false,
            "error" => "Cancellation reason cannot be empty"
        ]);
        exit();
    }
    
    $result = cancelBooking($bookingId, $userId, $reason);
    echo json_encode($result);
} 
else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>