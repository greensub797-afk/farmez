<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
include '../db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $data = json_decode(file_get_contents("php://input"), true);
    
    // Support both JSON and standard POST
    $email = $data['email'] ?? $_POST['email'] ?? '';
    $password = $data['password'] ?? $_POST['password'] ?? '';
    $role = $data['role'] ?? $_POST['role'] ?? '';

    if (empty($email) || empty($password)) {
        throw new Exception('Email/Username and password are required');
    }

    $user = null;
    $foundRole = '';

    // Check Clients
    if (empty($role) || $role === 'client') {
        $stmt = $pdo->prepare("SELECT id, full_name as name, password, is_verified, status FROM clients WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $row = $stmt->fetch();
        if ($row) {
            $user = $row;
            $foundRole = 'client';
        }
    }

    // Check Agencies
    if (!$user && (empty($role) || $role === 'agency')) {
        $stmt = $pdo->prepare("SELECT id, agency_name as name, password, is_verified, status FROM agencies WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $row = $stmt->fetch();
        if ($row) {
            $user = $row;
            $foundRole = 'agency';
        }
    }

    // Check Workers
    if (!$user && (empty($role) || $role === 'worker')) {
        // Workers might use username or email
        $stmt = $pdo->prepare("SELECT id, CONCAT(first_name, ' ', last_name) as name, password, is_available as is_verified, status FROM workers WHERE email = :email OR username = :email");
        $stmt->execute([':email' => $email]);
        $row = $stmt->fetch();
        if ($row) {
            $user = $row;
            $foundRole = 'worker';
        }
    }

    if (!$user) {
        throw new Exception('Invalid credentials');
    }

    if (password_verify($password, $user['password'])) {
        // Successful login
        echo json_encode([
            "status" => "success",
            "message" => "Login successful",
            "user" => [
                "id" => $user['id'],
                "name" => $user['name'],
                "role" => $foundRole,
                "is_verified" => $user['is_verified'],
                "status" => $user['status']
            ]
        ]);
    } else {
        throw new Exception('Invalid credentials');
    }

} catch (PDOException $e) {
    error_log("PDO Error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Database error"
    ]);
} catch (Exception $e) {
    error_log("Exception: " . $e->getMessage());
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
