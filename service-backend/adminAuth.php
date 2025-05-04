<?php
// Set headers for CORS and JSON response
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Start the session
session_start();

// Check the action parameter to determine what to do
$action = $_GET['action'] ?? '';

// Handle admin logout
if ($action === 'logout') {
    session_destroy();
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Logout successful."]);
    exit;
}

// Handle admin session check
if ($action === 'check') {
    if (isset($_SESSION['admin_id'])) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Admin is logged in.",
            "user" => [
                "id" => $_SESSION['admin_id'],
                "name" => $_SESSION['admin_name'],
                "email" => $_SESSION['admin_email']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Not logged in."]);
    }
    exit;
}

// If no valid action is provided
http_response_code(400);
echo json_encode(["status" => "error", "message" => "Invalid action."]);
?>
