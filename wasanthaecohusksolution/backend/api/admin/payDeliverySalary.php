<?php
require_once __DIR__ . '/../_cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../plants/helpers/sendEmailFallback.php';

$data = json_decode(file_get_contents("php://input"), true);
$delivery_id = intval($data['delivery_person_id'] ?? 0);

$month = date('Y-m');

if (!$delivery_id) {
    echo json_encode(["success" => false]);
    exit;
}

/* Prevent double payment */
$chk = $conn->prepare("
    SELECT id FROM delivery_salary_payments
    WHERE delivery_person_id=? AND month_year=?
");
$chk->execute([$delivery_id, $month]);
if ($chk->fetch()) {
    echo json_encode(["success" => false, "message" => "Already paid"]);
    exit;
}

/* Count deliveries */
$stmt = $conn->prepare("
    SELECT COUNT(*) FROM orders
    WHERE delivery_person_id=? AND status='Delivered'
      AND DATE_FORMAT(delivered_at,'%Y-%m')=?
");
$stmt->execute([$delivery_id, $month]);
$deliveries = (int)$stmt->fetchColumn();

$base = 25000;
$bonus = $deliveries * 100;
$total = $base + $bonus;

/* Save payment */
$conn->prepare("
    INSERT INTO delivery_salary_payments
    (delivery_person_id, month_year, delivered_orders, base_salary, bonus, total_amount)
    VALUES (?, ?, ?, ?, ?, ?)
")->execute([$delivery_id, $month, $deliveries, $base, $bonus, $total]);

/* Email */
$u = $conn->prepare("SELECT email,name FROM delivery_persons WHERE id=?");
$u->execute([$delivery_id]);
$user = $u->fetch();

send_email_fallback(
    $user['email'],
    "Salary Paid - $month",
    "
    <h3>Salary Paid</h3>
    <p>Month: $month</p>
    <p>Delivered Orders: $deliveries</p>
    <p>Total Paid: Rs. $total</p>
    ",
    "no-reply@wasanthaecohusk.com",
    "Wasantha Eco Husk"
);

echo json_encode(["success" => true]);
