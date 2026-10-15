<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../../config/db.php';
require __DIR__ . '/../../vendor/autoload.php'; 

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['seller_id'])) {
    echo json_encode(["success" => false, "message" => "Seller ID missing"]);
    exit;
}

$seller_id = intval($data['seller_id']);

try {

    $stmt = $conn->prepare("
        SELECT h.name, h.phone, h.address, u.email
        FROM husk_sellers h
        LEFT JOIN customer u ON u.id = h.user_id
        WHERE h.id = ?
    ");
    $stmt->execute([$seller_id]);
    $seller = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$seller) {
        echo json_encode(["success" => false, "message" => "Seller not found"]);
        exit;
    }


    $update = $conn->prepare("UPDATE husk_sellers SET admin_response = 'Responded' WHERE id = ?");
    $update->execute([$seller_id]);

    
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';         
    $mail->SMTPAuth = true;
    $mail->Username = 'wasanthaeco2001@gmail.com'; 
    $mail->Password = (getenv('SMTP_PASSWORD_API_SELLER_SENDRESPONSE') ?: '');   
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

   
    $mail->setFrom('youremail@gmail.com', 'Wasantha Eco Husk Solutions');
    $mail->addAddress($seller['email'], $seller['name']);
    $mail->isHTML(true);
    $mail->Subject = "🌿 Response from Wasantha Eco Husk Solutions";
    $mail->Body = "
        <h3>Hello {$seller['name']},</h3>
        <p>Your coconut husk submission has been reviewed by our team.</p>
        <p>We’ll contact you soon regarding the next steps.</p>
        <br>
        <p><strong>Address:</strong> {$seller['address']}</p>
        <p><strong>Phone:</strong> {$seller['phone']}</p>
        <br>
        <p>Thank you for supporting sustainable eco-husk solutions! 🌿</p>
        <p>– The Wasantha Eco Husk Solutions Team</p>
    ";

    $mail->send();

    echo json_encode(["success" => true, "message" => "Email sent successfully to {$seller['email']}!"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Mailer Error: " . $e->getMessage()]);
} catch (Throwable $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
