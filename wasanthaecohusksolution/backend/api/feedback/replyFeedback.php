<?php
require_once __DIR__ . '/../_cors.php';
/* ========= CORS ========= */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:3000', 'http://localhost:3002'];

if (in_array($origin, $allowed)) {
}
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
/* ======================== */

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../plants/helpers/sendEmailFallback.php';

/* ===== READ INPUT ===== */
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON input"
    ]);
    exit;
}

$feedback_id = intval($data['feedback_id'] ?? 0);
$reply       = trim($data['reply'] ?? '');

if (!$feedback_id || !$reply) {
    echo json_encode([
        "success" => false,
        "message" => "Missing feedback_id or reply"
    ]);
    exit;
}

/* ===== LOAD FEEDBACK (âœ… TABLE NAME FIXED HERE) ===== */
$stmt = $conn->prepare("
    SELECT id, user_name, user_email, subject
    FROM feedback
    WHERE id = ?
");
$stmt->execute([$feedback_id]);
$fb = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$fb) {
    echo json_encode([
        "success" => false,
        "message" => "Feedback not found"
    ]);
    exit;
}

/* ===== UPDATE FEEDBACK ===== */
$upd = $conn->prepare("
    UPDATE feedback
    SET admin_reply = ?, is_replied = 1, replied_at = NOW()
    WHERE id = ?
");
$upd->execute([$reply, $feedback_id]);

/* ===== SEND EMAIL ===== */
$subject = "Reply to your inquiry: {$fb['subject']}";
$body = "
    <p>Hello {$fb['user_name']},</p>
    <p>Thank you for contacting <strong>Wasantha Eco Husk Solutions</strong>.</p>
    <p><strong>Our reply:</strong></p>
    <p>{$reply}</p>
    <br>
    <p>Best regards,<br>Wasantha Eco Husk Solutions</p>
";

send_email_fallback(
    $fb['user_email'],
    $subject,
    $body,
    "wasanthaeco2001@gmail.com",
    "Wasantha Eco Husk Solutions"
);

echo json_encode([
    "success" => true,
    "message" => "Reply sent successfully"
]);
exit;
