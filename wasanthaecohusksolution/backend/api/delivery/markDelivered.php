<?php

require_once __DIR__ . '/../_cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../plants/helpers/sendEmailFallback.php';

ini_set('display_errors', 0);
error_reporting(E_ALL);

$data = json_decode(file_get_contents("php://input"), true);

$order_id = intval($data['order_id'] ?? 0);
$delivery_person_id = intval($data['delivery_person_id'] ?? 0);

if (!$order_id || !$delivery_person_id) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid order or delivery person"
    ]);
    exit;
}


$stmt = $conn->prepare("
    SELECT o.id, o.status, o.customer_name, o.customer_email
    FROM orders o
    WHERE o.id = ? AND o.status = 'Shipped'
");
$stmt->execute([$order_id]);
$order = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$order) {
    echo json_encode([
        "success" => false,
        "message" => "Order not found or not shipped"
    ]);
    exit;
}


$conn->prepare("
    UPDATE orders
    SET status = 'Delivered',
        delivery_person_id = ?,
        delivered_at = NOW()
    WHERE id = ?
")->execute([$delivery_person_id, $order_id]);


$conn->prepare("
    UPDATE delivery_persons
    SET delivery_count = delivery_count + 1
    WHERE id = ?
")->execute([$delivery_person_id]);


try {
    $subject = "Your order has been delivered";
    $body = "
        <h3>Hello {$order['customer_name']},</h3>
        <p>Your order <strong>#{$order_id}</strong> has been delivered.</p>
        <p>Thank you for shopping with us.</p>
        <br>
        <small>Wasantha Eco Husk Solutions</small>
    ";

    send_email_fallback(
        $order['customer_email'],
        $subject,
        $body,
        "wasanthaeco2001@gmail.com",
        "Wasantha Eco Husk"
    );
} catch (Exception $e) {
  
}


echo json_encode([
    "success" => true,
    "message" => "Order marked as delivered"
]);
exit;
