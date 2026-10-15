<?php


ini_set('display_errors', 1);
error_reporting(E_ALL);

/* ===== CORS ===== */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:3000', 'http://localhost:3002'];

if (in_array($origin, $allowed)) {
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* ===== DB ===== */
require_once __DIR__ . '/../../config/db.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        throw new Exception("Invalid JSON input");
    }

    $name     = trim($data['name'] ?? '');
    $email    = trim($data['email'] ?? '');
    $phone    = trim($data['phone'] ?? '');
    $password = $data['password'] ?? '';

    if ($name === '' || $email === '' || $password === '') {
        throw new Exception("Name, email and password are required");
    }

    /* ===== CHECK DUPLICATE EMAIL ===== */
    $check = $conn->prepare("SELECT id FROM delivery_persons WHERE email = ?");
    $check->execute([$email]);

    if ($check->fetch()) {
        throw new Exception("Email already exists");
    }

    /* ===== HASH PASSWORD ===== */
    $hashed = password_hash($password, PASSWORD_DEFAULT);

    /* ===== INSERT ===== */
    $stmt = $conn->prepare("
        INSERT INTO delivery_persons
            (name, email, phone, password, status, created_at)
        VALUES
            (?, ?, ?, ?, 'active', NOW())
    ");

    $stmt->execute([
        $name,
        $email,
        $phone,
        $hashed
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Delivery person created successfully"
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    exit;
}
