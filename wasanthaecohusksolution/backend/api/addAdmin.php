<?php


ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/db.php';


$email = "wasanthaeco2001@gmail.com";
$password_plain = (getenv('BOOTSTRAP_ADMIN_PASSWORD') ?: '');
$name = "System Admin";

if ($password_plain === '') {
    http_response_code(503);
    exit('Admin setup password is not configured.');
}

try {
   
    $password_hashed = password_hash($password_plain, PASSWORD_DEFAULT);

   
    $stmt = $conn->prepare("INSERT INTO admin (email, password, name, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$email, $password_hashed, $name]);

    echo "<h3> Admin added successfully!</h3>";
    echo "<p>Email: $email</p>";
    echo "<p>Hashed Password: $password_hashed</p>";
} catch (PDOException $e) {
    echo " Error: " . $e->getMessage();
}
?>
