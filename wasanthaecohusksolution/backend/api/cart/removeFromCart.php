<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once __DIR__ . '/../../config/db.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if (!$id) {
  echo json_encode(["success"=>false,"message"=>"id required"]);
  exit;
}

try {
    $conn->beginTransaction();

    // get cart row and product id & quantity
    $stmt = $conn->prepare("SELECT product_id, quantity FROM cart WHERE id = ? FOR UPDATE");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        $conn->rollBack();
        echo json_encode(["success"=>false,"message"=>"Cart item not found"]);
        exit;
    }

    // restore product stock
    $rest = $conn->prepare("UPDATE product SET stock = stock + ? WHERE id = ?");
    $rest->execute([intval($row['quantity']), intval($row['product_id'])]);

    // delete cart row
    $del = $conn->prepare("DELETE FROM cart WHERE id = ?");
    $del->execute([$id]);

    $conn->commit();
    echo json_encode(["success"=>true,"message"=>"Removed from cart, stock restored"]);
} catch (Exception $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
