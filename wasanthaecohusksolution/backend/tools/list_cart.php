<?php
require_once __DIR__ . '/../config/db.php';
$uid = isset($argv[1]) ? intval($argv[1]) : 1;
header("Content-Type: application/json");
try {
    $stmt = $conn->prepare("SELECT c.id, c.user_id, c.product_id, c.quantity, p.name, p.price, p.stock FROM cart c JOIN product p ON p.id = c.product_id WHERE c.user_id = ?");
    $stmt->execute([$uid]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success"=>true, "items"=>$items]);
} catch (Exception $e) {
    echo json_encode(["success"=>false, "message"=>$e->getMessage()]);
}
