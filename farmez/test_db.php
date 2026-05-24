<?php
include 'db.php';
try {
    $stmt = $pdo->query("SELECT * FROM agencies");
    $agencies = $stmt->fetchAll();
    echo "Agencies in DB:\n";
    print_r($agencies);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
