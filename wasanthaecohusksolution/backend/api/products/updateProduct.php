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

$name = isset($data['name']) ? trim($data['name']) : null;
$description = $data['description'] ?? null;
$price = isset($data['price']) ? (float)$data['price'] : null;
$stock = isset($data['stock']) ? (int)$data['stock'] : null;
$category = $data['category'] ?? null;
$image_url = array_key_exists('image_url', $data) ? $data['image_url'] : null; 

try {

    $stmt = $conn->prepare("SELECT * FROM product WHERE id = ?");
    $stmt->execute([$id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        echo json_encode(["success" => false, "message" => "Product not found."]);
        exit;
    }

    
    $fields = [];
    $params = [];

    if ($name !== null) { $fields[] = "name = ?"; $params[] = $name; }
    if ($description !== null) { $fields[] = "description = ?"; $params[] = $description; }
    if ($price !== null) { $fields[] = "price = ?"; $params[] = $price; }
    if ($stock !== null) { $fields[] = "stock = ?"; $params[] = $stock; }
    if ($category !== null) { $fields[] = "category = ?"; $params[] = $category; }

    
    if ($image_url !== null) {
        $fields[] = "image_url = ?";
        $params[] = ($image_url === "") ? null : $image_url;
    }

    if (count($fields) === 0) {
        echo json_encode(["success" => false, "message" => "No fields to update."]);
        exit;
    }

    $params[] = $id;
    $sql = "UPDATE product SET " . implode(", ", $fields) . " WHERE id = ?";
    $upd = $conn->prepare($sql);
    $upd->execute($params);

    echo json_encode(["success" => true, "message" => "Product updated successfully."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
}
