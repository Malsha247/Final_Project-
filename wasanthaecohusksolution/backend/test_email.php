<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Adjust path if needed

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'wasanthaeco2001@gmail.com'; // your Gmail address
    $mail->Password   = (getenv('SMTP_PASSWORD_TEST_EMAIL') ?: ''); // your 16-character App Password
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    // Recipients
    $mail->setFrom('wasanthaeco2001@gmail.com', 'Wasantha Eco Husk');
    $mail->addAddress('wasanthaeco2001@gmail.com', 'Malsha'); // Send test to yourself

    // Content
    $mail->isHTML(true);
    $mail->Subject = '🌿 Test Email from Wasantha Eco Husk';
    $mail->Body    = '<h3 style="color:green;">Hello Malsha!</h3><p>This is a test email from PHPMailer using Gmail SMTP.</p>';
    $mail->AltBody = 'Hello Malsha! This is a test email from PHPMailer using Gmail SMTP.';

   $body = "<p>Hi Malsha,</p>
            <p>This is a test email from PHPMailer using Gmail SMTP.</p>";

    $mail->send();
    echo "✅ Test email sent successfully!";
} catch (Exception $e) {
    echo "❌ Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
