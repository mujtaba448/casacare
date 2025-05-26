<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Display detailed errors (remove in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once "db.php";
    
    // Check PDO connection first
    if (!isset($pdo) || !($pdo instanceof PDO)) {
        throw new Exception("Database connection not established properly");
    }
    
    // Simpler query with error handling
    $query = "
        SELECT 
            b.id,
            b.name AS cname,
            b.contact,
            b.address AS caddress,
            b.service_type AS serviceType,
            b.problem,
            b.amount,
            b.service_date,
            b.service_time,
            b.area,
            b.created_at,
            b.status
        FROM 
            bookings b
        ORDER BY 
            b.id DESC
    ";
    
    // Try the main bookings query without JOIN first
    $stmt = $pdo->query($query);
    
    if (!$stmt) {
        $errorInfo = $pdo->errorInfo();
        throw new PDOException("Database query error: " . $errorInfo[2]);
    }
    
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Only if the first query works, try to get payment data separately
    try {
        // For each booking, try to find payment info
        foreach ($bookings as &$booking) {
            $paymentStmt = $pdo->prepare("
                SELECT payment_method, transaction_id, payment_date 
                FROM payments 
                WHERE booking_id = :bookingId
                LIMIT 1
            ");
            $paymentStmt->bindParam(':bookingId', $booking['id'], PDO::PARAM_INT);
            $paymentStmt->execute();
            
            $paymentInfo = $paymentStmt->fetch(PDO::FETCH_ASSOC);
            if ($paymentInfo) {
                $booking['payment_method'] = $paymentInfo['payment_method'];
                $booking['transaction_id'] = $paymentInfo['transaction_id'];
                $booking['payment_date'] = $paymentInfo['payment_date'];
            } else {
                $booking['payment_method'] = null;
                $booking['transaction_id'] = null;
                $booking['payment_date'] = null;
            }
        }
    } catch (PDOException $e) {
        // If payment query fails, just log it but continue with booking data
        file_put_contents(
            'payment_query_error_log.txt', 
            date('Y-m-d H:i:s') . " - Error fetching payment info: " . $e->getMessage() . "\n", 
            FILE_APPEND
        );
    }
    
    // Log successful fetch
    file_put_contents(
        'admin_log.txt', 
        date('Y-m-d H:i:s') . " - Admin fetched " . count($bookings) . " bookings.\n", 
        FILE_APPEND
    );
    
    echo json_encode($bookings);
    
} catch (PDOException $e) {
    // Log the error
    file_put_contents(
        'admin_error_log.txt', 
        date('Y-m-d H:i:s') . " - Error fetching bookings: " . $e->getMessage() . "\n", 
        FILE_APPEND
    );
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch bookings', 
        'message' => $e->getMessage()
    ]);
} catch (Exception $e) {
    // Log general errors
    file_put_contents(
        'admin_error_log.txt', 
        date('Y-m-d H:i:s') . " - General error: " . $e->getMessage() . "\n", 
        FILE_APPEND
    );
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Application error', 
        'message' => $e->getMessage()
    ]);
}
?>