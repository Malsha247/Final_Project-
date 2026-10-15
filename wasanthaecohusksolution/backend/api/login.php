<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

/* ===== CORS ===== */
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

/* ===== PREFLIGHT ===== */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST, OPTIONS');
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

try {

/* ===== READ INPUT ===== */
$data = json_decode(file_get_contents("php://input"), true);

if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}

if (!is_string($data['email'] ?? '') || !is_string($data['password'] ?? '')) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email and password must be strings"]);
    exit;
}

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email and password required"]);
    exit;
}

require_once __DIR__ . '/../config/db.php';

/* ===== ADMIN ===== */
$stmt = $conn->prepare("SELECT * FROM admin WHERE email = ?");
$stmt->execute([$email]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if ($admin && password_verify($password, $admin['password'])) {
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $admin['id'],
            "email" => $admin['email'],
            "role" => "admin"
        ]
    ]);
    exit;
}

/* ===== DELIVERY PERSON ===== */
$stmt = $conn->prepare("
    SELECT * FROM delivery_persons
    WHERE email = ? AND status = 'active'
");
$stmt->execute([$email]);
$delivery = $stmt->fetch(PDO::FETCH_ASSOC);

if ($delivery && is_string($delivery['password']) && password_verify($password, $delivery['password'])) {
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $delivery['id'],
            "email" => $delivery['email'],
            "name" => $delivery['name'],
            "role" => "delivery"
        ]
    ]);
    exit;
}

/* ===== CUSTOMER ===== */
$stmt = $conn->prepare("SELECT * FROM customer WHERE email = ?");
$stmt->execute([$email]);
$customer = $stmt->fetch(PDO::FETCH_ASSOC);

if ($customer && password_verify($password, $customer['password'])) {
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $customer['id'],
            "email" => $customer['email'],
            "first_name" => $customer['first_name'],
            "role" => "customer"
        ]
    ]);
    exit;
}

/* ===== FAIL ===== */
http_response_code(401);
echo json_encode([
    "success" => false,
    "message" => "Invalid email or password"
]);
exit;
} catch (Throwable $e) {
    error_log('Login failed: ' . get_class($e) . ' (code ' . $e->getCode() . ')');
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error occurred. Please try again later."]);
}
