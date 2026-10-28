<?php
require_once __DIR__ . '/../_cors.php';
if (isset($_SERVER['HTTP_ORIGIN'])) {
} else {
}
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../plants/helpers/sendEmailFallback.php';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}

$customer_id = intval($data['user_id'] ?? 0);
$name = trim($data['customer_name'] ?? "");
$email = trim($data['customer_email'] ?? "");
$phone = trim($data['customer_phone'] ?? "");
$address = trim($data['shipping_address'] ?? "");
$payment = trim($data['payment_method'] ?? "");
$total = floatval($data['total_price'] ?? 0);

if (!$customer_id || !$name || !$email || !$phone || !$address) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$status = ($payment === "PayPal") ? "Paid" : "Pending";

try {
    $conn->beginTransaction();

    $stmt = $conn->prepare("
        INSERT INTO orders 
        (customer_id, customer_name, customer_email, customer_phone, shipping_address, total_price, payment_method, status, created_at)
        VALUES 
        (:cid, :name, :email, :phone, :address, :total, :payment, :status, NOW())
    ");

    $stmt->execute([
        ":cid" => $customer_id,
        ":name" => $name,
        ":email" => $email,
        ":phone" => $phone,
        ":address" => $address,
        ":total" => $total,
        ":payment" => $payment,
        ":status" => $status,
    ]);

    $order_id = $conn->lastInsertId();

    $cart = $conn->prepare("
        SELECT c.product_id, c.quantity, p.price
        FROM cart c
        JOIN product p ON p.id = c.product_id
        WHERE c.user_id = :uid
    ");
    $cart->execute([":uid" => $customer_id]);
    $items = $cart->fetchAll(PDO::FETCH_ASSOC);

    if (!$items) throw new Exception("Cart empty");

    $itemStmt = $conn->prepare("
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (:oid, :pid, :qty, :price)
    ");

    foreach ($items as $it) {
        $itemStmt->execute([
            ":oid" => $order_id,
            ":pid" => $it['product_id'],
            ":qty" => $it['quantity'],
            ":price" => $it['price'],
        ]);
    }

    $conn->prepare("DELETE FROM cart WHERE user_id = :uid")
         ->execute([":uid" => $customer_id]);

    $conn->commit();

    $escapeEmailHtml = static function ($value) {
        return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    };
    $safeName = $escapeEmailHtml($name);
    $safePayment = $escapeEmailHtml($payment);
    $safeAddress = $escapeEmailHtml($address);
    $safeTotal = number_format($total, 2, '.', ',');

    $emailResult = send_email_fallback(
        $email,
        "Order confirmation #{$order_id} - Wasantha Eco Husk Solutions",
        "
            <html>
            <body style='font-family: Arial, sans-serif; color: #20352a; line-height: 1.6;'>
                <h2 style='color: #174b2b;'>Thank you for your order, {$safeName}!</h2>
                <p>Your order <strong>#{$order_id}</strong> has been placed successfully.</p>
                <p><strong>Payment method:</strong> {$safePayment}</p>
                <p><strong>Order total:</strong> Rs. {$safeTotal}</p>
                <p><strong>Shipping address:</strong> {$safeAddress}</p>
                <p>We’ll notify you when your order status changes.</p>
                <p><strong>Wasantha Eco Husk Solutions</strong></p>
            </body>
            </html>",
        'wasanthaeco2001@gmail.com',
        'Wasantha Eco Husk Solutions',
        null,
        getenv('SMTP_PASSWORD_API_ORDERS_SENDORDERNOTIFICATION') ?: null
    );
    $emailSent = ($emailResult === true);
    if (!$emailSent) {
        error_log("Order confirmation email was not sent for order #{$order_id}: " . $emailResult);
    }

    echo json_encode([
        "success" => true,
        "order_id" => $order_id,
        "payment_method" => $payment,
        "status" => $status,
        "email_sent" => $emailSent,
    ]);
} catch (Exception $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
