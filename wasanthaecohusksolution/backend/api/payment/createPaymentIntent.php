<?php
/* ================= CORS ================= */
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
/* ====================================== */

/* ===== STRIPE SECRET KEY ===== */
require_once __DIR__ . '/../../../vendor/stripe/init.php';


\Stripe\Stripe::setApiKey((getenv('STRIPE_SECRET_KEY') ?: ''));

/* ===== READ INPUT ===== */
$data = json_decode(file_get_contents("php://input"), true);

$total = isset($data['total']) ? floatval($data['total']) : 0;

if ($total <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid payment amount"
    ]);
    exit;
}

try {
    $intent = \Stripe\PaymentIntent::create([
        'amount' => intval($total * 100), // Rs → cents
        'currency' => 'lkr',
        'payment_method_types' => ['card'],
    ]);

    echo json_encode([
        "success" => true,
        "client_secret" => $intent->client_secret
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
