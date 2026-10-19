<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = intval($data['id'] ?? 0);
$first_name = trim($data['first_name'] ?? '');
$last_name = trim($data['last_name'] ?? '');
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (!$id || !$first_name || !$email) {
  echo json_encode(["success" => false, "message" => "Missing required fields"]);
  exit;
}

try {
  if ($password) {
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE customer SET first_name=?, last_name=?, email=?, password=? WHERE id=?");
    $stmt->execute([$first_name, $last_name, $email, $hashed, $id]);
  } else {
    $stmt = $conn->prepare("UPDATE customer SET first_name=?, last_name=?, email=? WHERE id=?");
    $stmt->execute([$first_name, $last_name, $email, $id]);
  }

  echo json_encode(["success" => true, "message" => "Customer updated successfully"]);
} catch (PDOException $e) {
  echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
