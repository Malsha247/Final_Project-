<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/db.php';


$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "user_id required"]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT c.id, c.user_id, c.product_id, c.quantity,
               p.name, p.price, p.image_url
        FROM cart c
        JOIN product p ON p.id = c.product_id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
    ");
    $stmt->execute([$user_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "items" => $items]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
