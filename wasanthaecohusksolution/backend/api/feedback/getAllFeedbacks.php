<?php
require_once __DIR__ . '/../_cors.php';

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
