<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!isset($_FILES['image'])) {
    echo json_encode(["success" => false, "message" => "No image uploaded"]);
    exit;
}

$uploadDir = __DIR__ . '/../../uploads/husks/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$file = $_FILES['image'];
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$allowed = ['jpg', 'jpeg', 'png', 'webp'];

if (!in_array(strtolower($ext), $allowed)) {
    echo json_encode(["success" => false, "message" => "Invalid image type"]);
    exit;
}

$filename = uniqid('husk_', true) . '.' . $ext;
$target = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $target)) {
    echo json_encode(["success" => true, "url" => "uploads/husks/" . $filename]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to save image"]);
}
