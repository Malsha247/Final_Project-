<?php

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

session_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../../config/db.php';

try {
    // prefer session auth
    $seller_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : null;

    // dev/test: allow seller_id param if needed
    if (!$seller_id && isset($_GET['seller_id'])) $seller_id = intval($_GET['seller_id']);
    if (!$seller_id) {
        echo json_encode(["success" => false, "message" => "Not authenticated (seller_id required)"]);
        exit;
    }

    $listing_id = isset($_GET['listing_id']) ? intval($_GET['listing_id']) : 0;
    if ($listing_id <= 0) {
        echo json_encode(["success" => false, "message" => "listing_id required"]);
        exit;
    }

    // verify ownership
    $chk = $conn->prepare("SELECT id FROM plant_listings WHERE id = ? AND user_id = ?");
    $chk->execute([$listing_id, $seller_id]);
    if (!$chk->fetch()) {
        echo json_encode(["success" => false, "message" => "Not authorized to view these requests"]);
        exit;
    }

    $stmt = $conn->prepare("
        SELECT pr.id AS request_id, pr.listing_id, pr.requester_name, pr.requester_email, pr.requester_phone,
               pr.quantity, pr.message, pr.created_at
        FROM plant_requests pr
        WHERE pr.listing_id = ?
        ORDER BY pr.created_at DESC
    ");
    $stmt->execute([$listing_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "listing_id" => $listing_id, "requests" => $rows]);
    exit;
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    exit;
}
