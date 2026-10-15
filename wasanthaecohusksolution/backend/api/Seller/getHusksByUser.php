<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once __DIR__ . '/../../config/db.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
if (!$user_id) {
  echo json_encode(["success"=>false,"message"=>"user_id required"]);
  exit;
}

try {
  $stmt = $conn->prepare("SELECT * FROM husk_sellers WHERE user_id = ? ORDER BY created_at DESC");
  $stmt->execute([$user_id]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode(["success"=>true,"husks"=>$rows]);
} catch (Exception $e) {
  echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
