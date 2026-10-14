<?php
// Live sitemap for the static pages in public_html (index.html, about.html, ...).
// Every *.html file in this folder is listed automatically, so a new page shows
// up here as soon as it is uploaded. Blog posts are handled by WordPress's own
// sitemap at /blog/wp-sitemap.xml.

$allowedHosts = ['luminexagroup.com', 'www.luminexagroup.com'];
$skipFiles = ['404.html'];
$skipPatterns = [
    '/^google[0-9a-f]+\.html$/i', // Search Console verification files
    '/^yandex_/i',
    '/^BingSiteAuth/i',
];
$prettyUrls = true; // pages are linked as /about rather than /about.html

$host = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
if (!in_array($host, $allowedHosts, true)) {
    $host = $allowedHosts[0];
}
$base = 'https://' . $host . '/';

$urls = [];
foreach (glob(__DIR__ . '/*.html') as $file) {
    $name = basename($file);
    if (in_array($name, $skipFiles, true)) {
        continue;
    }
    foreach ($skipPatterns as $pattern) {
        if (preg_match($pattern, $name)) {
            continue 2;
        }
    }
    if ($name === 'index.html') {
        $path = '';
    } else {
        $path = $prettyUrls ? substr($name, 0, -strlen('.html')) : $name;
    }
    $urls[$path] = filemtime($file);
}
ksort($urls); // '' (the homepage) sorts first

header('Content-Type: application/xml; charset=UTF-8');
echo '<?xml version="1.0" encoding="UTF-8"?>', "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', "\n";
foreach ($urls as $path => $mtime) {
    echo "  <url>\n";
    echo '    <loc>', htmlspecialchars($base . $path, ENT_XML1), "</loc>\n";
    echo '    <lastmod>', date('c', $mtime), "</lastmod>\n";
    echo "  </url>\n";
}
echo "</urlset>\n";
