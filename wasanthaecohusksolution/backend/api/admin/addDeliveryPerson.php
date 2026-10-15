<?php
require_once __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$email = $data['email'];
$phone = $data['phone'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

$stmt = $conn->prepare(
    "INSERT INTO delivery_persons (name, email, phone, password)
     VALUES (?, ?, ?, ?)"
);
$stmt->execute([$name, $email, $phone, $password]);

echo json_encode(["success" => true, "message" => "Delivery person added"]);
