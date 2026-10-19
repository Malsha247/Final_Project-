<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json; charset=utf-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../../config/db.php';

$raw = file_get_contents("php://input");
$input = json_decode($raw, true) ?: $_POST;

$order_id = isset($input['order_id']) ? intval($input['order_id']) : 0;
$amount = isset($input['amount']) ? floatval($input['amount']) : 0;
$transaction_id = isset($input['transaction_id']) ? trim($input['transaction_id']) : ('MOCK' . time());
$return_url = isset($input['return_url']) ? trim($input['return_url']) : null;

if (!$order_id) {
    echo json_encode(["success" => false, "message" => "order_id required"]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE orders SET payment_status = 'Paid', transaction_id = ?, payment_method = 'Card Payment', status = 'Processing', updated_at = NOW() WHERE id = ?");
    $stmt->execute([$transaction_id, $order_id]);

    // fetch email to notify
    $s = $conn->prepare("SELECT customer_email, customer_name FROM orders WHERE id = ?");
    $s->execute([$order_id]);
    $row = $s->fetch(PDO::FETCH_ASSOC);

    // Optionally send email by your existing helper
    if ($row && function_exists('sendOrderNotification')) {
        try {
            sendOrderNotification($row['customer_email'], $row['customer_name'], $order_id, 'Paid', '');
        } catch (Exception $e) {
            error_log("Notify failed: " . $e->getMessage());
        }
    }

    // If this was a form POST (mockPayment), redirect user back
    if (!empty($_POST)) {
        header("Location: " . ($return_url ?: "/my-orders?order_id=" . urlencode($order_id)));
        exit;
    }

    echo json_encode(["success" => true, "message" => "Payment recorded", "order_id" => $order_id]);
    exit;
} catch (Exception $e) {
    error_log("confirmPayment error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Server error"]);
    exit;
}
