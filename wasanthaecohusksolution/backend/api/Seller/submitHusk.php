<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}


$user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
$owner_name = trim($_POST['owner_name'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$address = trim($_POST['address'] ?? '');
$details = trim($_POST['details'] ?? '');
$lat = isset($_POST['location_lat']) ? trim($_POST['location_lat']) : null;
$lng = isset($_POST['location_lng']) ? trim($_POST['location_lng']) : null;

if (!$user_id || !$owner_name || !$phone || !$address) {
  echo json_encode(["success"=>false,"message"=>"Missing required fields"]);
  exit;
}


$uploadDir = __DIR__ . '/../../uploads/husks/';
$publicPathPrefix = 'uploads/husks/'; //
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

function saveFile($file, $uploadDir) {
  if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) return null;
  $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
  $allowed = ['jpg','jpeg','png','webp'];
  if (!in_array(strtolower($ext), $allowed)) return null;
  $name = time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
  $target = $uploadDir . $name;
  if (move_uploaded_file($file['tmp_name'], $target)) return $name;
  return null;
}

try {
  $conn->beginTransaction();

  $img1 = saveFile($_FILES['image1'] ?? null, $uploadDir);
  $img2 = saveFile($_FILES['image2'] ?? null, $uploadDir);

  $stmt = $conn->prepare("
    INSERT INTO husk_sellers
      (user_id, owner_name, phone, address, location_lat, location_lng, image1, image2, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ");
  $stmt->execute([
    $user_id, $owner_name, $phone, $address,
    $lat === '' ? null : $lat,
    $lng === '' ? null : $lng,
    $img1 ? ($publicPathPrefix . $img1) : null,
    $img2 ? ($publicPathPrefix . $img2) : null,
    $details
  ]);

  $id = $conn->lastInsertId();
  $conn->commit();

  echo json_encode(["success"=>true,"message"=>"Submitted successfully","id"=>$id]);
} catch (Exception $e) {
  if ($conn->inTransaction()) $conn->rollBack();
  echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
