<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

require_once __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = intval($data['id'] ?? 0);

if (!$id) {
  echo json_encode(["success" => false, "message" => "Invalid ID"]);
  exit;
}

$stmt = $conn->prepare("DELETE FROM delivery_persons WHERE id = ?");
$success = $stmt->execute([$id]);

echo json_encode([
  "success" => $success,
  "message" => $success ? "Deleted" : "Delete failed"
]);
