<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$orderId = intval($data['order_id']);
$deliveryId = intval($data['delivery_person_id']);

$stmt = $conn->prepare("
    UPDATE orders 
    SET delivery_person_id = ?
    WHERE id = ?
");
$stmt->execute([$deliveryId, $orderId]);

echo json_encode(["success" => true]);
