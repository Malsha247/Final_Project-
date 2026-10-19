<?php
require_once __DIR__ . '/../_cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
header("Content-Type: application/json");

require_once __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['user_id'], $data['product_id'], $data['quantity'])) {
  echo json_encode(["success" => false, "message" => "Invalid data"]);
  exit;
}

$user_id = (int)$data['user_id'];
$product_id = (int)$data['product_id'];
$quantity = max(1, (int)$data['quantity']);

try {
    $conn->beginTransaction();

    $stmt = $conn->prepare("SELECT id, stock, price, name FROM product WHERE id = ? FOR UPDATE");
    $stmt->execute([$product_id]);
    $prod = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$prod) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => "Product not found"]);
        exit;
    }

    if ($prod['stock'] < $quantity) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => "Not enough stock available"]);
        exit;
    }

    $cstmt = $conn->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ? FOR UPDATE");
    $cstmt->execute([$user_id, $product_id]);
    $cartRow = $cstmt->fetch(PDO::FETCH_ASSOC);

    if ($cartRow) {
        $newQty = $cartRow['quantity'] + $quantity;
        $updateCart = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
        $updateCart->execute([$newQty, $cartRow['id']]);
    } else {
        $insertCart = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity, created_at) VALUES (?, ?, ?, NOW())");
        $insertCart->execute([$user_id, $product_id, $quantity]);
    }

    $upd = $conn->prepare("UPDATE product SET stock = stock - ? WHERE id = ?");
    $upd->execute([$quantity, $product_id]);

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Added to cart"]);
} catch (Exception $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
