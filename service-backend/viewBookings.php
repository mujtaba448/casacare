<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "db.php";

// Get query parameters
$filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
$search = isset($_GET['search']) ? $_GET['search'] : '';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

// Base query with payment info
$baseQuery = "
    SELECT b.id, b.cname, b.contact, b.caddress, b.serviceType, b.problem, 
           b.amount, b.payment_status, b.service_date, b.service_time, b.authCode,
           b.booking_status, b.area, b.card_last_four,
           p.transaction_id, p.payment_date, p.card_holder
    FROM bookings b
    LEFT JOIN payments p ON b.payment_id = p.payment_id
";

// Apply filters
$whereClause = "WHERE 1=1 ";

if ($search) {
    $searchTerm = "%" . $search . "%";
    $whereClause .= "AND (b.cname LIKE :search OR b.contact LIKE :search OR b.caddress LIKE :search OR b.authCode LIKE :search) ";
}

if ($filter !== 'all') {
    if ($filter === 'pending') {
        $whereClause .= "AND b.booking_status = 'pending' ";
    } elseif ($filter === 'confirmed') {
        $whereClause .= "AND b.booking_status = 'confirmed' ";
    } elseif ($filter === 'completed') {
        $whereClause .= "AND b.booking_status = 'completed' ";
    } elseif ($filter === 'cancelled') {
        $whereClause .= "AND b.booking_status = 'cancelled' ";
    } elseif ($filter === 'today') {
        $whereClause .= "AND DATE(b.service_date) = CURDATE() ";
    } elseif ($filter === 'upcoming') {
        $whereClause .= "AND DATE(b.service_date) > CURDATE() ";
    } elseif ($filter === 'past') {
        $whereClause .= "AND DATE(b.service_date) < CURDATE() ";
    }
}

// Count total results
$countQuery = "SELECT COUNT(*) FROM bookings b " . $whereClause;
$countStmt = $pdo->prepare($countQuery);

if ($search) {
    $countStmt->bindParam(':search', $searchTerm);
}

$countStmt->execute();
$totalResults = $countStmt->fetchColumn();
$totalPages = ceil($totalResults / $limit);

// Main query with pagination
$query = $baseQuery . $whereClause . "ORDER BY b.service_date DESC, b.service_time ASC LIMIT :limit OFFSET :offset";
$stmt = $pdo->prepare($query);

if ($search) {
    $stmt->bindParam(':search', $searchTerm);
}

$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();

$bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Format dates and times
foreach ($bookings as &$booking) {
    // Format service date
    if (isset($booking['service_date'])) {
        $booking['service_date_formatted'] = date('d M Y', strtotime($booking['service_date']));
    }
    
    // Format payment date
    if (isset($booking['payment_date'])) {
        $booking['payment_date_formatted'] = date('d M Y H:i', strtotime($booking['payment_date']));
    }
    
    // Ensure card_last_four is masked
    if (isset($booking['card_last_four'])) {
        $booking['card_display'] = 'XXXX-' . $booking['card_last_four'];
    } else {
        $booking['card_display'] = 'N/A';
    }
}

// Return results
echo json_encode([
    'success' => true,
    'data' => $bookings,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => $totalResults,
        'pages' => $totalPages
    ]
]);
?>