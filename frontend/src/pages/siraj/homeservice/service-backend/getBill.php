<?php
include 'db.php';

if(isset($_GET['id'])) {
    $bookingID = $_GET['id'];
    $query = "SELECT * FROM bookings WHERE id = '$bookingID'";
    $result = mysqli_query($conn, $query);

    if(mysqli_num_rows($result) > 0) {
        $bill = mysqli_fetch_assoc($result);
        echo json_encode($bill);
    } else {
        echo json_encode([]);
    }
}
?>
