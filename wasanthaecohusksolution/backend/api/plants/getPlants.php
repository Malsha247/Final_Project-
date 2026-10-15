<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");


ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/db.php';

try {
   
    try {
        $conn->prepare("UPDATE plant_listings 
                        SET status='removed' 
                        WHERE expires_at <= NOW() AND status='active'")
             ->execute();
    } catch (Exception $cleanupErr) {
       
    }

  
    $stmt = $conn->prepare("
        SELECT *
        FROM plant_listings
        WHERE status = 'active'
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "plants" => $rows
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
