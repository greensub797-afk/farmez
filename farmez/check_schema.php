<?php
include 'db.php';
try {
    $stmt = $pdo->query("DESCRIBE clients");
    echo "Clients Table Columns:\n";
    print_r($stmt->fetchAll(PDO::FETCH_COLUMN));

    $stmt = $pdo->query("DESCRIBE agencies");
    echo "Agencies Table Columns:\n";
    print_r($stmt->fetchAll(PDO::FETCH_COLUMN));

    $stmt = $pdo->query("DESCRIBE workers");
    echo "Workers Table Columns:\n";
    print_r($stmt->fetchAll(PDO::FETCH_COLUMN));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
