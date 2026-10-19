<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json");
require_once __DIR__ . '/../../Config/db.php';

try {
    $uploadsDir = __DIR__ . '/../../uploads/products';
    if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);

    if (empty($_FILES['image'])) {
        echo json_encode(["success" => false, "message" => "No file uploaded"]);
        exit;
    }

    $tmp = $_FILES['image']['tmp_name'];
    $orig = basename($_FILES['image']['name']);
    $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
    $allowed = ['jpg','jpeg','png','gif', 'webp'];

    if (!in_array($ext, $allowed)) {
        echo json_encode(["success" => false, "message" => "Invalid image format"]);
        exit;
    }

    if ($_FILES['image']['size'] > 3 * 1024 * 1024) {
        echo json_encode(["success" => false, "message" => "File too large"]);
        exit;
    }

    $filename = uniqid('prod_', true) . '.' . $ext;
    $target = $uploadsDir . '/' . $filename;

    if (!move_uploaded_file($tmp, $target)) {
        echo json_encode(["success" => false, "message" => "Upload failed"]);
        exit;
    }

    $image_url = 'uploads/products/' . $filename;
    echo json_encode(["success" => true, "image_url" => $image_url]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
