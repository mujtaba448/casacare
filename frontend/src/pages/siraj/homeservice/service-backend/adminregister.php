<?php
// Allow CORS for frontend communication
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection
$host = 'localhost';
$dbname = 'service'; // Database name
$username = 'root';  // Default XAMPP username
$password = '';      // Default XAMPP password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Handle Admin Registration (POST request)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $name = trim($input['name'] ?? '');
    $email = filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password = $input['password'] ?? '';

    // Validate input
    if (empty($name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "All fields are required."]);
        exit;
    }

    try {
        // Check if email already exists
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = :email");
        $stmt->execute([':email' => $email]);

        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email already registered."]);
            exit;
        }

        // Hash password and insert admin
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO admins (name, email, password) VALUES (:name, :email, :password)");
        $stmt->execute([':name' => $name, ':email' => $email, ':password' => $hashedPassword]);

        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Admin registered successfully."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
