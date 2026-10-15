<?php
/* ================= CORS ================= */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:3000', 'http://localhost:3002'];

if (in_array($origin, $allowed)) {
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
/* ======================================= */

require_once __DIR__ . '/../../config/db.php';

try {
    /* ===== CUSTOMER DETAILS ===== */
    $stmt = $conn->query("
        SELECT 
            c.id,
            CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
            c.email,
            COUNT(o.id) AS total_orders,
            IFNULL(SUM(o.total_price), 0) AS total_spent
        FROM customer c
        LEFT JOIN orders o ON o.customer_id = c.id
        GROUP BY c.id
        ORDER BY total_spent DESC
    ");

    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* ===== SUMMARY ===== */
    $summaryStmt = $conn->query("
        SELECT COUNT(*) AS total_customers FROM customer
    ");
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "summary" => $summary,
        "customers" => $customers
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
