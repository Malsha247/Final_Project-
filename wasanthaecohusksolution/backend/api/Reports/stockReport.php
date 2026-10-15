<?php
/* ================= CORS ================= */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3002'
];

if (in_array($origin, $allowed_origins)) {
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
/* ======================================== */

require_once __DIR__ . '/../../config/db.php';

try {
    /* ===== GET STOCK LIST ===== */
    $stmt = $conn->query("
        SELECT 
            id,
            name AS product_name,
            stock,
            price
        FROM product
        ORDER BY name ASC
    ");

    $stocks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* ===== SUMMARY ===== */
    $summaryStmt = $conn->query("
        SELECT
            COUNT(*) AS total_products,
            IFNULL(SUM(stock),0) AS total_stock,
            SUM(CASE WHEN stock <= 5 THEN 1 ELSE 0 END) AS low_stock
        FROM product
    ");

    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "summary" => $summary,
        "stocks"  => $stocks
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
