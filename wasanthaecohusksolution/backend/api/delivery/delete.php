<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json");
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
