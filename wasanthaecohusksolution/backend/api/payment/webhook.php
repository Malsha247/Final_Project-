<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../../vendor/autoload.php';

$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
$endpoint_secret = getenv('STRIPE_WEBHOOK_SECRET') ?: '';

try {
    $event = \Stripe\Webhook::constructEvent(
        $payload, $sig_header, $endpoint_secret
    );
} catch(\UnexpectedValueException $e) {
   
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid payload"]);
    exit;
} catch(\Stripe\Exception\SignatureVerificationException $e) {
    
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid signature"]);
    exit;
}


$type = $event->type;
$data = $event->data->object;

try {
    if ($type === 'payment_intent.succeeded') {
        $pi = $data;
        $order_id = intval($pi->metadata->order_id ?? 0);
        $transaction_id = $pi->id;
        // Update order
        if ($order_id > 0) {
            $upd = $conn->prepare("UPDATE orders SET payment_status = 'Paid', transaction_id = ?, status = 'Processing' WHERE id = ?");
            $upd->execute([$transaction_id, $order_id]);
            // call sendOrderNotification if exists
            $notify = __DIR__ . '/../orders/sendOrderNotification.php';
            if (file_exists($notify)) {
                try {
                    require_once $notify;
                    if (function_exists('sendOrderNotification')) {
                        // sendOrderNotification($to, $name, $orderId, $newStatus, $trackingNo)
                        // fetch customer email/name
                        $s = $conn->prepare("SELECT customer_email, customer_name FROM orders WHERE id = ?");
                        $s->execute([$order_id]);
                        $row = $s->fetch(PDO::FETCH_ASSOC);
                        if ($row) {
                            sendOrderNotification($row['customer_email'], $row['customer_name'], $order_id, 'Paid', '');
                        }
                    }
                } catch (Exception $e) {
                    error_log("notify error: " . $e->getMessage());
                }
            }
        }
    } elseif ($type === 'payment_intent.payment_failed') {
        $pi = $data;
        $order_id = intval($pi->metadata->order_id ?? 0);
        if ($order_id > 0) {
            $upd = $conn->prepare("UPDATE orders SET payment_status = 'Failed' WHERE id = ?");
            $upd->execute([$order_id]);
        }
    }
    // return 200 to Stripe
    http_response_code(200);
    echo json_encode(["success" => true]);
    exit;
} catch (Exception $e) {
    error_log("webhook handler error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error"]);
    exit;
}
