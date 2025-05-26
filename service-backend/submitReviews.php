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

// Ensure this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get raw data from request
$rawData = file_get_contents("php://input");

// Debug: Log incoming data
error_log("Raw review data received: " . $rawData);

// Make sure DB connection exists
require_once "db.php";

// Check if connection is successful
if (!isset($pdo)) {
    error_log("Database connection failed!");
    echo json_encode([
        "success" => false,
        "error" => "Database connection failed. Please try again later."
    ]);
    exit;
}

// Decode JSON
$data = json_decode($rawData, true);

// Handle decode failure
if ($data === null) {
    echo json_encode(["error" => "Invalid JSON: " . json_last_error_msg()]);
    exit;
}

// Validate required fields
$required = ["userName", "serviceType", "rating", "reviewText"];
$missing = array_filter($required, fn($field) => empty($data[$field]));
if (!empty($missing)) {
    echo json_encode(["error" => "Missing fields: " . implode(", ", $missing)]);
    exit;
}

// Validate rating (must be between 1 and 5)
$rating = intval($data["rating"]);
if ($rating < 1 || $rating > 5) {
    echo json_encode(["error" => "Rating must be between 1 and 5"]);
    exit;
}

// Sanitize input
$userName = htmlspecialchars(strip_tags($data["userName"]));
$serviceType = htmlspecialchars(strip_tags($data["serviceType"]));
$reviewText = htmlspecialchars(strip_tags($data["reviewText"]));
$timestamp = date('Y-m-d H:i:s'); // Use server timestamp for consistency

// Insert into reviews table
try {
    $stmt = $pdo->prepare("INSERT INTO reviews (
        user_name, service_type, rating, review_text, timestamp
    ) VALUES (
        :user_name, :service_type, :rating, :review_text, :timestamp
    )");

    $stmt->bindParam(":user_name", $userName);
    $stmt->bindParam(":service_type", $serviceType);
    $stmt->bindParam(":rating", $rating);
    $stmt->bindParam(":review_text", $reviewText);
    $stmt->bindParam(":timestamp", $timestamp);

    $result = $stmt->execute();

    if ($result) {
        $reviewId = $pdo->lastInsertId();
        
        // Log successful review submission
        file_put_contents('review_success_log.txt', 
            date('Y-m-d H:i:s') . 
            " - Review submitted: ID: $reviewId, User: $userName, Service: $serviceType, Rating: $rating" . 
            PHP_EOL, FILE_APPEND);
        
        echo json_encode([
            "success" => true,
            "message" => "Review submitted successfully!",
            "reviewId" => $reviewId
        ]);
    } else {
        $error = $stmt->errorInfo();
        echo json_encode(["error" => "DB Insert Failed: " . $error[2]]);
    }

} catch (Exception $e) {
    // Log the error
    file_put_contents('review_error_log.txt', date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . PHP_EOL, FILE_APPEND);

    echo json_encode(["error" => "Exception: " . $e->getMessage()]);
}
?>