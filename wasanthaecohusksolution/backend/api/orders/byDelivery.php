<?php
require_once __DIR__ . '/../_cors.php';
require_once __DIR__ . '/../../config/db.php';



$stmt = $conn->query("
    SELECT 
        o.id,
        o.shipping_address,
        o.status,
        c.first_name AS customer_name
    FROM orders o
    JOIN customer c ON c.id = o.customer_id
    WHERE o.status = 'Shipped'
    ORDER BY o.id ASC
");

echo json_encode([
    "success" => true,
    "orders" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);
