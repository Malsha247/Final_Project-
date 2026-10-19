<?php
require_once __DIR__ . '/../_cors.php';
ini_set('display_errors', 0);
error_reporting(0);


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

try {
    $stmt = $conn->query("
        SELECT id, name, email, delivery_count
        FROM delivery_persons
        WHERE status = 'active'
    ");

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $rows
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
