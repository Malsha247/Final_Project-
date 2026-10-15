<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../../config/db.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
  echo json_encode(["success" => false, "message" => "Invalid or missing product ID"]);
  exit;
}

try {
  $stmt = $conn->prepare("SELECT * FROM product WHERE id = ?");
  $stmt->execute([$id]);
  $product = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($product) {
    echo json_encode(["success" => true, "product" => $product]);
  } else {
    echo json_encode(["success" => false, "message" => "Product not found"]);
  }
} catch (PDOException $e) {
  echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
