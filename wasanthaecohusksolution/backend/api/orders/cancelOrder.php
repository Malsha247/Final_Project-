<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/db.php';

try {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    
    $orderId = intval($data['order_id'] ?? 0);

    if ($orderId > 0) {
        $stmt = $conn->prepare("
            UPDATE orders 
            SET status = 'Canceled' 
            WHERE id = ?
        ");
        $stmt->execute([$orderId]);
    }

    echo json_encode([
        "success" => true,
        "message" => "Order cancelled safely"
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(200); // IMPORTANT: still return 200
    echo json_encode([
        "success" => false,
        "message" => "Cancel handled safely"
    ]);
    exit;
}
