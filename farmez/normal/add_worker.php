<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
include '../db.php';

try {
    $input = file_get_contents("php://input");
    error_log("Raw input: " . $input);
    
    $data = json_decode($input, true);
    error_log("Decoded data: " . json_encode($data));

    // Validate input
    if (!$data) {
        throw new Exception('Invalid JSON received');
    }
    
    if (!isset($data['first_name']) || !isset($data['last_name']) || !isset($data['username']) || !isset($data['password']) || !isset($data['email']) || !isset($data['phone'])) {
        throw new Exception('Missing required fields: first_name, last_name, username, password, email, phone');
    }

    // Validate data
    if (empty(trim($data['first_name']))) throw new Exception('First name is required');
    if (empty(trim($data['last_name']))) throw new Exception('Last name is required');
    if (empty(trim($data['username']))) throw new Exception('Username is required');
    if (empty(trim($data['password']))) throw new Exception('Password is required');
    if (empty(trim($data['email']))) throw new Exception('Email is required');
    if (empty(trim($data['phone']))) throw new Exception('Phone is required');

    // Hash password
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);

    // Prepared statement to prevent SQL injection
    $sql = "INSERT INTO workers (first_name, last_name, middle_initial, username, password, email, phone) 
            VALUES (:first_name, :last_name, :middle_initial, :username, :password, :email, :phone)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':first_name' => trim($data['first_name']),
        ':last_name' => trim($data['last_name']),
        ':middle_initial' => isset($data['middle_initial']) ? trim($data['middle_initial']) : '',
        ':username' => trim($data['username']),
        ':password' => $hashed_password,
        ':email' => trim($data['email']),
        ':phone' => trim($data['phone'])
    ]);

    if (!$result) {
        throw new Exception('Database insert failed');
    }

    echo json_encode([
        "status" => "success",
        "message" => "Registration successful! Please log in."
    ]);
} catch (PDOException $e) {
    error_log("PDO Error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Exception: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>