<?php
// Database configuration
$db_host = 'localhost';  // Usually 'localhost' for local development
$db_name = 'service';  // Your database name
$db_user = 'root';  // Your database username - change in production!
$db_pass = '';  // Your database password - change in production!

// Error handling
try {
    // Create a PDO instance
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            // Set error mode to exceptions
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            // Return rows as associative arrays
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // Prevent PDO from converting numeric values to strings
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    // Log error and exit (don't expose sensitive info in production)
    error_log('Database Connection Error: ' . $e->getMessage());
    throw new Exception('Database connection failed');
}
?>