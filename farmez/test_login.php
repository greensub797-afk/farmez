<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST['email'] = 'yellow@gmail.com';
$_POST['password'] = 'yellow123'; // assuming they typed something like this, wait, I don't know it. But I can bypass verify just to see if the user is fetched.

include 'db.php';

$email = 'yellow@gmail.com';
$role = 'agency';

$stmt = $pdo->prepare("SELECT id, agency_name as name, password FROM agencies WHERE email = :email");
$stmt->execute([':email' => $email]);
$row = $stmt->fetch();

if ($row) {
    echo "User found in db!\n";
    print_r($row);
} else {
    echo "User NOT found!\n";
}
?>
