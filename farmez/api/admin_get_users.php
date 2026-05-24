<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
include '../db.php';

try {
    $users = [];

    // Fetch Agencies
    $stmt = $pdo->query("SELECT id, agency_name as name, email, contact_number as phone, 
                         is_verified, status, created_at, 'agency' as type 
                         FROM agencies");
    $agencies = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch Clients
    $stmt = $pdo->query("SELECT id, full_name as name, email, contact as phone, 
                         is_verified, status, created_at, 'client' as type 
                         FROM clients");
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $users = array_merge($agencies, $clients);

    // Sort by created_at descending
    usort($users, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });

    echo json_encode([
        "status" => "success",
        "data" => $users
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
