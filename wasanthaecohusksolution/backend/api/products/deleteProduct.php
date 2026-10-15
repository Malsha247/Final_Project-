<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/db.php';


$raw = file_get_contents("php://input");
$data = json_decode($raw, true);
if (!$data) $data = $_POST ?? [];

$id = isset($data['id']) ? (int)$data['id'] : 0;
if ($id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid or missing product id."]);
    exit;
}

try {

    $stmt = $conn->prepare("SELECT image_url FROM product WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(["success" => false, "message" => "Product not found."]);
        exit;
    }

   
    if (!empty($row['image_url'])) {
        
        $relativePath = $row['image_url'];
      
        $filePath = realpath(__DIR__ . '/../../' . $relativePath);

  
        $uploadsDir = realpath(__DIR__ . '/../../uploads/products');
        if ($filePath && strpos($filePath, $uploadsDir) === 0 && file_exists($filePath)) {
            @unlink($filePath);
        }
    }


    $del = $conn->prepare("DELETE FROM product WHERE id = ?");
    $del->execute([$id]);

    echo json_encode(["success" => true, "message" => "Product deleted."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
}
