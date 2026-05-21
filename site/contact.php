<?php
/**
 * contact.php — Handles contact form submission
 * Reads SMTP credentials from .env (two levels up from site/)
 * Returns JSON: {"success": true} or {"success": false, "error": "..."}
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// ── Honeypot check ────────────────────────────────────────────
if (!empty($_POST['website'])) {
    // Bot detected — respond success to not reveal the trap
    echo json_encode(['success' => true]);
    exit;
}

// ── Load .env ─────────────────────────────────────────────────
function loadEnv(string $path): void {
    if (!is_file($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        if (!str_contains($line, '=')) continue;
        [$key, $val] = explode('=', $line, 2);
        $key = trim($key);
        $val = trim(trim($val), '"\'');
        if ($key !== '' && !isset($_ENV[$key])) {
            $_ENV[$key] = $val;
            putenv("$key=$val");
        }
    }
}

loadEnv(__DIR__ . '/../../.env');
loadEnv(__DIR__ . '/../.env');

// ── Sanitize inputs ───────────────────────────────────────────
function sanitize(string $val): string {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$name    = sanitize($_POST['name']    ?? '');
$company = sanitize($_POST['company'] ?? '');
$country = sanitize($_POST['country'] ?? '');
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone   = sanitize($_POST['phone']   ?? '');
$product = sanitize($_POST['product'] ?? '');
$message = sanitize($_POST['message'] ?? '');

// ── Validate required fields ──────────────────────────────────
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Invalid email']);
    exit;
}

// ── Send email ────────────────────────────────────────────────
$smtpHost = $_ENV['SMTP_HOST'] ?? '';
$smtpFrom = $_ENV['SMTP_FROM'] ?? '';
$smtpTo   = $_ENV['SMTP_TO']   ?? $smtpFrom;

// Build email body
$body  = "Nouveau message depuis le site Les Greniers du Saïss\n";
$body .= str_repeat('─', 50) . "\n\n";
$body .= "Nom       : $name\n";
if ($company) $body .= "Société   : $company\n";
if ($country) $body .= "Pays      : $country\n";
$body .= "Email     : $email\n";
if ($phone)   $body .= "Téléphone : $phone\n";
if ($product) $body .= "Produit   : $product\n";
$body .= "\nMessage :\n$message\n";
$body .= "\n" . str_repeat('─', 50) . "\n";
$body .= "Envoyé le : " . date('d/m/Y H:i') . "\n";

$subject = "Demande de contact — {$name}" . ($company ? " ({$company})" : '');

// Try PHPMailer if available, fall back to mail()
$phpmailerPath = __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';

if (is_file($phpmailerPath) && !empty($smtpHost)) {
    require_once $phpmailerPath;
    require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/SMTP.php';
    require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/Exception.php';

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = $_ENV['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['SMTP_USER'] ?? '';
        $mail->Password   = $_ENV['SMTP_PASS'] ?? '';
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = (int)($_ENV['SMTP_PORT'] ?? 587);
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom($smtpFrom, 'Les Greniers du Saïss');
        $mail->addAddress($smtpTo);
        $mail->addReplyTo($email, $name);

        $mail->Subject = $subject;
        $mail->Body    = $body;

        $mail->send();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        error_log('[contact.php] PHPMailer error: ' . $mail->ErrorInfo);
        echo json_encode(['success' => false, 'error' => 'Mail error']);
    }
} else {
    // Fallback: PHP mail()
    $headers  = "From: {$smtpFrom}\r\n";
    $headers .= "Reply-To: {$email}\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

    $to = !empty($smtpTo) ? $smtpTo : ini_get('sendmail_from');

    if (!empty($to) && mail($to, $subject, $body, $headers)) {
        echo json_encode(['success' => true]);
    } else {
        error_log('[contact.php] mail() failed or no SMTP_TO configured');
        echo json_encode(['success' => false, 'error' => 'Mail send failed']);
    }
}
