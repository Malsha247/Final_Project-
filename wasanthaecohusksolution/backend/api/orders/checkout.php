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

    echo json_encode([
        "success" => true,
        "order_id" => $order_id,
        "payment_method" => $payment,
        "status" => $status,
    ]);
} catch (Exception $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
