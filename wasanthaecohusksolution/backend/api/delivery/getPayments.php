<?php
require_once __DIR__ . '/../_cors.php';
require_once __DIR__ . '/../../config/db.php';

$id = intval($_GET['id'] ?? 0);

$stmt = $conn->prepare("
  SELECT month_year, deliveries_paid, base_salary, bonus_amount, total_salary, paid_at
  FROM delivery_salary_payments
  WHERE delivery_person_id = ?
  ORDER BY paid_at DESC
");

$stmt->execute([$id]);

echo json_encode([
  "success" => true,
  "payments" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);
