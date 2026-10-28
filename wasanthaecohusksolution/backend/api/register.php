<?php
require_once __DIR__ . '/_cors.php';
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);
ini_set('error_log', __DIR__ . '/../error_log.txt'); 
header("Content-Type: application/json; charset=UTF-8");


require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/plants/helpers/sendEmailFallback.php';

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

    $safeFirstName = htmlspecialchars($firstName, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $emailResult = send_email_fallback(
        $email,
        'Welcome to Wasantha Eco Husk Solutions',
        "
            <html>
            <body style='font-family: Arial, sans-serif; color: #20352a;'>
                <h2 style='color:#174b2b;'>Welcome, {$safeFirstName}!</h2>
                <p>Thank you for joining <strong>Wasantha Eco Husk Solutions</strong>.</p>
                <p>We’re happy to have you in our eco-friendly community.</p>
                <p>Best regards,<br><strong>Wasantha Eco Husk Team</strong></p>
            </body>
            </html>",
        'wasanthaeco2001@gmail.com',
            'Wasantha Eco Husk Solutions',
            null,
            getenv('SMTP_PASSWORD_API_REGISTER') ?: null
    );
    $emailSent = ($emailResult === true);
    if (!$emailSent) {
        error_log('Registration welcome email was not sent: ' . $emailResult);
    }

    echo json_encode([
        "success" => true,
        "message" => "Registration successful.",
        "email_sent" => $emailSent,
    ]);

} catch (Throwable $e) {
    error_log(" PHP Error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Server error occurred. Please try again later."]);
}
?>
