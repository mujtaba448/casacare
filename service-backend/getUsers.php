<?php
require_once 'db.php'; // Database connection

// Set headers for CORS and JSON response
header('Access-Control-Allow-Origin: http://localhost:3000'); // Adjust for frontend
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

try {
    // Fetch all users
    $stmt = $pdo->query("SELECT id, username, email, phone FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($users);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch users.']);
}
?>
