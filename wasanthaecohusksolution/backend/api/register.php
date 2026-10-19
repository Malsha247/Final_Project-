<?php
require_once __DIR__ . '/_cors.php';
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);
ini_set('error_log', __DIR__ . '/../error_log.txt'); 
header("Content-Type: application/json; charset=UTF-8");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}


require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode(["success" => false, "message" => "Invalid request data"]);
        exit;
    }

    
    if (
        empty($data['firstName']) ||
        empty($data['lastName']) ||
        empty($data['email']) ||
        empty($data['password'])
    ) {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit;
    }

    $firstName = trim($data['firstName']);
    $lastName = trim($data['lastName']);
    $email = trim($data['email']);
    // Passwords must be hashed exactly as entered, matching login verification.
    $password = $data['password'];


    if (strlen($password) < 8) {
        echo json_encode(["success" => false, "message" => "Password must be at least 8 characters long."]);
        exit;
    }


    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format."]);
        exit;
    }

    
    $checkEmail = $conn->prepare("SELECT email FROM customer WHERE email = ?");
    $checkEmail->execute([$email]);
    if ($checkEmail->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "Email already registered."]);
        exit;
    }


    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $insert = $conn->prepare("INSERT INTO customer (first_name, last_name, email, password) VALUES (?, ?, ?, ?)");
    $insert->execute([$firstName, $lastName, $email, $hashedPassword]);

    
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'wasanthaeco2001@gmail.com'; 
        $mail->Password   = (getenv('SMTP_PASSWORD_API_REGISTER') ?: ''); 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        

        $mail->setFrom('wasanthaeco2001@gmail.com', 'Wasantha Eco Husk Solutions');
        $mail->addAddress($email, "$firstName $lastName");

        $mail->isHTML(true);
        $mail->Subject = "Welcome to Wasantha Eco Husk Solutions ðŸŒ¿";
        $mail->Body    = "
            <html>
            <body style='font-family: Arial, sans-serif; color: #2e2e2e;'>
                <h2 style='color:#1b5e20;'>Welcome, {$firstName}!</h2>
                <p>Thank you for joining <b>Wasantha Eco Husk Solutions</b>.</p>
                <p>Weâ€™re happy to have you in our eco-friendly community! ðŸŒ±</p>
                <br>
                <p>Best regards,<br><b>Wasantha Eco Husk Team</b></p>
            </body>
            </html>";
        $mail->AltBody = "Welcome, {$firstName}! Thank you for joining Wasantha Eco Husk Solutions.";

        if ($mail->send()) {
            error_log(" Greeting email sent successfully to {$email}");
            echo json_encode(["success" => true, "message" => "Registration successful! Greeting email sent."]);
        } else {
            error_log("PHPMailer send() returned false: " . $mail->ErrorInfo);
            echo json_encode(["success" => true, "message" => "Registered successfully, but email not sent."]);
        }

    } catch (Exception $e) {
        error_log(" Mailer Exception: " . $e->getMessage());
        error_log(" PHPMailer Debug Info: " . $mail->ErrorInfo);
        echo json_encode(["success" => true, "message" => "Registration successful (email sending failed)."]);
    }

} catch (Throwable $e) {
    error_log(" PHP Error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Server error occurred. Please try again later."]);
}
?>
