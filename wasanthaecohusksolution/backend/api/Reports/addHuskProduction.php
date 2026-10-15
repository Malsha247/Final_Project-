<?php
header("Content-Type: application/json; charset=UTF-8");

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:3000', 'http://localhost:3002'];
if (in_array($origin, $allowed)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$date = $data['date'] ?? date('Y-m-d');
$bags = intval($data['bags_cut'] ?? 0);

if ($bags <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid bag count"]);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO daily_husk_production (production_date, bags_cut)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE bags_cut = bags_cut + VALUES(bags_cut)
    ");
    $stmt->execute([$date, $bags]);

    echo json_encode([
        "success" => true,
        "message" => "Daily production saved"
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
