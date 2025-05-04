<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "db.php";

// Receive and decode the JSON data
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data["name"], $data["contact"], $data["address"], $data["serviceType"], $data["amount"], 
    $data["serviceDate"], $data["serviceTime"], $data["authCode"])) {
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

// Sanitize input data
$name = htmlspecialchars(strip_tags($data["name"]));
$contact = htmlspecialchars(strip_tags($data["contact"]));
$address = htmlspecialchars(strip_tags($data["address"]));
$serviceType = htmlspecialchars(strip_tags($data["serviceType"]));
$amount = floatval($data["amount"]);
$area = isset($data["area"]) ? intval($data["area"]) : null;
$problem = isset($data["problem"]) ? htmlspecialchars(strip_tags($data["problem"])) : null;
$serviceDate = htmlspecialchars(strip_tags($data["serviceDate"]));
$serviceTime = htmlspecialchars(strip_tags($data["serviceTime"]));
$authCode = htmlspecialchars(strip_tags($data["authCode"]));

// Payment details
$cardNumber = isset($data["cardNumber"]) ? preg_replace('/\s+/', '', $data["cardNumber"]) : null;
$cardName = isset($data["cardName"]) ? htmlspecialchars(strip_tags($data["cardName"])) : null;
$cardExpiry = isset($data["cardExpiry"]) ? htmlspecialchars(strip_tags($data["cardExpiry"])) : null;

// Generate a unique transaction ID
$transactionId = uniqid('TXN', true);

// Extract last 4 digits of card number for reference
$cardLastFour = null;
if ($cardNumber) {
    $cardLastFour = substr($cardNumber, -4);
    // Encrypt or mask full card number before storage
    // This is just a simple masking for demonstration
    $cardNumber = 'XXXX-XXXX-XXXX-' . $cardLastFour;
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Insert booking information
    $stmt = $pdo->prepare("INSERT INTO bookings (
        cname, contact, caddress, serviceType, area, problem, amount, 
        payment_status, service_date, service_time, authCode, booking_status, card_last_four
    ) VALUES (
        :name, :contact, :address, :serviceType, :area, :problem, :amount, 
        'paid', :serviceDate, :serviceTime, :authCode, 'confirmed', :cardLastFour
    )");

    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":contact", $contact);
    $stmt->bindParam(":address", $address);
    $stmt->bindParam(":serviceType", $serviceType);
    $stmt->bindParam(":area", $area, PDO::PARAM_INT);
    $stmt->bindParam(":problem", $problem);
    $stmt->bindParam(":amount", $amount, PDO::PARAM_STR);
    $stmt->bindParam(":serviceDate", $serviceDate);
    $stmt->bindParam(":serviceTime", $serviceTime);
    $stmt->bindParam(":authCode", $authCode);
    $stmt->bindParam(":cardLastFour", $cardLastFour);

    if (!$stmt->execute()) {
        throw new Exception("Failed to create booking");
    }

    $bookingId = $pdo->lastInsertId();

    // Insert payment information
    $paymentStmt = $pdo->prepare("INSERT INTO payments (
        booking_id, card_number, card_holder, payment_amount, payment_status, transaction_id
    ) VALUES (
        :bookingId, :cardNumber, :cardName, :amount, 'completed', :transactionId
    )");

    $paymentStmt->bindParam(":bookingId", $bookingId);
    $paymentStmt->bindParam(":cardNumber", $cardNumber);
    $paymentStmt->bindParam(":cardName", $cardName);
    $paymentStmt->bindParam(":amount", $amount);
    $paymentStmt->bindParam(":transactionId", $transactionId);

    if (!$paymentStmt->execute()) {
        throw new Exception("Failed to record payment");
    }

    $paymentId = $pdo->lastInsertId();

    // Update booking with payment ID
    $updateStmt = $pdo->prepare("UPDATE bookings SET payment_id = :paymentId WHERE id = :bookingId");
    $updateStmt->bindParam(":paymentId", $paymentId);
    $updateStmt->bindParam(":bookingId", $bookingId);
    
    if (!$updateStmt->execute()) {
        throw new Exception("Failed to update booking with payment information");
    }

    // Commit transaction
    $pdo->commit();

    // Send email notification if needed
    // sendEmailNotification($name, $contact, $serviceType, $problem, $serviceDate, $serviceTime, $authCode);

    // Return success response
    echo json_encode([
        "message" => "Booking successful! Your payment has been processed.",
        "bookingId" => $bookingId,
        "transactionId" => $transactionId
    ]);

} catch (Exception $e) {
    // Roll back transaction on error
    $pdo->rollBack();
    echo json_encode(["error" => "Error processing request: " . $e->getMessage()]);
}
?>