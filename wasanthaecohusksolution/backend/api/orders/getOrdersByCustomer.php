<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/db.php';

$user_id = $_GET['user_id'] ?? 0;
$stmt = $conn->prepare("SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC");
$stmt->execute([$user_id]);
echo json_encode(["success" => true, "orders" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
