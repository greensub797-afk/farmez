<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
include '../db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $id = $_POST['id'] ?? null;
    $type = $_POST['type'] ?? null;

    if (!$id || !$type) {
        throw new Exception('Missing user ID or type');
    }

    $table = ($type === 'agency') ? 'agencies' : (($type === 'client') ? 'clients' : null);

    if (!$table) {
        throw new Exception('Invalid user type');
    }

    $sql = "UPDATE $table SET is_verified = 1, status = 'approved' WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([':id' => $id]);

    if (!$result) {
        throw new Exception('Database update failed');
    }

    echo json_encode([
        "status" => "success",
        "message" => "User verified successfully"
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
