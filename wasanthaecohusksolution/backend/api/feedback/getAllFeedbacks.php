<?php


$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
    'http://localhost:3000',
    'http://localhost:3002'
];

if (in_array($origin, $allowed)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
/* ======================================== */

require_once __DIR__ . '/../../config/db.php';

try {
    $stmt = $conn->prepare("
        SELECT 
            id,
            user_id,
            user_name,
            user_email,
            subject,
            message,
            created_at
        FROM feedback
        ORDER BY created_at DESC
    ");
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "feedbacks" => $stmt->fetchAll(PDO::FETCH_ASSOC)
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
