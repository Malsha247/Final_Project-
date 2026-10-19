<?php
require_once __DIR__ . '/_cors.php';
/* ================= CORS ================= */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:3000', 'http://localhost:3002'];

if (in_array($origin, $allowed)) {
}
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
/* ======================================= */

$data = json_decode(file_get_contents("php://input"), true);
$message = trim($data['message'] ?? '');

if (!$message) {
    echo json_encode(["reply" => "Please type a message."]);
    exit;
}

/* ===== AUTO HI RESPONSE ===== */
if (in_array(strtolower($message), ["hi", "hello", "hey"])) {
    echo json_encode([
        "reply" => "Hi ðŸ‘‹ Iâ€™m Eco Assistant. I can help you with coconut husk chips, coconut plants, and gardening."
    ]);
    exit;
}

/* ===== OPENAI CONFIG ===== */
$OPENAI_API_KEY = (getenv('OPENAI_API_KEY') ?: '');

/* ===== SYSTEM PROMPT ===== */
$systemPrompt = "
You are Eco Assistant for Wasantha Eco Husk Solutions.

You MUST answer ONLY questions related to:
- Coconut husk chips
- Coconut plants
- Coconut cultivation
- Gardening and agriculture

Answer rules:
- Use simple English
- Be friendly and helpful
- Give clear step-by-step advice when possible
- If the question is NOT about coconut husk, coconut plants, or gardening,
  politely say that you only help with coconut and plant-related topics.

Examples you CAN answer:
- How to use coconut husk chips in plants
- Benefits of coconut husk chips
- How to grow coconut plants
- How often to water coconut plants
- Gardening tips
- Never say 'I don't understand'
";

/* ===== CALL OPENAI ===== */
$payload = [
    "model" => "gpt-4o-mini",
    "messages" => [
        ["role" => "system", "content" => $systemPrompt],
        ["role" => "user", "content" => $message]
    ],
    "temperature" => 0.4
];

$ch = curl_init("https://api.openai.com/v1/chat/completions");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer $OPENAI_API_KEY",
        "Content-Type: application/json"
    ],
    CURLOPT_POSTFIELDS => json_encode($payload)
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(["reply" => "Connection error. Please try again."]);
    exit;
}

curl_close($ch);

$res = json_decode($response, true);
$reply = $res['choices'][0]['message']['content'] ?? "Sorry, I couldnâ€™t generate a reply.";

echo json_encode(["reply" => $reply]);
exit;
