<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data['seller_id'])) {
    echo json_encode(["success" => false, "message" => "Seller ID required"]);
    exit;
}

$sellerId = intval($data['seller_id']);

try {
    $stmt = $conn->prepare("DELETE FROM husk_sellers WHERE id = ?");
    $stmt->execute([$sellerId]);

    echo json_encode([
        "success" => true,
        "message" => "Husk submission deleted"
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
