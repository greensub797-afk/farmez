<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
include '../db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $fullName = $_POST['fullName'] ?? '';
    $contact = $_POST['contact'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $farmLocation = $_POST['farmLocation'] ?? '';
    $agencyId = $_POST['agencyId'] ?? null;
    $latitude = $_POST['latitude'] ?? null;
    $longitude = $_POST['longitude'] ?? null;

    if (empty($fullName) || empty($contact) || empty($email) || empty($password) || empty($farmLocation)) {
        throw new Exception('Missing required fields');
    }

    // Handle file upload
    if (!isset($_FILES['idUpload']) || $_FILES['idUpload']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('ID document is required');
    }

    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $file = $_FILES['idUpload'];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = 'client_id_' . time() . '_' . uniqid() . '.' . $ext;
    $targetPath = $uploadDir . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception('Failed to save uploaded file');
    }

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert into DB
    $sql = "INSERT INTO clients (full_name, contact, email, password, farm_location, id_document, agency_id, latitude, longitude) 
            VALUES (:full_name, :contact, :email, :password, :farm_location, :id_document, :agency_id, :latitude, :longitude)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':full_name' => trim($fullName),
        ':contact' => trim($contact),
        ':email' => trim($email),
        ':password' => $hashed_password,
        ':farm_location' => trim($farmLocation),
        ':id_document' => 'uploads/' . $fileName,
        ':agency_id' => $agencyId ?: null,
        ':latitude' => $latitude,
        ':longitude' => $longitude
    ]);

    if (!$result) {
        throw new Exception('Database insert failed');
    }

    echo json_encode([
        "status" => "success",
        "message" => "Client registration successful!"
    ]);
} catch (PDOException $e) {
    error_log("PDO Error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage() // In production, don't show exact error
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
