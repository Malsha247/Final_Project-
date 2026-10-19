<?php
require_once __DIR__ . '/../_cors.php';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:3000', 'http://localhost:3002'];

if (in_array($origin, $allowed)) {
}
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/db.php';

$stmt = $conn->prepare("
    SELECT 
        id,
        customer_name,
        customer_phone,
        customer_email,
        shipping_address,  
        payment_method,
        payment_status,
        status,
        total_price,
        created_at
    FROM orders
    ORDER BY created_at DESC
");

$stmt->execute();

echo json_encode([
    "success" => true,
    "orders" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);
