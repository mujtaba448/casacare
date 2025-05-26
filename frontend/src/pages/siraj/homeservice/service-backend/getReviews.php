<?php
// Set CORS headers - very important to prevent network errors
header("Access-Control-Allow-Origin: *"); // Allow requests from any origin
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Allow multiple methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow these headers
header("Access-Control-Max-Age: 3600"); // Cache preflight for 1 hour
header("Content-Type: application/json; charset=UTF-8"); // Specify character encoding

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

// Make sure DB connection exists
require_once "db.php";

// Check if connection is successful
if (!isset($pdo)) {
    error_log("Database connection failed in getReviews.php!");
    echo json_encode([
        "success" => false,
        "error" => "Database connection failed. Please try again later."
    ]);
    exit;
}

try {
    // Fetch service type if provided as query parameter
    $serviceType = isset($_GET['serviceType']) ? $_GET['serviceType'] : null;
    
    // Build query based on whether a service type filter is applied
    if ($serviceType) {
        $stmt = $pdo->prepare("SELECT * FROM reviews WHERE service_type = :service_type ORDER BY timestamp DESC");
        $stmt->bindParam(":service_type", $serviceType);
    } else {
        $stmt = $pdo->query("SELECT * FROM reviews ORDER BY timestamp DESC");
    }
    
    $stmt->execute();
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the data for frontend
    $formattedReviews = array_map(function($review) {
        return [
            'id' => $review['id'],
            'userName' => $review['user_name'],
            'serviceType' => $review['service_type'],
            'rating' => $review['rating'],
            'reviewText' => $review['review_text'],
            'timestamp' => $review['timestamp']
        ];
    }, $reviews);
    
    echo json_encode([
        "success" => true,
        "reviews" => $formattedReviews,
        "count" => count($reviews)
    ]);
    
} catch (Exception $e) {
    // Log the error
    file_put_contents('review_fetch_error_log.txt', date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . PHP_EOL, FILE_APPEND);
    
    echo json_encode([
        "success" => false,
        "error" => "Failed to fetch reviews: " . $e->getMessage()
    ]);
}
?>