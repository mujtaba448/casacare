<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "db.php";

// Get the data from the request
$data = json_decode(file_get_contents("php://input"), true);

// Check if the necessary fields are provided
if (!isset($data['id']) || !isset($data['action'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$id = (int)$data['id'];
$action = $data['action'];

try {
    // Start transaction
    $pdo->beginTransaction();
    
    switch ($action) {
        case 'update_status':
            if (!isset($data['status'])) {
                throw new Exception('Status is required');
            }
            
            $status = $data['status'];
            
            // Allowed statuses
            $allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
            if (!in_array($status, $allowedStatuses)) {
                throw new Exception('Invalid status');
            }
            
            $stmt = $pdo->prepare("UPDATE bookings SET booking_status = :status WHERE id = :id");
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            break;
            
        case 'update_payment':
            if (!isset($data['paymentStatus'])) {
                throw new Exception('Payment status is required');
            }
            
            $paymentStatus = $data['paymentStatus'];
            
            // Allowed payment statuses
            $allowedPaymentStatuses = ['pending', 'paid', 'failed'];
            if (!in_array($paymentStatus, $allowedPaymentStatuses)) {
                throw new Exception('Invalid payment status');
            }
            
            $stmt = $pdo->prepare("UPDATE bookings SET payment_status = :paymentStatus WHERE id = :id");
            $stmt->bindParam(':paymentStatus', $paymentStatus);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            break;
            
        case 'update_details':
            // Validate required fields
            $requiredFields = ['name', 'contact', 'address', 'serviceDate', 'serviceTime'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    throw new Exception("Field {$field} is required");
                }
            }
            
            $name = htmlspecialchars(strip_tags($data['name']));
            $contact = htmlspecialchars(strip_tags($data['contact']));
            $address = htmlspecialchars(strip_tags($data['address']));
            $serviceDate = htmlspecialchars(strip_tags($data['serviceDate']));
            $serviceTime = htmlspecialchars(strip_tags($data['serviceTime']));
            
            $stmt = $pdo->prepare("
                UPDATE bookings 
                SET cname = :name, 
                    contact = :contact, 
                    caddress = :address, 
                    service_date = :serviceDate, 
                    service_time = :serviceTime
                WHERE id = :id
            ");
            
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':contact', $contact);
            $stmt->bindParam(':address', $address);
            $stmt->bindParam(':serviceDate', $serviceDate);
            $stmt->bindParam(':serviceTime', $serviceTime);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            break;
            
        default:
            throw new Exception('Invalid action');
    }
    
    // Commit the transaction
    $pdo->commit();
    
    // Get the updated booking
    $stmt = $pdo->prepare("
        SELECT b.id, b.cname, b.contact, b.caddress, b.serviceType, b.problem, 
               b.amount, b.payment_status, b.service_date, b.service_time, b.authCode,
               b.booking_status, b.area, b.card_last_four,
               p.transaction_id, p.payment_date, p.card_holder
        FROM bookings b
        LEFT JOIN payments p ON b.payment_id = p.payment_id
        WHERE b.id = :id
    ");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Booking updated successfully',
        'booking' => $booking
    ]);
    
} catch (Exception $e) {
    // Rollback the transaction in case of error
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>