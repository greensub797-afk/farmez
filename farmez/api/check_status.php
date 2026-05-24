<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
include '../db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $data = json_decode(file_get_contents("php://input"), true);
    
    $id = $data['id'] ?? $_POST['id'] ?? null;
    $role = $data['role'] ?? $_POST['role'] ?? null;

    if (!$id || !$role) {
        throw new Exception('Missing user ID or role');
    }

    $table = '';
    if ($role === 'agency') {
        $table = 'agencies';
    } else if ($role === 'client') {
        $table = 'clients';
    } else if ($role === 'worker') {
        $table = 'workers';
    }

    if (empty($table)) {
        throw new Exception('Invalid role');
    }

    $stmt = $pdo->prepare("SELECT status, is_verified FROM $table WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if ($row) {
        // Workers use 'is_available' instead of 'is_verified' in some contexts, but let's just return what we have
        echo json_encode([
            "status" => "success",
            "data" => [
                "status" => $row['status'] ?? 'pending',
                "is_verified" => $row['is_verified'] ?? 0
            ]
        ]);
    } else {
        throw new Exception('User not found');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
