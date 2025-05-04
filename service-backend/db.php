<?php
$host = 'localhost';
$dbname = 'service'; // Change to your actual database name
$username = 'root';
$password = '';

try {
    // Create a PDO instance
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // Enable error reporting
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // Fetch data as associative array
        PDO::ATTR_EMULATE_PREPARES => false, // Disable emulated prepared statements
    ]);
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage()); // Log error (safer than displaying)
    die("Database connection error! Please try again later."); // Generic message for security
}
?>
