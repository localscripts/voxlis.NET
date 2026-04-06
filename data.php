<?php

declare(strict_types=1);

const CLICK_TRACKING_ALLOWED_ORIGIN_PATTERNS = [
    '#^https://([a-z0-9-]+\.)?voxlis\.net$#i',
    '#^http://localhost(?::\d+)?$#i',
    '#^http://127\.0\.0\.1(?::\d+)?$#i',
];

function is_allowed_cors_origin(string $origin): bool
{
    foreach (CLICK_TRACKING_ALLOWED_ORIGIN_PATTERNS as $pattern) {
        if (preg_match($pattern, $origin) === 1) {
            return true;
        }
    }

    return false;
}

function apply_cors_headers(): void
{
    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin === '') {
        return;
    }

    if (!is_allowed_cors_origin($origin)) {
        return;
    }

    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
}

apply_cors_headers();

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

const CLICK_TRACKING_STORAGE_DIR = __DIR__ . '/cache/data';
const CLICK_TRACKING_LEGACY_STORAGE_DIR = __DIR__ . '/../storage/click-tracking';
const CLICK_TRACKING_DEFAULT_MASTER_KEY = 'UGf8jPrgeWb7wQiTrSNwuEsPBh6tyLOg';
const CLICK_TRACKING_PRICE_MANIFESTS = [
    'roblox' => [
        __DIR__ . '/../public/data/roblox/prices.json',
        'https://voxlis.net/public/data/roblox/prices.json',
    ],
];
const CLICK_TRACKING_ALLOWED_CARD_ACTIONS = [
    'roblox' => ['review', 'more', 'buy-keyempire', 'sunc', 'tag', 'website', 'close'],
];
const CLICK_TRACKING_ALLOWED_UI_EVENTS = [
    'roblox' => [
        'navbar' => [
            'logo-home',
            'desktop-home',
            'desktop-github',
            'desktop-themes',
            'desktop-filter',
            'mobile-quick-search',
            'mobile-quick-github',
            'mobile-quick-themes',
            'mobile-quick-filter',
            'mobile-top-search',
            'mobile-top-filter',
            'mobile-top-menu',
            'mobile-menu-home',
            'mobile-menu-github',
            'mobile-menu-themes',
            'mobile-menu-filter',
        ],
        'themes' => [
            'drawer-open',
            'drawer-close',
            'tab-presets',
            'tab-editor',
            'editor-global',
            'editor-fonts',
            'editor-navbar',
            'editor-footer',
            'editor-cards',
            'editor-featured',
            'editor-images',
            'editor-background',
            'editor-share',
            'preset-select',
            'restore-defaults',
            'hide-featured-ads',
            'hide-promo',
            'background-apply',
            'background-clear',
            'export',
            'import',
        ],
        'filters' => [
            'drawer-open',
        ],
        'featured' => [
            'hide-ads',
            'request',
        ],
        'promo' => [
            'discord',
            'youtube',
            'trustpilot',
            'close',
        ],
        'footer' => [
            'contact',
            'policy',
            'privacy',
        ],
        'toasts' => [
            'filters-prompt-show',
            'filters-prompt-open',
            'filters-prompt-close',
            'themes-prompt-show',
            'themes-prompt-open',
            'themes-prompt-close',
        ],
    ],
];
const CLICK_TRACKING_TARGET_COOLDOWN_SECONDS = 8;
const CLICK_TRACKING_MAX_EVENTS_PER_MINUTE = 20;
const CLICK_TRACKING_MAX_EVENTS_PER_HOUR = 200;

function respond_json(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

function normalize_key(mixed $value): string
{
    $normalized = strtolower(trim((string) $value));
    return preg_match('/^[a-z0-9-]+$/', $normalized) ? $normalized : '';
}

function get_request_payload(): array
{
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    $payload = [];

    if ($method === 'POST') {
        $rawBody = file_get_contents('php://input');
        if (is_string($rawBody) && trim($rawBody) !== '') {
            $decoded = json_decode($rawBody, true);
            if (is_array($decoded)) {
                $payload = $decoded;
            } else {
                $payload = is_array($_POST) ? $_POST : [];
            }
        } else {
            $payload = is_array($_POST) ? $_POST : [];
        }
    } else {
        $payload = is_array($_GET) ? $_GET : [];
    }

    return array_replace($payload, get_query_string_overrides());
}

function get_query_string_overrides(): array
{
    $queryString = trim((string) ($_SERVER['QUERY_STRING'] ?? ''));
    if ($queryString === '') {
        return [];
    }

    $overrides = [];

    if (preg_match('/(?:^|[&;])page=([a-z0-9-]+)/i', $queryString, $matches) === 1) {
        $overrides['page'] = strtolower($matches[1]);
    }

    if (preg_match('/(?:^|[&;])masterkey[:=]([^&;]+)/i', $queryString, $matches) === 1) {
        $overrides['masterkey'] = urldecode($matches[1]);
    }

    return $overrides;
}

function get_page_storage_path(string $pageKey): string
{
    return CLICK_TRACKING_STORAGE_DIR . '/' . $pageKey . '.json';
}

function get_legacy_page_storage_path(string $pageKey): string
{
    return CLICK_TRACKING_LEGACY_STORAGE_DIR . '/' . $pageKey . '.json';
}

function get_rate_limit_storage_path(): string
{
    return CLICK_TRACKING_STORAGE_DIR . '/_rate-limit.json';
}

function get_legacy_rate_limit_storage_path(): string
{
    return CLICK_TRACKING_LEGACY_STORAGE_DIR . '/_rate-limit.json';
}

function ensure_storage_directory(): void
{
    if (is_dir(CLICK_TRACKING_STORAGE_DIR)) {
        return;
    }

    if (!mkdir(CLICK_TRACKING_STORAGE_DIR, 0777, true) && !is_dir(CLICK_TRACKING_STORAGE_DIR)) {
        throw new RuntimeException('Failed to create click tracking storage directory.');
    }
}

function seed_storage_file_from_legacy(string $storagePath, string $legacyPath): void
{
    if (is_file($storagePath) || !is_file($legacyPath) || !is_readable($legacyPath)) {
        return;
    }

    $legacyContents = file_get_contents($legacyPath);
    if (!is_string($legacyContents)) {
        return;
    }

    if (file_put_contents($storagePath, $legacyContents, LOCK_EX) === false) {
        throw new RuntimeException(sprintf(
            'Failed to seed click tracking storage file "%s" from legacy path.',
            $storagePath
        ));
    }
}

function normalize_card_action_map(array $counts): array
{
    $normalized = [];

    foreach ($counts as $slug => $actionCounts) {
        $normalizedSlug = normalize_key($slug);
        if ($normalizedSlug === '' || !is_array($actionCounts)) {
            continue;
        }

        $normalized[$normalizedSlug] = [];
        foreach ($actionCounts as $action => $count) {
            $normalizedAction = normalize_key($action);
            if ($normalizedAction === '' || !is_numeric($count)) {
                continue;
            }

            $normalized[$normalizedSlug][$normalizedAction] = max(0, (int) $count);
        }
    }

    return $normalized;
}

function normalize_ui_event_map(array $counts): array
{
    $normalized = [];

    foreach ($counts as $group => $keyCounts) {
        $normalizedGroup = normalize_key($group);
        if ($normalizedGroup === '' || !is_array($keyCounts)) {
            continue;
        }

        $normalized[$normalizedGroup] = [];
        foreach ($keyCounts as $key => $count) {
            $normalizedKey = normalize_key($key);
            if ($normalizedKey === '' || !is_numeric($count)) {
                continue;
            }

            $normalized[$normalizedGroup][$normalizedKey] = max(0, (int) $count);
        }
    }

    return $normalized;
}

function normalize_counts_payload(array $payload): array
{
    $legacyCardActions = [];
    foreach ($payload as $key => $nestedValue) {
        if ($key === 'card_actions' || $key === 'ui_events') {
            continue;
        }

        if (is_array($nestedValue)) {
            $legacyCardActions[$key] = $nestedValue;
        }
    }

    return [
        'card_actions' => array_replace_recursive(
            normalize_card_action_map($legacyCardActions),
            normalize_card_action_map(isset($payload['card_actions']) && is_array($payload['card_actions']) ? $payload['card_actions'] : []),
        ),
        'ui_events' => normalize_ui_event_map(isset($payload['ui_events']) && is_array($payload['ui_events']) ? $payload['ui_events'] : []),
    ];
}

function get_catalog_price_manifest_sources(string $pageKey): array
{
    $configuredSources = CLICK_TRACKING_PRICE_MANIFESTS[$pageKey] ?? [];
    $sourceList = is_array($configuredSources) ? $configuredSources : [$configuredSources];
    $normalizedSources = [];

    foreach ($sourceList as $source) {
        $normalizedSource = trim((string) $source);
        if ($normalizedSource === '') {
            continue;
        }

        $normalizedSources[] = $normalizedSource;
    }

    return array_values(array_unique($normalizedSources));
}

function fetch_remote_manifest(string $url): string
{
    if (function_exists('curl_init')) {
        $handle = curl_init($url);
        if ($handle === false) {
            throw new RuntimeException(sprintf('Failed to initialize cURL for manifest "%s".', $url));
        }

        curl_setopt_array($handle, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'User-Agent: voxlis-click-tracker/1.0',
            ],
        ]);

        $response = curl_exec($handle);
        $statusCode = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        $curlError = curl_error($handle);
        curl_close($handle);

        if (!is_string($response) || $response === '') {
            throw new RuntimeException(sprintf(
                'Remote price manifest "%s" returned an empty response%s.',
                $url,
                $curlError !== '' ? ' (' . $curlError . ')' : ''
            ));
        }

        if ($statusCode < 200 || $statusCode >= 300) {
            throw new RuntimeException(sprintf(
                'Remote price manifest "%s" returned HTTP %d.',
                $url,
                $statusCode
            ));
        }

        return $response;
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 8,
            'ignore_errors' => true,
            'header' => implode("\r\n", [
                'Accept: application/json',
                'User-Agent: voxlis-click-tracker/1.0',
            ]),
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);
    $headers = is_array($http_response_header ?? null) ? $http_response_header : [];
    $statusCode = 0;

    foreach ($headers as $headerLine) {
        if (preg_match('/^HTTP\/\S+\s+(\d{3})\b/', (string) $headerLine, $matches) === 1) {
            $statusCode = (int) $matches[1];
            break;
        }
    }

    if (!is_string($response) || $response === '') {
        throw new RuntimeException(sprintf('Remote price manifest "%s" could not be loaded.', $url));
    }

    if ($statusCode < 200 || $statusCode >= 300) {
        throw new RuntimeException(sprintf(
            'Remote price manifest "%s" returned HTTP %d.',
            $url,
            $statusCode
        ));
    }

    return $response;
}

function load_catalog_price_manifest_payload(string $pageKey): array
{
    $manifestSources = get_catalog_price_manifest_sources($pageKey);
    if ($manifestSources === []) {
        throw new RuntimeException(sprintf('Missing price manifest sources for page "%s".', $pageKey));
    }

    $errors = [];

    foreach ($manifestSources as $source) {
        try {
            $rawManifest = preg_match('#^https?://#i', $source) === 1
                ? fetch_remote_manifest($source)
                : (
                    is_file($source) && is_readable($source)
                        ? file_get_contents($source)
                        : throw new RuntimeException(sprintf('Local price manifest "%s" is not readable.', $source))
                );

            if (!is_string($rawManifest) || trim($rawManifest) === '') {
                throw new RuntimeException(sprintf('Price manifest source "%s" is empty.', $source));
            }

            $decodedManifest = json_decode($rawManifest, true);
            if (!is_array($decodedManifest)) {
                throw new RuntimeException(sprintf('Price manifest source "%s" is invalid JSON.', $source));
            }

            return $decodedManifest;
        } catch (Throwable $exception) {
            $errors[] = $exception->getMessage();
        }
    }

    throw new RuntimeException(sprintf(
        'Price manifest for page "%s" could not be loaded from any configured source. %s',
        $pageKey,
        implode(' ', $errors)
    ));
}

function load_catalog_price_slugs(string $pageKey): array
{
    static $catalogSlugCache = [];

    if (array_key_exists($pageKey, $catalogSlugCache)) {
        return $catalogSlugCache[$pageKey];
    }

    $decodedManifest = load_catalog_price_manifest_payload($pageKey);

    $catalogSlugs = [];
    $freeProducts = [];

    if (isset($decodedManifest['freeProducts']) && is_array($decodedManifest['freeProducts'])) {
        $freeProducts = array_merge($freeProducts, $decodedManifest['freeProducts']);
    }

    if (isset($decodedManifest['$freeProducts']) && is_array($decodedManifest['$freeProducts'])) {
        $freeProducts = array_merge($freeProducts, $decodedManifest['$freeProducts']);
    }

    foreach ($freeProducts as $freeSlug) {
        $normalizedSlug = normalize_key($freeSlug);
        if ($normalizedSlug !== '') {
            $catalogSlugs[$normalizedSlug] = true;
        }
    }

    foreach ($decodedManifest as $slug => $value) {
        $normalizedSlug = normalize_key($slug);
        if (
            $normalizedSlug === ''
            || $normalizedSlug === 'freeproducts'
            || str_starts_with((string) $slug, '$')
        ) {
            continue;
        }

        $catalogSlugs[$normalizedSlug] = true;
    }

    $catalogSlugCache[$pageKey] = array_keys($catalogSlugs);
    return $catalogSlugCache[$pageKey];
}

function catalog_has_slug(string $pageKey, string $slug): bool
{
    return in_array($slug, load_catalog_price_slugs($pageKey), true);
}

function build_default_counts(): array
{
    return [
        'card_actions' => [],
        'ui_events' => [],
    ];
}

function normalize_timestamp_list(array $timestamps): array
{
    return array_values(
        array_filter(
            array_map(
                static fn(mixed $value): int => is_numeric($value) ? max(0, (int) $value) : 0,
                $timestamps,
            ),
            static fn(int $timestamp): bool => $timestamp > 0,
        ),
    );
}

function normalize_rate_limit_state(array $state): array
{
    $normalized = [];

    foreach ($state as $fingerprint => $record) {
        $normalizedFingerprint = preg_match('/^[a-f0-9]{64}$/', (string) $fingerprint) ? (string) $fingerprint : '';
        if ($normalizedFingerprint === '' || !is_array($record)) {
            continue;
        }

        $events = isset($record['events']) && is_array($record['events'])
            ? normalize_timestamp_list($record['events'])
            : [];
        $targets = [];

        if (isset($record['targets']) && is_array($record['targets'])) {
            foreach ($record['targets'] as $targetKey => $timestamp) {
                $normalizedTargetKey = preg_match('/^[a-z0-9|-]+$/', (string) $targetKey) ? (string) $targetKey : '';
                if ($normalizedTargetKey === '' || !is_numeric($timestamp)) {
                    continue;
                }

                $targets[$normalizedTargetKey] = max(0, (int) $timestamp);
            }
        }

        if ($events !== [] || $targets !== []) {
            $normalized[$normalizedFingerprint] = [
                'events' => $events,
                'targets' => $targets,
            ];
        }
    }

    return $normalized;
}

function read_rate_limit_state_from_handle($handle): array
{
    rewind($handle);
    $rawContents = stream_get_contents($handle);
    if (!is_string($rawContents) || trim($rawContents) === '') {
        return [];
    }

    $decoded = json_decode($rawContents, true);
    return is_array($decoded) ? normalize_rate_limit_state($decoded) : [];
}

function persist_rate_limit_state($handle, array $state): void
{
    $encoded = json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if (!is_string($encoded)) {
        throw new RuntimeException('Failed to encode click tracking rate-limit data.');
    }

    rewind($handle);
    if (!ftruncate($handle, 0)) {
        throw new RuntimeException('Failed to truncate click tracking rate-limit file.');
    }

    if (fwrite($handle, $encoded) === false) {
        throw new RuntimeException('Failed to write click tracking rate-limit file.');
    }

    fflush($handle);
}

function read_counts_from_handle($handle): array
{
    rewind($handle);
    $rawContents = stream_get_contents($handle);
    if (!is_string($rawContents) || trim($rawContents) === '') {
        return build_default_counts();
    }

    $decoded = json_decode($rawContents, true);
    if (!is_array($decoded)) {
        return build_default_counts();
    }

    return array_replace_recursive(build_default_counts(), normalize_counts_payload($decoded));
}

function get_request_fingerprint(): string
{
    $ipAddress = trim((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
    $userAgent = trim((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''));

    if ($ipAddress === '') {
        respond_json(400, [
            'ok' => false,
            'error' => 'Missing visitor fingerprint.',
        ]);
    }

    return hash('sha256', $ipAddress . '|' . substr($userAgent, 0, 200));
}

function enforce_rate_limit(string $targetKey): void
{
    ensure_storage_directory();
    $storagePath = get_rate_limit_storage_path();
    seed_storage_file_from_legacy($storagePath, get_legacy_rate_limit_storage_path());
    $handle = fopen($storagePath, 'c+');
    if ($handle === false) {
        throw new RuntimeException('Failed to open click tracking rate-limit file.');
    }

    $fingerprint = get_request_fingerprint();
    $now = time();
    $minuteWindowStart = $now - 60;
    $hourWindowStart = $now - 3600;
    $targetCooldownCutoff = $now - CLICK_TRACKING_TARGET_COOLDOWN_SECONDS;

    try {
        if (!flock($handle, LOCK_EX)) {
            throw new RuntimeException('Failed to lock click tracking rate-limit file.');
        }

        $state = read_rate_limit_state_from_handle($handle);
        $record = $state[$fingerprint] ?? [
            'events' => [],
            'targets' => [],
        ];

        $record['events'] = array_values(
            array_filter(
                normalize_timestamp_list($record['events'] ?? []),
                static fn(int $timestamp): bool => $timestamp >= $hourWindowStart,
            ),
        );
        $record['targets'] = array_filter(
            is_array($record['targets'] ?? null) ? $record['targets'] : [],
            static fn(mixed $timestamp): bool => is_numeric($timestamp) && (int) $timestamp >= $targetCooldownCutoff,
        );

        $eventsThisMinute = array_values(
            array_filter(
                $record['events'],
                static fn(int $timestamp): bool => $timestamp >= $minuteWindowStart,
            ),
        );

        $lastTargetTimestamp = isset($record['targets'][$targetKey]) ? (int) $record['targets'][$targetKey] : 0;
        if ($lastTargetTimestamp > 0 && ($now - $lastTargetTimestamp) < CLICK_TRACKING_TARGET_COOLDOWN_SECONDS) {
            flock($handle, LOCK_UN);
            respond_json(429, [
                'ok' => false,
                'error' => 'Too many repeated clicks for this action.',
                'retry_after' => CLICK_TRACKING_TARGET_COOLDOWN_SECONDS - ($now - $lastTargetTimestamp),
            ]);
        }

        if (count($eventsThisMinute) >= CLICK_TRACKING_MAX_EVENTS_PER_MINUTE) {
            flock($handle, LOCK_UN);
            respond_json(429, [
                'ok' => false,
                'error' => 'Too many clicks in a short time.',
                'retry_after' => max(1, 60 - ($now - min($eventsThisMinute))),
            ]);
        }

        if (count($record['events']) >= CLICK_TRACKING_MAX_EVENTS_PER_HOUR) {
            flock($handle, LOCK_UN);
            respond_json(429, [
                'ok' => false,
                'error' => 'Too many clicks in the last hour.',
                'retry_after' => max(1, 3600 - ($now - min($record['events']))),
            ]);
        }

        $record['events'][] = $now;
        $record['targets'][$targetKey] = $now;
        $state[$fingerprint] = $record;

        foreach ($state as $stateFingerprint => $stateRecord) {
            $stateEvents = array_values(
                array_filter(
                    normalize_timestamp_list(is_array($stateRecord['events'] ?? null) ? $stateRecord['events'] : []),
                    static fn(int $timestamp): bool => $timestamp >= $hourWindowStart,
                ),
            );
            $stateTargets = array_filter(
                is_array($stateRecord['targets'] ?? null) ? $stateRecord['targets'] : [],
                static fn(mixed $timestamp): bool => is_numeric($timestamp) && (int) $timestamp >= $targetCooldownCutoff,
            );

            if ($stateEvents === [] && $stateTargets === []) {
                unset($state[$stateFingerprint]);
                continue;
            }

            $state[$stateFingerprint] = [
                'events' => $stateEvents,
                'targets' => $stateTargets,
            ];
        }

        persist_rate_limit_state($handle, $state);
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }
}

function with_locked_counts(string $pageKey, int $lockType, callable $callback): array
{
    ensure_storage_directory();
    $storagePath = get_page_storage_path($pageKey);
    seed_storage_file_from_legacy($storagePath, get_legacy_page_storage_path($pageKey));
    $handle = fopen($storagePath, 'c+');
    if ($handle === false) {
        throw new RuntimeException('Failed to open click tracking storage file.');
    }

    try {
        if (!flock($handle, $lockType)) {
            throw new RuntimeException('Failed to lock click tracking storage file.');
        }

        $counts = read_counts_from_handle($handle);
        $result = $callback($counts, $handle);
        flock($handle, LOCK_UN);

        return $result;
    } finally {
        fclose($handle);
    }
}

function persist_counts($handle, array $counts): void
{
    $encoded = json_encode($counts, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if (!is_string($encoded)) {
        throw new RuntimeException('Failed to encode click tracking data.');
    }

    rewind($handle);
    if (!ftruncate($handle, 0)) {
        throw new RuntimeException('Failed to truncate click tracking storage file.');
    }

    if (fwrite($handle, $encoded) === false) {
        throw new RuntimeException('Failed to write click tracking storage file.');
    }

    fflush($handle);
}

function validate_page_key(string $pageKey): void
{
    if ($pageKey === '' || !array_key_exists($pageKey, CLICK_TRACKING_PRICE_MANIFESTS)) {
        respond_json(400, [
            'ok' => false,
            'error' => 'Invalid page key.',
        ]);
    }
}

function validate_card_action_request(string $pageKey, string $slug, string $action): void
{
    if ($slug === '' || !catalog_has_slug($pageKey, $slug)) {
        respond_json(400, [
            'ok' => false,
            'error' => 'This product is not in the Roblox prices catalog.',
        ]);
    }

    $allowedActions = CLICK_TRACKING_ALLOWED_CARD_ACTIONS[$pageKey] ?? [];
    if (!in_array($action, $allowedActions, true)) {
        respond_json(400, [
            'ok' => false,
            'error' => 'This tracking target is not allowed.',
        ]);
    }
}

function validate_ui_event_request(string $pageKey, string $group, string $key): void
{
    $allowedGroups = CLICK_TRACKING_ALLOWED_UI_EVENTS[$pageKey] ?? [];
    $allowedKeys = $allowedGroups[$group] ?? [];
    if ($group === '' || $key === '' || !in_array($key, $allowedKeys, true)) {
        respond_json(400, [
            'ok' => false,
            'error' => 'This UI tracking event is not allowed.',
        ]);
    }
}

function get_configured_master_keys(): array
{
    $configuredKeys = [];
    $multiKeyEnvironmentValue = trim((string) (getenv('VOXLIS_DATA_MASTER_KEYS') ?: ''));

    if ($multiKeyEnvironmentValue !== '') {
        $configuredKeys = preg_split('/[\s,]+/', $multiKeyEnvironmentValue) ?: [];
    }

    if ($configuredKeys === []) {
        $singleKeyEnvironmentValue = trim((string) (getenv('VOXLIS_DATA_MASTER_KEY') ?: ''));
        $configuredKeys = $singleKeyEnvironmentValue !== ''
            ? [$singleKeyEnvironmentValue]
            : [CLICK_TRACKING_DEFAULT_MASTER_KEY];
    }

    $normalizedKeys = [];
    foreach ($configuredKeys as $configuredKey) {
        $trimmedKey = trim((string) $configuredKey);
        if ($trimmedKey === '') {
            continue;
        }

        $normalizedKeys[$trimmedKey] = true;
    }

    return array_keys($normalizedKeys);
}

function request_has_valid_master_key(array $payload): bool
{
    $providedKey = trim((string) ($payload['masterkey'] ?? ''));
    if ($providedKey === '') {
        return false;
    }

    foreach (get_configured_master_keys() as $configuredKey) {
        if (hash_equals($configuredKey, $providedKey)) {
            return true;
        }
    }

    return false;
}

function require_valid_master_key(array $payload): void
{
    if (request_has_valid_master_key($payload)) {
        return;
    }

    respond_json(403, [
        'ok' => false,
        'error' => 'Invalid or missing master key.',
    ]);
}

function validate_card_slug(string $pageKey, string $slug): void
{
    if ($slug === '' || !catalog_has_slug($pageKey, $slug)) {
        respond_json(400, [
            'ok' => false,
            'error' => 'This product is not in the Roblox prices catalog.',
        ]);
    }
}

function validate_card_action_key(string $pageKey, string $action): void
{
    $allowedActions = CLICK_TRACKING_ALLOWED_CARD_ACTIONS[$pageKey] ?? [];
    if (!in_array($action, $allowedActions, true)) {
        respond_json(400, [
            'ok' => false,
            'error' => 'This tracking target is not allowed.',
        ]);
    }
}

function validate_ui_group(string $pageKey, string $group): void
{
    $allowedGroups = CLICK_TRACKING_ALLOWED_UI_EVENTS[$pageKey] ?? [];
    if ($group === '' || !array_key_exists($group, $allowedGroups)) {
        respond_json(400, [
            'ok' => false,
            'error' => 'This UI tracking group is not allowed.',
        ]);
    }
}

function get_admin_integer_value(array $payload, string $field = 'value'): int
{
    if (!array_key_exists($field, $payload) || !is_numeric($payload[$field])) {
        respond_json(400, [
            'ok' => false,
            'error' => sprintf('Admin field "%s" must be numeric.', $field),
        ]);
    }

    return (int) $payload[$field];
}

function normalize_counts_for_storage(array $counts): array
{
    $normalizedCounts = array_replace_recursive(build_default_counts(), normalize_counts_payload($counts));
    $prunedCounts = build_default_counts();

    foreach (($normalizedCounts['card_actions'] ?? []) as $slug => $actionCounts) {
        if (!is_array($actionCounts)) {
            continue;
        }

        $filteredActionCounts = [];
        foreach ($actionCounts as $action => $count) {
            if (!is_numeric($count)) {
                continue;
            }

            $normalizedCount = max(0, (int) $count);
            if ($normalizedCount <= 0) {
                continue;
            }

            $filteredActionCounts[(string) $action] = $normalizedCount;
        }

        if ($filteredActionCounts !== []) {
            $prunedCounts['card_actions'][(string) $slug] = $filteredActionCounts;
        }
    }

    foreach (($normalizedCounts['ui_events'] ?? []) as $group => $keyCounts) {
        if (!is_array($keyCounts)) {
            continue;
        }

        $filteredKeyCounts = [];
        foreach ($keyCounts as $key => $count) {
            if (!is_numeric($count)) {
                continue;
            }

            $normalizedCount = max(0, (int) $count);
            if ($normalizedCount <= 0) {
                continue;
            }

            $filteredKeyCounts[(string) $key] = $normalizedCount;
        }

        if ($filteredKeyCounts !== []) {
            $prunedCounts['ui_events'][(string) $group] = $filteredKeyCounts;
        }
    }

    return $prunedCounts;
}

function clear_rate_limit_storage(): int
{
    ensure_storage_directory();
    $storagePath = get_rate_limit_storage_path();
    seed_storage_file_from_legacy($storagePath, get_legacy_rate_limit_storage_path());
    $handle = fopen($storagePath, 'c+');
    if ($handle === false) {
        throw new RuntimeException('Failed to open click tracking rate-limit file.');
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            throw new RuntimeException('Failed to lock click tracking rate-limit file.');
        }

        $state = read_rate_limit_state_from_handle($handle);
        persist_rate_limit_state($handle, []);
        flock($handle, LOCK_UN);

        return count($state);
    } finally {
        fclose($handle);
    }
}

function handle_admin_action(string $pageKey, array $payload): void
{
    require_valid_master_key($payload);

    $adminAction = normalize_key($payload['admin_action'] ?? '');
    if ($adminAction === '') {
        respond_json(400, [
            'ok' => false,
            'error' => 'Missing admin action.',
        ]);
    }

    if ($adminAction === 'get') {
        $result = with_locked_counts($pageKey, LOCK_SH, static function (array $counts): array {
            return ['counts' => $counts];
        });

        respond_json(200, [
            'ok' => true,
            'page' => $pageKey,
            'admin_action' => $adminAction,
            'counts' => $result['counts'],
        ]);
    }

    if ($adminAction === 'replace-counts') {
        $providedCounts = isset($payload['counts']) && is_array($payload['counts']) ? $payload['counts'] : null;
        if ($providedCounts === null) {
            respond_json(400, [
                'ok' => false,
                'error' => 'Admin action "replace-counts" requires a counts object.',
            ]);
        }

        $result = with_locked_counts($pageKey, LOCK_EX, static function (array $counts, $handle) use ($providedCounts): array {
            $nextCounts = normalize_counts_for_storage($providedCounts);
            persist_counts($handle, $nextCounts);

            return [
                'counts' => $nextCounts,
            ];
        });

        respond_json(200, [
            'ok' => true,
            'page' => $pageKey,
            'admin_action' => $adminAction,
            'counts' => $result['counts'],
        ]);
    }

    if ($adminAction === 'clear-rate-limits') {
        $clearedEntries = clear_rate_limit_storage();

        respond_json(200, [
            'ok' => true,
            'page' => $pageKey,
            'admin_action' => $adminAction,
            'cleared_entries' => $clearedEntries,
        ]);
    }

    $scope = normalize_key($payload['scope'] ?? '');
    if ($scope === '') {
        respond_json(400, [
            'ok' => false,
            'error' => 'Missing admin scope.',
        ]);
    }

    if ($adminAction === 'set' || $adminAction === 'add') {
        $value = get_admin_integer_value($payload);

        if ($scope === 'card-action') {
            $slug = normalize_key($payload['slug'] ?? '');
            $action = normalize_key($payload['action'] ?? '');
            validate_card_slug($pageKey, $slug);
            validate_card_action_key($pageKey, $action);

            $result = with_locked_counts($pageKey, LOCK_EX, static function (array $counts, $handle) use ($slug, $action, $value, $adminAction): array {
                $currentCount = max(0, (int) ($counts['card_actions'][$slug][$action] ?? 0));
                $nextCount = $adminAction === 'add'
                    ? max(0, $currentCount + $value)
                    : max(0, $value);

                if ($nextCount <= 0) {
                    unset($counts['card_actions'][$slug][$action]);
                    if (($counts['card_actions'][$slug] ?? []) === []) {
                        unset($counts['card_actions'][$slug]);
                    }
                } else {
                    if (!isset($counts['card_actions'][$slug]) || !is_array($counts['card_actions'][$slug])) {
                        $counts['card_actions'][$slug] = [];
                    }

                    $counts['card_actions'][$slug][$action] = $nextCount;
                }

                $counts = normalize_counts_for_storage($counts);
                persist_counts($handle, $counts);

                return [
                    'counts' => $counts,
                    'count' => $nextCount,
                ];
            });

            respond_json(200, [
                'ok' => true,
                'page' => $pageKey,
                'admin_action' => $adminAction,
                'scope' => $scope,
                'slug' => $slug,
                'action' => $action,
                'count' => $result['count'],
                'counts' => $result['counts'],
            ]);
        }

        if ($scope === 'ui-key') {
            $group = normalize_key($payload['group'] ?? '');
            $key = normalize_key($payload['key'] ?? '');
            validate_ui_event_request($pageKey, $group, $key);

            $result = with_locked_counts($pageKey, LOCK_EX, static function (array $counts, $handle) use ($group, $key, $value, $adminAction): array {
                $currentCount = max(0, (int) ($counts['ui_events'][$group][$key] ?? 0));
                $nextCount = $adminAction === 'add'
                    ? max(0, $currentCount + $value)
                    : max(0, $value);

                if ($nextCount <= 0) {
                    unset($counts['ui_events'][$group][$key]);
                    if (($counts['ui_events'][$group] ?? []) === []) {
                        unset($counts['ui_events'][$group]);
                    }
                } else {
                    if (!isset($counts['ui_events'][$group]) || !is_array($counts['ui_events'][$group])) {
                        $counts['ui_events'][$group] = [];
                    }

                    $counts['ui_events'][$group][$key] = $nextCount;
                }

                $counts = normalize_counts_for_storage($counts);
                persist_counts($handle, $counts);

                return [
                    'counts' => $counts,
                    'count' => $nextCount,
                ];
            });

            respond_json(200, [
                'ok' => true,
                'page' => $pageKey,
                'admin_action' => $adminAction,
                'scope' => $scope,
                'group' => $group,
                'key' => $key,
                'count' => $result['count'],
                'counts' => $result['counts'],
            ]);
        }

        respond_json(400, [
            'ok' => false,
            'error' => 'Admin action supports only "card-action" or "ui-key" scope for set/add.',
        ]);
    }

    if ($adminAction === 'reset') {
        if (!in_array($scope, ['all', 'card', 'card-action', 'ui-group', 'ui-key'], true)) {
            respond_json(400, [
                'ok' => false,
                'error' => 'Admin reset scope must be one of: all, card, card-action, ui-group, ui-key.',
            ]);
        }

        $result = with_locked_counts($pageKey, LOCK_EX, static function (array $counts, $handle) use ($pageKey, $scope, $payload): array {
            if ($scope === 'all') {
                $counts = build_default_counts();
            } elseif ($scope === 'card') {
                $slug = normalize_key($payload['slug'] ?? '');
                validate_card_slug($pageKey, $slug);
                unset($counts['card_actions'][$slug]);
            } elseif ($scope === 'card-action') {
                $slug = normalize_key($payload['slug'] ?? '');
                $action = normalize_key($payload['action'] ?? '');
                validate_card_slug($pageKey, $slug);
                validate_card_action_key($pageKey, $action);
                unset($counts['card_actions'][$slug][$action]);
                if (($counts['card_actions'][$slug] ?? []) === []) {
                    unset($counts['card_actions'][$slug]);
                }
            } elseif ($scope === 'ui-group') {
                $group = normalize_key($payload['group'] ?? '');
                validate_ui_group($pageKey, $group);
                unset($counts['ui_events'][$group]);
            } elseif ($scope === 'ui-key') {
                $group = normalize_key($payload['group'] ?? '');
                $key = normalize_key($payload['key'] ?? '');
                validate_ui_event_request($pageKey, $group, $key);
                unset($counts['ui_events'][$group][$key]);
                if (($counts['ui_events'][$group] ?? []) === []) {
                    unset($counts['ui_events'][$group]);
                }
            }

            $counts = normalize_counts_for_storage($counts);
            persist_counts($handle, $counts);

            return [
                'counts' => $counts,
            ];
        });

        $responsePayload = [
            'ok' => true,
            'page' => $pageKey,
            'admin_action' => $adminAction,
            'scope' => $scope,
            'counts' => $result['counts'],
        ];

        $slug = normalize_key($payload['slug'] ?? '');
        $action = normalize_key($payload['action'] ?? '');
        $group = normalize_key($payload['group'] ?? '');
        $key = normalize_key($payload['key'] ?? '');
        if ($slug !== '') {
            $responsePayload['slug'] = $slug;
        }

        if ($action !== '') {
            $responsePayload['action'] = $action;
        }

        if ($group !== '') {
            $responsePayload['group'] = $group;
        }

        if ($key !== '') {
            $responsePayload['key'] = $key;
        }

        respond_json(200, $responsePayload);
    }

    respond_json(400, [
        'ok' => false,
        'error' => 'Unsupported admin action.',
    ]);
}

function build_public_card_leaderboard(array $counts): array
{
    $cardTotals = [];

    foreach (($counts['card_actions'] ?? []) as $slug => $actionCounts) {
        if (!is_array($actionCounts)) {
            continue;
        }

        $total = 0;
        foreach ($actionCounts as $count) {
            if (is_numeric($count)) {
                $total += max(0, (int) $count);
            }
        }

        if ($total > 0) {
            $cardTotals[] = [
                'slug' => (string) $slug,
                'total' => $total,
            ];
        }
    }

    usort($cardTotals, static function (array $left, array $right): int {
        $totalComparison = $right['total'] <=> $left['total'];
        if ($totalComparison !== 0) {
            return $totalComparison;
        }

        return strcmp((string) $left['slug'], (string) $right['slug']);
    });

    return array_values(
        array_map(
            static fn(array $entry): string => (string) $entry['slug'],
            $cardTotals,
        ),
    );
}

try {
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if (!in_array($method, ['GET', 'POST'], true)) {
        respond_json(405, [
            'ok' => false,
            'error' => 'Method not allowed.',
        ]);
    }

    $payload = get_request_payload();
    $pageKey = normalize_key($payload['page'] ?? '');
    $hasValidMasterKey = request_has_valid_master_key($payload);
    validate_page_key($pageKey);

    if ($method === 'GET') {
        $result = with_locked_counts($pageKey, LOCK_SH, static function (array $counts): array {
            return ['counts' => $counts];
        });

        if ($hasValidMasterKey) {
            respond_json(200, [
                'ok' => true,
                'page' => $pageKey,
                'counts' => $result['counts'],
            ]);
        }

        respond_json(200, build_public_card_leaderboard($result['counts']));
    }

    if (array_key_exists('admin_action', $payload)) {
        handle_admin_action($pageKey, $payload);
    }

    $trackingType = normalize_key($payload['type'] ?? 'card');
    if ($trackingType === 'ui') {
        $group = normalize_key($payload['group'] ?? '');
        $key = normalize_key($payload['key'] ?? '');
        validate_ui_event_request($pageKey, $group, $key);
        enforce_rate_limit($pageKey . '|ui|' . $group . '|' . $key);

        $result = with_locked_counts($pageKey, LOCK_EX, static function (array $counts, $handle) use ($group, $key): array {
            if (!isset($counts['ui_events'][$group]) || !is_array($counts['ui_events'][$group])) {
                $counts['ui_events'][$group] = [];
            }

            $counts['ui_events'][$group][$key] = max(0, (int) ($counts['ui_events'][$group][$key] ?? 0)) + 1;
            persist_counts($handle, $counts);

            return [
                'counts' => $counts,
                'count' => $counts['ui_events'][$group][$key],
            ];
        });

        $responsePayload = [
            'ok' => true,
            'page' => $pageKey,
            'type' => 'ui',
            'group' => $group,
            'key' => $key,
        ];

        if ($hasValidMasterKey) {
            $responsePayload['count'] = $result['count'];
            $responsePayload['counts'] = $result['counts'];
        }

        respond_json(200, $responsePayload);
    }

    $slug = normalize_key($payload['slug'] ?? '');
    $action = normalize_key($payload['action'] ?? '');
    validate_card_action_request($pageKey, $slug, $action);
    enforce_rate_limit($pageKey . '|card|' . $slug . '|' . $action);

    $result = with_locked_counts($pageKey, LOCK_EX, static function (array $counts, $handle) use ($slug, $action): array {
        if (!isset($counts['card_actions'][$slug]) || !is_array($counts['card_actions'][$slug])) {
            $counts['card_actions'][$slug] = [];
        }

        $counts['card_actions'][$slug][$action] = max(0, (int) ($counts['card_actions'][$slug][$action] ?? 0)) + 1;
        persist_counts($handle, $counts);

        return [
            'counts' => $counts,
            'count' => $counts['card_actions'][$slug][$action],
        ];
    });

    $responsePayload = [
        'ok' => true,
        'page' => $pageKey,
        'type' => 'card',
        'slug' => $slug,
        'action' => $action,
    ];

    if ($hasValidMasterKey) {
        $responsePayload['count'] = $result['count'];
        $responsePayload['counts'] = $result['counts'];
    }

    respond_json(200, $responsePayload);
} catch (Throwable $error) {
    respond_json(500, [
        'ok' => false,
        'error' => 'Click tracking failed.',
        'details' => $error->getMessage(),
    ]);
}
