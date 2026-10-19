<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . "/../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$order_id = $data["order_id"] ?? 0;

if (!$order_id) {
  echo json_encode(["success" => false, "message" => "Invalid order ID"]);
  exit;
}

$stmt = $conn->prepare("DELETE FROM orders WHERE id = ?");
$ok = $stmt->execute([$order_id]);

echo json_encode(["success" => $ok]);
