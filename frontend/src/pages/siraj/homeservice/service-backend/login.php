<?php
require_once 'db.php'; // Include database connection file

// Set headers for CORS and JSON response
header('Access-Control-Allow-Origin: http://localhost:3000'); // Adjust the domain to match your frontend
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the input data from the frontend
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate and sanitize input data
    $username = htmlspecialchars(trim($data['username'] ?? ''));
    $password = $data['password'] ?? '';

    // Check if the username and password are provided
    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password are required.']);
        exit;
    }

    // Prepare the SQL statement to select the user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        // Login successful, return the user data without the password
        unset($user['password']); // Remove password before sending user data
        http_response_code(200);
        echo json_encode(['message' => 'Login successful.', 'user' => $user]);
    } else {
        // Invalid username or password
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username or password.']);
    }
} else {
    // Handle non-POST requests
    http_response_code(405);
    echo json_encode(['error' => 'Invalid request method.']);
}
?>