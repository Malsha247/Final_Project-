<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === 'http://localhost:3000') {
  header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$date = $data['date'] ?? '';
$bags = intval($data['bags'] ?? 0);

if (!$date || $bags <= 0) {
  echo json_encode(["success" => false, "message" => "Invalid data"]);
  exit;
}

$stmt = $conn->prepare("
  INSERT INTO husk_production (production_date, bags_cut)
  VALUES (?, ?)
  ON DUPLICATE KEY UPDATE bags_cut = VALUES(bags_cut)
");
$stmt->execute([$date, $bags]);

echo json_encode(["success" => true]);
