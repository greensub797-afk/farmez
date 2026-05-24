<?php
include 'db.php';

$email = 'test_full_'.time().'@gmail.com';
$password = 'mypassword123';

// 1. Register
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$sql = "INSERT INTO agencies (agency_name, contact_number, email, password, service_areas, job_types, id_document, clearance_document) 
        VALUES ('Test Agency', '+639123456789', :email, :password, '[]', '[]', 'dummy1', 'dummy2')";
$stmt = $pdo->prepare($sql);
$stmt->execute([':email' => $email, ':password' => $hashed_password]);

echo "Registered agency with email $email\n";

// 2. Login
$stmt2 = $pdo->prepare("SELECT id, agency_name as name, password FROM agencies WHERE email = :email");
$stmt2->execute([':email' => $email]);
$user = $stmt2->fetch();

if (!$user) {
    echo "Login failed: User not found\n";
    exit;
}

if (password_verify($password, $user['password'])) {
    echo "Login successful! Password matched.\n";
} else {
    echo "Login failed: Password verify failed!\n";
    echo "Expected hash: " . $user['password'] . "\n";
}
?>
