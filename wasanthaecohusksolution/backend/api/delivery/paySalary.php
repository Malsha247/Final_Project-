<?php
require_once __DIR__ . '/../_cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../plants/helpers/sendEmailFallback.php';

$data = json_decode(file_get_contents("php://input"), true);

$delivery_id = intval($data['delivery_person_id'] ?? 0);
$month = date('Y-m');

if (!$delivery_id) {
    echo json_encode(["success" => false, "message" => "Delivery person required"]);
    exit;
}

/* ===== COUNT DELIVERIES ===== */
$stmt = $conn->prepare("
    SELECT COUNT(*) 
    FROM orders
    WHERE delivery_person_id = ?
      AND status = 'Delivered'
      AND DATE_FORMAT(delivered_at,'%Y-%m') = ?
");
$stmt->execute([$delivery_id, $month]);
$deliveries = (int)$stmt->fetchColumn();


$base = 25000;
$bonus = $deliveries * 100;
$total = $base + $bonus;

$check = $conn->prepare("
    SELECT id FROM delivery_salary_payments
    WHERE delivery_person_id = ? AND month_year = ?
");
$check->execute([$delivery_id, $month]);

if ($check->fetch()) {
    echo json_encode(["success" => false, "message" => "Salary already paid"]);
    exit;
}

/* ===== INSERT PAYMENT ===== */
$ins = $conn->prepare("
    INSERT INTO delivery_salary_payments
    (delivery_person_id, month_year, deliveries_paid, base_salary, bonus_amount, total_salary, paid_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
");
$ins->execute([
    $delivery_id,
    $month,
    $deliveries,
    $base,
    $bonus,
    $total
]);

/* ===== GET EMAIL ===== */
$emailStmt = $conn->prepare("
    SELECT email, name FROM delivery_persons WHERE id = ?
");
$emailStmt->execute([$delivery_id]);
$d = $emailStmt->fetch(PDO::FETCH_ASSOC);

/* ===== EMAIL ===== */
send_email_fallback(
    $d['email'],
    "Salary Paid – {$month}",
    "
        <h3>Hello {$d['name']}</h3>
        <p>Your salary for <b>{$month}</b> has been paid.</p>
        <p>Total Amount: <b>Rs. {$total}</b></p>
        <p>Thank you for your service.</p>
    "
);

echo json_encode([
    "success" => true,
    "message" => "Salary paid successfully"
]);
exit;
