<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json");

require_once __DIR__ . '/../../config/db.php';


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['id'], $data['quantity'])) {
    echo json_encode(["success" => false, "message" => "id and quantity required"]);
    exit;
}

$id = intval($data['id']);
$newQty = max(1, intval($data['quantity']));

try {
    $conn->beginTransaction();


    $stmt = $conn->prepare("SELECT product_id, quantity FROM cart WHERE id = ? FOR UPDATE");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => "Cart item not found"]);
        exit;
    }

    $product_id = intval($row['product_id']);
    $oldQty = intval($row['quantity']);
    $delta = $newQty - $oldQty; 

    if ($delta > 0) {
        
        $pstmt = $conn->prepare("SELECT stock FROM product WHERE id = ? FOR UPDATE");
        $pstmt->execute([$product_id]);
        $p = $pstmt->fetch(PDO::FETCH_ASSOC);

        if (!$p || $p['stock'] < $delta) {
            $conn->rollBack();
            echo json_encode(["success" => false, "message" => "Not enough stock to increase quantity"]);
            exit;
        }

        // reduce stock
        $updStock = $conn->prepare("UPDATE product SET stock = stock - ? WHERE id = ?");
        $updStock->execute([$delta, $product_id]);
    } elseif ($delta < 0) {
        // restore stock when reducing quantity
        $restore = $conn->prepare("UPDATE product SET stock = stock + ? WHERE id = ?");
        $restore->execute([abs($delta), $product_id]);
    }

    // update cart table
    $updateCart = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
    $updateCart->execute([$newQty, $id]);

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Cart updated successfully"]);
} catch (Exception $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
