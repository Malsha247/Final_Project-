<?php
require_once __DIR__ . '/../_cors.php';
header("Content-Type: application/json");
require_once __DIR__ . '/../../config/db.php';

try {
    $stmt = $conn->prepare("
        SELECT 
            h.id, 
            h.user_id, 
            h.name, 
            h.address, 
            h.phone, 
            h.description, 
            h.image_1, 
            h.image_2, 
            h.latitude, 
            h.longitude, 
            h.created_at, 
            u.email AS user_email
        FROM husk_sellers h
        LEFT JOIN customer u ON u.id = h.user_id
        ORDER BY h.created_at DESC
    ");

    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // âœ… ADD map_link for admin use
    foreach ($rows as &$row) {
        if ($row['latitude'] !== null && $row['longitude'] !== null) {
            $row['map_link'] =
                "https://www.google.com/maps?q=" .
                $row['latitude'] . "," . $row['longitude'];
        } else {
            $row['map_link'] = null;
        }
    }

    echo json_encode([
        "success" => true,
        "message" => count($rows)
            ? "Data fetched successfully"
            : "No husk entries found",
        "husks" => $rows
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
