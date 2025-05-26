<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

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

// For debugging - log received data to a file
$logFile = 'booking_log.txt';
$rawData = file_get_contents("php://input");
file_put_contents($logFile, date('Y-m-d H:i:s') . " - Received data: " . $rawData . PHP_EOL, FILE_APPEND);

require_once "db.php";

// Decode JSON
$data = json_decode($rawData, true);

// Handle decode failure
if ($data === null) {
    echo json_encode(["error" => "Invalid JSON: " . json_last_error_msg()]);
    exit;
}

// Validate required fields
$required = ["name", "contact", "address", "serviceType", "amount", "serviceDate", "serviceTime"];
$missing = array_filter($required, fn($field) => empty($data[$field]));
if (!empty($missing)) {
    echo json_encode(["error" => "Missing fields: " . implode(", ", $missing)]);
    exit;
}

// Validate contact number (must be 10 digits)
if (strlen($data["contact"]) !== 10 || !ctype_digit($data["contact"])) {
    echo json_encode(["error" => "Contact number must be 10 digits"]);
    exit;
}

// Sanitize input
$name         = htmlspecialchars(strip_tags($data["name"]));
$contact      = htmlspecialchars(strip_tags($data["contact"]));
$address      = htmlspecialchars(strip_tags($data["address"]));
$serviceType  = htmlspecialchars(strip_tags($data["serviceType"]));
$problem      = isset($data["problem"]) ? htmlspecialchars(strip_tags($data["problem"])) : '';
$amount       = floatval($data["amount"]);
$area         = isset($data["area"]) ? intval($data["area"]) : null;
$serviceDate  = htmlspecialchars(strip_tags($data["serviceDate"]));
$serviceTime  = htmlspecialchars(strip_tags($data["serviceTime"]));

// Get the current date/time for created_at
$currentDateTime = date('Y-m-d H:i:s');

// Insert into bookings
try {
    $stmt = $pdo->prepare("INSERT INTO bookings (
        name, contact, address, service_type, problem, amount, service_date, service_time, area, created_at, status
    ) VALUES (
        :name, :contact, :address, :service_type, :problem, :amount, :service_date, :service_time, :area, :created_at, :status
    )");

    $status = "pending"; // Initial status is pending until payment

    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":contact", $contact);
    $stmt->bindParam(":address", $address);
    $stmt->bindParam(":service_type", $serviceType);
    $stmt->bindParam(":problem", $problem);
    $stmt->bindParam(":amount", $amount);
    $stmt->bindParam(":service_date", $serviceDate);
    $stmt->bindParam(":service_time", $serviceTime);
    $stmt->bindParam(":area", $area, PDO::PARAM_INT);
    $stmt->bindParam(":created_at", $currentDateTime);
    $stmt->bindParam(":status", $status);

    $result = $stmt->execute();

    if ($result) {
        $bookingId = $pdo->lastInsertId();
        
        // Log successful booking
        file_put_contents('booking_success_log.txt', 
            date('Y-m-d H:i:s') . 
            " - Booking created: ID: $bookingId, Name: $name, Contact: $contact, Service: $serviceType, Amount: $amount" . 
            PHP_EOL, FILE_APPEND);
        
        echo json_encode([
            "success" => true,
            "message" => "Booking details saved! Proceed to payment.", 
            "bookingId" => $bookingId
        ]);
    } else {
        $error = $stmt->errorInfo();
        echo json_encode(["error" => "DB Insert Failed: " . $error[2]]);
    }

} catch (Exception $e) {
    // Log the error
    file_put_contents('booking_error_log.txt', date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . PHP_EOL, FILE_APPEND);

    echo json_encode(["error" => "Exception: " . $e->getMessage()]);
}
?>