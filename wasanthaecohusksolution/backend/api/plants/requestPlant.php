<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3002'
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// -----------------------------------------

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/helpers/sendEmailFallback.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode(["success"=>false,"message"=>"Invalid JSON"]);
        exit;
    }

    $listing_id = intval($data['listing_id'] ?? 0);
    $name       = trim($data['name'] ?? '');
    $email      = trim($data['email'] ?? '');
    $phone      = trim($data['phone'] ?? '');
    $quantity   = intval($data['quantity'] ?? 1);
    $message    = trim($data['message'] ?? '');

    if (!$listing_id || !$phone || $quantity < 1) {
        echo json_encode(["success"=>false,"message"=>"Invalid input"]);
        exit;
    }

    // get seller email
    $stmt = $conn->prepare("
        SELECT p.owner_name, c.email AS seller_email
        FROM plant_listings p
        JOIN customer c ON c.id = p.user_id
        WHERE p.id = ?
    ");
    $stmt->execute([$listing_id]);
    $plant = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$plant) {
        echo json_encode(["success"=>false,"message"=>"Plant not found"]);
        exit;
    }

    // save request
    $conn->prepare("
        INSERT INTO plant_requests
        (listing_id, requester_name, requester_email, requester_phone, quantity, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ")->execute([$listing_id, $name, $email, $phone, $quantity, $message]);

    // send email to seller
    send_email_fallback(
        $plant['seller_email'],
        "New plant request",
        "
        <h3>New Request for Your Plant</h3>
        <p><b>Name:</b> {$name}</p>
        <p><b>Phone:</b> {$phone}</p>
        <p><b>Email:</b> {$email}</p>
        <p><b>Quantity:</b> {$quantity}</p>
        <p><b>Message:</b><br>{$message}</p>
        ",
        "no-reply@wasanthaecohusk.com",
        "Wasantha Eco Husk",
        $email
    );

    echo json_encode(["success"=>true,"message"=>"Request sent successfully"]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
    exit;
}
