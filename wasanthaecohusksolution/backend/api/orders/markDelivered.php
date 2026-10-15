<?php
require_once __DIR__ . '/../_cors.php';
require_once __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$order_id = intval($data['order_id'] ?? 0);
$delivery_id = intval($data['delivery_person_id'] ?? 0);

if (!$order_id || !$delivery_id) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request"
    ]);
    exit;
}

/* Try to deliver ONLY if still shipped */
$stmt = $conn->prepare("
    UPDATE orders
    SET status = 'Delivered',
        delivery_person_id = ?
    WHERE id = ?
      AND status = 'Shipped'
");
$stmt->execute([$delivery_id, $order_id]);

if ($stmt->rowCount() === 0) {
    // Order was already taken by someone else
    echo json_encode([
        "success" => false,
        "message" => "This order was already delivered by another delivery person."
    ]);
    exit;
}


$conn->prepare("
    UPDATE delivery_persons
    SET delivery_count = delivery_count + 1
    WHERE id = ?
")->execute([$delivery_id]);

echo json_encode([
    "success" => true,
    "message" => "Order delivered successfully"
]);
