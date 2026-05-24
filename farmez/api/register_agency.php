<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
include '../db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $agencyName = $_POST['agencyName'] ?? '';
    $contactNumber = $_POST['contactNumber'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $serviceAreas = $_POST['serviceAreas'] ?? '[]'; // Should be JSON string
    $jobTypes = $_POST['jobTypes'] ?? '[]'; // Should be JSON string
    $latitude = $_POST['latitude'] ?? null;
    $longitude = $_POST['longitude'] ?? null;

    if (empty($agencyName) || empty($contactNumber) || empty($email) || empty($password)) {
        throw new Exception('Missing required fields');
    }

    // Handle file uploads
    if (!isset($_FILES['idUpload']) || $_FILES['idUpload']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Agency ID document is required');
    }
    if (!isset($_FILES['clearanceUpload']) || $_FILES['clearanceUpload']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Barangay Clearance document is required');
    }

    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $idFile = $_FILES['idUpload'];
    $idExt = pathinfo($idFile['name'], PATHINFO_EXTENSION);
    $idFileName = 'agency_id_' . time() . '_' . uniqid() . '.' . $idExt;
    $idTargetPath = $uploadDir . $idFileName;

    if (!move_uploaded_file($idFile['tmp_name'], $idTargetPath)) {
        throw new Exception('Failed to save Agency ID document');
    }

    $clearanceFile = $_FILES['clearanceUpload'];
    $clearanceExt = pathinfo($clearanceFile['name'], PATHINFO_EXTENSION);
    $clearanceFileName = 'agency_clearance_' . time() . '_' . uniqid() . '.' . $clearanceExt;
    $clearanceTargetPath = $uploadDir . $clearanceFileName;

    if (!move_uploaded_file($clearanceFile['tmp_name'], $clearanceTargetPath)) {
        throw new Exception('Failed to save Barangay Clearance document');
    }

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert into DB
    $sql = "INSERT INTO agencies (agency_name, contact_number, email, password, service_areas, job_types, id_document, clearance_document, latitude, longitude) 
            VALUES (:agency_name, :contact_number, :email, :password, :service_areas, :job_types, :id_document, :clearance_document, :latitude, :longitude)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':agency_name' => trim($agencyName),
        ':contact_number' => trim($contactNumber),
        ':email' => trim($email),
        ':password' => $hashed_password,
        ':service_areas' => $serviceAreas,
        ':job_types' => $jobTypes,
        ':id_document' => 'uploads/' . $idFileName,
        ':clearance_document' => 'uploads/' . $clearanceFileName,
        ':latitude' => $latitude,
        ':longitude' => $longitude
    ]);

    if (!$result) {
        throw new Exception('Database insert failed');
    }

    echo json_encode([
        "status" => "success",
        "message" => "Agency registration successful!"
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
