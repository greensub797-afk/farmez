<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
include '../db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (!$data) {
        $data = $_POST; // Fallback to normal POST if JSON is not provided
    }

    if (!$data) {
        throw new Exception('Invalid input data');
    }

    // Required fields based on init.sql
    $required = ['first_name', 'last_name', 'username', 'password', 'email', 'phone'];
    foreach ($required as $field) {
        if (empty(trim($data[$field] ?? ''))) {
            throw new Exception("Missing or empty required field: $field");
        }
    }

    // Hash password
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);

    // Optional fields
    $middle_initial = isset($data['middle_initial']) ? trim($data['middle_initial']) : null;
    $agency_id = isset($data['agency_id']) ? intval($data['agency_id']) : null;
    $skills = isset($data['skills']) ? (is_array($data['skills']) ? json_encode($data['skills']) : $data['skills']) : null;
    $age = isset($data['age']) ? intval($data['age']) : null;

    // Prepared statement
    $sql = "INSERT INTO workers (first_name, last_name, middle_initial, username, password, email, phone, skills, age, agency_id) 
            VALUES (:first_name, :last_name, :middle_initial, :username, :password, :email, :phone, :skills, :age, :agency_id)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':first_name' => trim($data['first_name']),
        ':last_name' => trim($data['last_name']),
        ':middle_initial' => $middle_initial,
        ':username' => trim($data['username']),
        ':password' => $hashed_password,
        ':email' => trim($data['email']),
        ':phone' => trim($data['phone']),
        ':skills' => $skills,
        ':age' => $age,
        ':agency_id' => $agency_id
    ]);

    if (!$result) {
        throw new Exception('Database insert failed');
    }

    echo json_encode([
        "status" => "success",
        "message" => "Worker registration successful!"
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
