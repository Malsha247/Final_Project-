<?php
require_once __DIR__ . '/../_cors.php';
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);




$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3002'
];

if (in_array($origin, $allowed_origins)) {
}
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
/* ======================================== */


/* ================= DB ================= */
require_once __DIR__ . '/../../config/db.php';
/* ===================================== */


try {
    /* ===== Validate delivery_id ===== */
    if (!isset($_GET['delivery_id'])) {
        throw new Exception("delivery_id is required");
    }

    $delivery_id = intval($_GET['delivery_id']);
    if ($delivery_id <= 0) {
        throw new Exception("Invalid delivery_id");
    }

    /* ===== Fetch assigned orders ===== */
    $stmt = $conn->prepare("
        SELECT
            o.id,
            o.customer_name,
            o.customer_phone,
            o.shipping_address,
            o.status,
            o.created_at
        FROM orders o
        WHERE o.delivery_person_id = ?
          AND o.status IN ('Processing', 'Shipped')
        ORDER BY o.created_at DESC
    ");

    $stmt->execute([$delivery_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "orders" => $orders
    ]);
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    exit;
}
