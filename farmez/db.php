<?php
// ============================================================
//  db.php  —  FarmEZ Database Connection (PDO)
//  Place this ONE level above your api/ folder, e.g.:
//      /var/www/html/farmez/db.php
//      /var/www/html/farmez/api/login.php  ← include '../db.php'
// ============================================================

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'farmez_db');
define('DB_USER', 'root');   // Default XAMPP username
define('DB_PASS', '');       // Default XAMPP password (empty)
define('DB_CHARSET', 'utf8mb4');

$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=%s',
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_CHARSET
);

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,   // throw on error
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,         // arrays, not objects
    PDO::ATTR_EMULATE_PREPARES   => false,                     // real prepared statements
    PDO::ATTR_PERSISTENT         => false,
];

try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    // Never expose the real error to the client in production
    error_log('DB Connection failed: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status'  => 'error',
        'message' => 'Database connection failed. Please try again later.'
    ]);
    exit;
}