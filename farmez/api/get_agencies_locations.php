<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
include '../db.php';

try {
    $stmt = $pdo->query("SELECT id, agency_name, latitude, longitude FROM agencies WHERE is_verified = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL");
    $agencies = $stmt->fetchAll();

    echo json_encode([
        "status" => "success",
        "data" => $agencies
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
