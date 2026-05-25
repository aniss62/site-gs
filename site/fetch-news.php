<?php
/**
 * fetch-news.php — Aggregates RSS feeds and writes news.json
 * Run via cron every 6 hours:
 *   0 */6 * * * php /path/to/public_html/fetch-news.php >> /path/to/.tmp/news-cron.log 2>&1
 * Or trigger manually with security token:
 *   https://yourdomain.ma/fetch-news.php?token=<FETCH_NEWS_TOKEN>
 */

// ── Load .env ─────────────────────────────────────────────────
foreach ([__DIR__ . '/../../.env', __DIR__ . '/../.env'] as $_envPath) {
    if (!is_file($_envPath)) continue;
    foreach (file($_envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $_line) {
        $_line = trim($_line);
        if ($_line === '' || $_line[0] === '#' || !str_contains($_line, '=')) continue;
        [$_k, $_v] = explode('=', $_line, 2);
        $_k = trim($_k); $_v = trim(trim($_v), '"\'');
        if ($_k !== '' && !isset($_ENV[$_k])) { $_ENV[$_k] = $_v; putenv("$_k=$_v"); }
    }
}

// ── Security token (CLI bypasses check) ──────────────────────
$isCli = php_sapi_name() === 'cli';

if (!$isCli) {
    $cronToken = $_ENV['FETCH_NEWS_TOKEN'] ?? '';
    if ($cronToken === '' || ($_GET['token'] ?? '') !== $cronToken) {
        http_response_code(403);
        echo 'Forbidden';
        exit;
    }
    header('Content-Type: text/plain; charset=utf-8');
}

// ── Config ────────────────────────────────────────────────────
$outputFile = __DIR__ . '/assets/data/news-rss.json';
$logFile    = __DIR__ . '/../.tmp/news-fetch.log';
$maxPerFeed = 20;

$feeds = [
    [
        'url'  => 'https://news.google.com/rss/search?q=caroube+carob+maroc+agriculture&hl=fr&gl=MA&ceid=MA:fr',
        'lang' => 'fr',
    ],
    [
        'url'  => 'https://news.google.com/rss/search?q=carob+legumes+morocco+agriculture+export&hl=en&gl=US&ceid=US:en',
        'lang' => 'en',
    ],
];

// ── Logging ───────────────────────────────────────────────────
function logMsg(string $msg): void {
    global $logFile, $isCli;
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL;
    if ($isCli) echo $line;
    else        echo $line;
    @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
}

// ── Fetch RSS feed ────────────────────────────────────────────
function fetchFeed(string $url): ?string {
    $ctx = stream_context_create([
        'http' => [
            'timeout'    => 15,
            'user_agent' => 'Mozilla/5.0 (compatible; GreniersNewsFetcher/1.0)',
            'header'     => "Accept: application/rss+xml, application/xml, text/xml\r\n",
        ],
        'ssl' => [
            'verify_peer'      => true,
            'verify_peer_name' => true,
        ],
    ]);

    $xml = @file_get_contents($url, false, $ctx);
    return $xml !== false ? $xml : null;
}

// ── Parse RSS XML ─────────────────────────────────────────────
function parseRSS(string $xml, string $lang, int $max): array {
    libxml_use_internal_errors(true);
    $doc = simplexml_load_string($xml);
    if ($doc === false) return [];

    $articles = [];
    $items = $doc->channel->item ?? [];

    foreach ($items as $item) {
        $title   = trim((string)$item->title);
        $link    = trim((string)$item->link);
        $pubDate = trim((string)$item->pubDate);
        $source  = trim((string)($item->source ?? 'Google News'));
        $desc    = strip_tags(trim((string)$item->description));

        if (empty($title) || empty($link)) continue;

        // Truncate summary
        $summary = mb_substr($desc, 0, 150, 'UTF-8');
        if (mb_strlen($desc, 'UTF-8') > 150) $summary .= '…';

        // Parse date
        $ts        = strtotime($pubDate);
        $published = $ts ? date('Y-m-d', $ts) : date('Y-m-d');

        $articles[] = [
            'title'     => $title,
            'source'    => $source ?: 'Google News',
            'url'       => $link,
            'published' => $published,
            'summary'   => $summary,
            'lang'      => $lang,
        ];

        if (count($articles) >= $max) break;
    }

    return $articles;
}

// ── Main ──────────────────────────────────────────────────────
logMsg('Starting news fetch...');

$allArticles = [];

foreach ($feeds as $feed) {
    logMsg("Fetching [{$feed['lang']}]: {$feed['url']}");
    $xml = fetchFeed($feed['url']);

    if ($xml === null) {
        logMsg("  ERROR: Could not fetch feed.");
        continue;
    }

    $articles = parseRSS($xml, $feed['lang'], $maxPerFeed);
    logMsg("  Parsed " . count($articles) . " article(s).");
    $allArticles = array_merge($allArticles, $articles);
}

// Sort by date descending
usort($allArticles, fn($a, $b) => strcmp($b['published'], $a['published']));

// Build output
$output = [
    'updated_at' => date('c'),
    'articles'   => $allArticles,
];

// Ensure directory exists
$dir = dirname($outputFile);
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

// Write JSON
$json = json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false) {
    logMsg('ERROR: json_encode failed: ' . json_last_error_msg());
    exit(1);
}

if (file_put_contents($outputFile, $json, LOCK_EX) === false) {
    logMsg("ERROR: Could not write to $outputFile");
    exit(1);
}

logMsg('Written ' . count($allArticles) . ' article(s) to ' . basename($outputFile));
logMsg('Done.');
