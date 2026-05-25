<?php
/**
 * fetch-news.php — Agrège les flux RSS et met à jour news.json
 * Les articles marqués "pinned":true sont toujours conservés en tête.
 * Les nouveaux articles RSS s'ajoutent en dessous, dédoublonnés par titre.
 *
 * Cron hebdomadaire (chaque lundi à 6h) :
 *   0 6 * * 1 php /path/to/public_html/fetch-news.php >> /path/to/.tmp/news-cron.log 2>&1
 * Déclenchement manuel :
 *   https://votre-domaine.ma/fetch-news.php?token=greniers2025
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
$outputFile  = __DIR__ . '/assets/data/news.json';
$logFile     = __DIR__ . '/../.tmp/news-fetch.log';
$maxPerFeed  = 5;   // articles RSS max par flux
$maxRssTotal = 6;   // articles RSS conservés au total (les plus récents)

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
    echo $line;
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
        'ssl' => ['verify_peer' => true, 'verify_peer_name' => true],
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
    foreach ($doc->channel->item ?? [] as $item) {
        $title   = trim((string)$item->title);
        $pubDate = trim((string)$item->pubDate);
        $source  = trim((string)($item->source ?? 'Google News'));
        $desc    = strip_tags(trim((string)$item->description));

        if (empty($title)) continue;

        $summary = mb_substr($desc, 0, 200, 'UTF-8');
        if (mb_strlen($desc, 'UTF-8') > 200) $summary .= '…';

        $ts = strtotime($pubDate);
        $articles[] = [
            'title'     => $title,
            'source'    => $source ?: 'Google News',
            'published' => $ts ? date('Y-m-d', $ts) : date('Y-m-d'),
            'summary'   => $summary,
            'lang'      => $lang,
        ];

        if (count($articles) >= $max) break;
    }
    return $articles;
}

// ── Main ──────────────────────────────────────────────────────
logMsg('Démarrage de la mise à jour hebdomadaire...');

// 1. Lire le fichier existant et extraire les articles pinned
$pinnedArticles = [];
if (is_file($outputFile)) {
    $existing = json_decode(file_get_contents($outputFile), true);
    foreach ($existing['articles'] ?? [] as $art) {
        if (!empty($art['pinned'])) {
            $pinnedArticles[] = $art;
        }
    }
}
logMsg(count($pinnedArticles) . ' article(s) pinned conservés.');

// 2. Récupérer les nouveaux articles RSS
$rssArticles = [];
foreach ($feeds as $feed) {
    logMsg("Flux [{$feed['lang']}]: {$feed['url']}");
    $xml = fetchFeed($feed['url']);
    if ($xml === null) { logMsg('  ERREUR: flux inaccessible.'); continue; }
    $parsed = parseRSS($xml, $feed['lang'], $maxPerFeed);
    logMsg('  ' . count($parsed) . ' article(s) récupérés.');
    $rssArticles = array_merge($rssArticles, $parsed);
}

// 3. Dédoublonner les articles RSS par rapport aux pinned (par titre normalisé)
$pinnedTitles = array_map(
    fn($a) => mb_strtolower(trim($a['title'] ?? ''), 'UTF-8'),
    $pinnedArticles
);

$rssArticles = array_filter($rssArticles, function ($art) use ($pinnedTitles) {
    return !in_array(mb_strtolower(trim($art['title'] ?? ''), 'UTF-8'), $pinnedTitles, true);
});

// 4. Trier les RSS par date décroissante et limiter
usort($rssArticles, fn($a, $b) => strcmp($b['published'], $a['published']));
$rssArticles = array_slice(array_values($rssArticles), 0, $maxRssTotal);
logMsg(count($rssArticles) . ' article(s) RSS retenus après dédoublonnage.');

// 5. Fusionner : pinned en tête, RSS en dessous
$allArticles = array_merge($pinnedArticles, $rssArticles);

// 6. Écrire news.json
$dir = dirname($outputFile);
if (!is_dir($dir)) mkdir($dir, 0755, true);

$output = ['updated_at' => date('c'), 'articles' => $allArticles];
$json   = json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if ($json === false) { logMsg('ERREUR json_encode: ' . json_last_error_msg()); exit(1); }
if (file_put_contents($outputFile, $json, LOCK_EX) === false) {
    logMsg("ERREUR: impossible d'écrire dans $outputFile");
    exit(1);
}

logMsg('Terminé — ' . count($allArticles) . ' articles au total (' . count($pinnedArticles) . ' pinned + ' . count($rssArticles) . ' RSS).');
