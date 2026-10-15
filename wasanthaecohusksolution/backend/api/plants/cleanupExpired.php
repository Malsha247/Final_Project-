<?php

require_once __DIR__ . '/../../config/db.php';


try {
  $stmt = $conn->prepare("SELECT id, image FROM plant_listings WHERE expires_at <= NOW() AND status='active'");
  $stmt->execute();
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  foreach($rows as $r){
 
    if (!empty($r['image'])) {
      $fp = __DIR__ . '/../../' . $r['image'];
      if (file_exists($fp)) @unlink($fp);
    }
  }
  $conn->prepare("UPDATE plant_listings SET status='removed' WHERE expires_at <= NOW() AND status='active'")->execute();
  echo "OK";
} catch (Exception $e) {
  echo $e->getMessage();
}
