<?php
require_once __DIR__ . '/../_cors.php';
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/db.php';

try {
    $stmt = $conn->query("SELECT * FROM product ORDER BY created_at DESC LIMIT 4");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($products);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>
