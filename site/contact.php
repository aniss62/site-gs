<?php
/**
 * contact.php — Handles contact form submission
 * Reads SMTP credentials from .env (two levels up from site/)
 * Returns JSON: {"success": true} or {"success": false, "error": "..."}
 */

session_start();

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
    echo json_encode(['success' => true]);
    exit;
}

// ── Session-based rate limiting (no IP, no CSRF) ──────────────
// Sliding window: max 5 submissions per 60-minute session window.
// Hard cooldown: 30 s minimum between consecutive submissions.
$now  = time();
$logs = array_values(array_filter(
    $_SESSION['contact_log'] ?? [],
    fn(int $t): bool => $now - $t < 3600
));

if (count($logs) >= 5) {
    http_response_code(429);
    header('Retry-After: 3600');
    echo json_encode(['success' => false, 'error' => 'Too many requests. Please try again later.']);
    exit;
}

if (!empty($logs) && $now - end($logs) < 30) {
    http_response_code(429);
    header('Retry-After: 30');
    echo json_encode(['success' => false, 'error' => 'Please wait a moment before submitting again.']);
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
// Fallbacks hardcodés : fonctionnent même sans .env sur le serveur
$smtpHost = $_ENV['SMTP_HOST'] ?? '';
$smtpFrom = !empty($_ENV['SMTP_FROM']) ? $_ENV['SMTP_FROM'] : 'Office@lesgreniersdusaiss.ma';
$smtpTo   = !empty($_ENV['SMTP_TO'])   ? $_ENV['SMTP_TO']   : 'Office@lesgreniersdusaiss.ma';

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
$autoloadPath = __DIR__ . '/vendor/autoload.php';

if (is_file($autoloadPath) && !empty($smtpHost)) {
    require_once $autoloadPath;

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $smtpPort = (int)($_ENV['SMTP_PORT'] ?? 587);
        $mail->isSMTP();
        $mail->Host       = $_ENV['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['SMTP_USER'] ?? '';
        $mail->Password   = $_ENV['SMTP_PASS'] ?? '';
        $mail->Port       = $smtpPort;
        $mail->SMTPSecure = $smtpPort === 465
            ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom($smtpFrom, 'Les Greniers du Saïss');
        $mail->addAddress($smtpTo);
        $mail->addReplyTo($email, $name);

        $mail->Subject = $subject;
        $mail->Body    = $body;

        $mail->send();
        $logs[] = $now;
        $_SESSION['contact_log'] = $logs;
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        error_log('[contact.php] PHPMailer error: ' . $mail->ErrorInfo);
        echo json_encode(['success' => false, 'error' => 'Mail error']);
    }
} else {
    // PHP mail() natif — fonctionne sur tout hébergement cPanel sans mot de passe
    $headers  = "From: Les Greniers du Saïss <{$smtpFrom}>\r\n";
    $headers .= "Reply-To: {$name} <{$email}>\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

    $to      = $smtpTo;
    $params  = !empty($smtpFrom) ? "-f {$smtpFrom}" : '';

    if (!empty($to) && mail($to, $subject, $body, $headers, $params)) {
        $logs[] = $now;
        $_SESSION['contact_log'] = $logs;
        echo json_encode(['success' => true]);
    } else {
        error_log('[contact.php] mail() failed — to=' . $to . ' from=' . $smtpFrom);
        echo json_encode(['success' => false, 'error' => 'Mail send failed']);
    }
}
