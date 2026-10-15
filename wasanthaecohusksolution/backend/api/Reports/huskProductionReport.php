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
/* ======================================== */

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/db.php';

try {
    /* ===== DAILY DATA ===== */
    $stmt = $conn->query("
        SELECT 
            production_date,
            bags_cut
        FROM daily_husk_production
        ORDER BY production_date ASC
    ");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* ===== SUMMARY ===== */
    $sumStmt = $conn->query("
        SELECT COALESCE(SUM(bags_cut), 0) AS total_bags
        FROM daily_husk_production
    ");
    $summary = $sumStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "summary" => [
            "total_bags" => (int)$summary['total_bags']
        ],
        "data" => $rows
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
