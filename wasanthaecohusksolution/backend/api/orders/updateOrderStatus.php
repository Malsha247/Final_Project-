<?php

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3002'
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/db.php';

/* ===== EMAIL HELPER ===== */
require_once __DIR__ . '/../plants/helpers/sendEmailFallback.php';

try {
    /* ===== READ INPUT ===== */
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        throw new Exception("Invalid JSON input");
    }

    $order_id = intval($data['order_id'] ?? 0);
    $status   = ucfirst(strtolower(trim($data['status'] ?? '')));

    $allowed = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'];
    if (!$order_id || !in_array($status, $allowed)) {
        throw new Exception("Invalid order status");
    }

    /* ===== LOAD ORDER + CUSTOMER ===== */
    $stmt = $conn->prepare("
        SELECT o.id, c.email, c.first_name
        FROM orders o
        JOIN customer c ON c.id = o.customer_id
        WHERE o.id = ?
    ");
    $stmt->execute([$order_id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        throw new Exception("Order not found");
    }

    /* ===== UPDATE STATUS ===== */
    $upd = $conn->prepare("
        UPDATE orders
        SET status = ?
        WHERE id = ?
    ");
    $upd->execute([$status, $order_id]);

    /* ===== SEND EMAIL ===== */
    $subject = "Your order status has been updated";
    $body = "
        <h3>Hello {$order['first_name']},</h3>
        <p>Your order <strong>#{$order_id}</strong> status has been updated.</p>
        <p><strong>Current Status:</strong> {$status}</p>
        <p>Thank you for shopping with us.</p>
        <br>
        <small>Wasantha Eco Husk Solutions</small>
    ";

    send_email_fallback(
        $order['email'],               // to
        $subject,                      // subject
        $body,                         // body
        "wasanthaeco2001@gmail.com",   // from
        "Wasantha Eco Husk"            // from name
    );

    echo json_encode([
        "success" => true,
        "message" => "Order status updated and email sent"
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    exit;
}
