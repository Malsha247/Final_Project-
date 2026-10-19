<?php
require_once __DIR__ . '/../../_cors.php';
// backend/api/plants/helpers/sendEmailFallback.php
// Clean, safe email helper.
// DOES NOT load DB
// DOES NOT decide seller/buyer
// ONLY sends email to the given address

function send_email_fallback(
    $to,
    $subject,
    $htmlBody,
    $from = "yourgmail@gmail.com",      // âœ… system email
    $fromName = "Wasantha Eco Husk",
    $replyTo = null
) {
    // Load Composer autoload if available
    $autoload1 = __DIR__ . '/../../../vendor/autoload.php';
    $autoload2 = __DIR__ . '/../../vendor/autoload.php';

    if (file_exists($autoload1)) {
        require_once $autoload1;
    } elseif (file_exists($autoload2)) {
        require_once $autoload2;
    }

    // -----------------------------
    // Use PHPMailer with SMTP
    // -----------------------------
    if (class_exists('\PHPMailer\PHPMailer\PHPMailer')) {
        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

            // ðŸ” SMTP CONFIG (Gmail)
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'wasanthaeco2001@gmail.com'; // ðŸ”´ CHANGE
            $mail->Password   = (getenv('SMTP_PASSWORD_API_PLANTS_HELPERS_SENDEMAILFALLBACK') ?: '');   // ðŸ”´ CHANGE
            $mail->SMTPSecure = 'tls';
            $mail->Port       = 587;

            // Email headers
            $mail->setFrom($from, $fromName);

            if (!empty($replyTo) && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
                $mail->addReplyTo($replyTo);
            }

            $mail->addAddress($to);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;

            $mail->send();
            return true;

        } catch (\PHPMailer\PHPMailer\Exception $e) {
            return "PHPMailer error: " . $e->getMessage();
        }
    }

    // -----------------------------
    // Fallback: PHP mail()
    // -----------------------------
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: {$fromName} <{$from}>\r\n";

    if (!empty($replyTo) && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $headers .= "Reply-To: {$replyTo}\r\n";
    }

    if (@mail($to, $subject, $htmlBody, $headers)) {
        return true;
    }

    return "mail() failed â€” SMTP not configured";
}
