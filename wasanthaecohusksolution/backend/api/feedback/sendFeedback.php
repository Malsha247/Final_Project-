<?php
/* ================= CORS ================= */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
    'http://localhost:3000',
    'http://localhost:3002'
];

if (in_array($origin, $allowed)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true"); //  REQUIRED
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
/* ======================================== */

/* ======================================== */

require_once __DIR__ . '/../../config/db.php';

/* ===== READ INPUT ===== */
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON input"
    ]);
    exit;
}

/* ===== MAP FRONTEND FIELDS ===== */
$user_id    = intval($data['user_id'] ?? 0);
$user_name  = trim($data['user_name'] ?? '');
$user_email = trim($data['user_email'] ?? '');
$subject    = trim($data['subject'] ?? '');
$message    = trim($data['message'] ?? '');

/* ===== VALIDATION ===== */
if (!$user_id || !$user_name || !$user_email || !$subject || !$message) {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);
    exit;
}

/* ===== SAVE FEEDBACK ===== */
$stmt = $conn->prepare("
    INSERT INTO feedback (
        user_id,
        user_name,
        user_email,
        subject,
        message,
        created_at
    ) VALUES (?, ?, ?, ?, ?, NOW())
");

$stmt->execute([
    $user_id,
    $user_name,
    $user_email,
    $subject,
    $message
]);

echo json_encode([
    "success" => true,
    "message" => "Feedback sent successfully"
]);
exit;
