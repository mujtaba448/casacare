<?php
require_once 'db.php'; // Database connection

// Set headers for CORS and JSON response
header('Access-Control-Allow-Origin: http://localhost:3000'); // Adjust for frontend
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

try {
    // Fetch all users with the correct field names
    $stmt = $pdo->query("SELECT user_id AS id, username, email, phone FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($users);
} catch (PDOException $e) {
    http_response_code(500);
    // Log the actual error for debugging
    error_log("Error fetching users: " . $e->getMessage());
    echo json_encode(['error' => 'Failed to fetch users.']);
}
?>