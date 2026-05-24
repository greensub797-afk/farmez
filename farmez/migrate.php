<?php
include 'db.php';
try {
    $pdo->exec("ALTER TABLE agencies ADD latitude DECIMAL(10,8) NULL, ADD longitude DECIMAL(11,8) NULL");
    echo "Added lat/lng to agencies.\n";
} catch (Exception $e) {
    echo "Agencies: " . $e->getMessage() . "\n";
}

try {
    $pdo->exec("ALTER TABLE clients ADD agency_id INT NULL, ADD latitude DECIMAL(10,8) NULL, ADD longitude DECIMAL(11,8) NULL");
    echo "Added agency_id, lat, lng to clients.\n";
} catch (Exception $e) {
    echo "Clients: " . $e->getMessage() . "\n";
}

try {
    $pdo->exec("ALTER TABLE clients ADD FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE SET NULL");
    echo "Added foreign key to clients.\n";
} catch (Exception $e) {
    echo "FK: " . $e->getMessage() . "\n";
}
?>
