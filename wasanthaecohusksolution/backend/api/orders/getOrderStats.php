<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/db.php';

try {
    $total = $conn->query("SELECT COUNT(*) FROM orders")->fetchColumn();
    echo json_encode(["success" => true, "total" => $total]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
