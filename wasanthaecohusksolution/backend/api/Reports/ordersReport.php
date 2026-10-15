<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");

require_once __DIR__ . '/../../config/db.php';

try {
    // ===== ORDERS LIST =====
    $ordersStmt = $conn->query("
        SELECT
            id,
            customer_name,
            total_price,
            status,
            created_at
        FROM orders
        ORDER BY created_at DESC
    ");
    $orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);

    // ===== SUMMARY =====
    $summaryStmt = $conn->query("
        SELECT
            COUNT(*) AS total_orders,
            IFNULL(SUM(total_price), 0) AS total_revenue,
            SUM(status = 'Pending') AS pending_orders,
            SUM(status = 'Delivered') AS delivered_orders
        FROM orders
    ");
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "summary" => $summary,
        "orders" => $orders
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
