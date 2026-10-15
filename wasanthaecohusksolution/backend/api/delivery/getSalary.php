<?php
require_once __DIR__ . '/../_cors.php';
require_once __DIR__ . '/../../config/db.php';

$id = intval($_GET['id'] ?? 0);
if (!$id) {
    echo json_encode(["success" => false]);
    exit;
}

$month = date('Y-m');

/* Count delivered orders for current month */
$stmt = $conn->prepare("
    SELECT COUNT(*) FROM orders
    WHERE delivery_person_id = ?
      AND status = 'Delivered'
      AND DATE_FORMAT(delivered_at, '%Y-%m') = ?
");
$stmt->execute([$id, $month]);
$deliveries = (int)$stmt->fetchColumn();

$base = 25000;
$bonus = $deliveries * 100;
$total = $base + $bonus;

/* Check if already paid */
$paidStmt = $conn->prepare("
    SELECT id FROM delivery_salary_payments
    WHERE delivery_person_id = ? AND month_year = ?
");
$paidStmt->execute([$id, $month]);
$paid = $paidStmt->fetch() ? true : false;

echo json_encode([
    "success" => true,
    "month" => $month,
    "deliveries" => $paid ? 0 : $deliveries,
    "base" => $base,
    "bonus" => $paid ? 0 : $bonus,
    "total" => $paid ? 0 : $total,
    "paid" => $paid
]);
