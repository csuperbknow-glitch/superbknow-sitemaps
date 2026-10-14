# luminexagroup.com sitemaps

The site has two parts, and each gets its own self-updating sitemap:

| Part | Where | Sitemap |
|---|---|---|
| Static pages (Mobirise: `index.html`, `about.html`, ...) | `public_html/` | `/sitemap.xml`, served live by `sitemap.php` |
| Blog (WordPress) | `public_html/blog/` | `/blog/wp-sitemap.xml`, built in to WordPress |

The old `public_html/sitemap.xml` was a one-off crawl from July 2026. It never
updates, and it is full of duplicates and junk (`?query-25-page=…`,
`/blog/author/…/page/12/`, `?cst=`, mixed `www` / non-`www`).

## Install (Hostinger File Manager)

1. Rename the old `public_html/sitemap.xml` to `sitemap-old.xml` (as a backup).
2. Upload `sitemap.php` into `public_html/`.
3. Open `public_html/.htaccess` and add this line right after
   `RewriteEngine On` (add `RewriteEngine On` first if it isn't there):

   ```apache
   RewriteRule ^sitemap\.xml$ sitemap.php [L]
   ```

4. Add these two lines at the end of `public_html/robots.txt`:

   ```
   Sitemap: https://luminexagroup.com/sitemap.xml
   Sitemap: https://luminexagroup.com/blog/wp-sitemap.xml
   ```

5. Check in a browser that both of these show a list of links:
   - https://luminexagroup.com/sitemap.xml
   - https://luminexagroup.com/blog/wp-sitemap.xml

   If the blog one is blank or 404: in WordPress go to **Settings → Reading**
   and untick **Discourage search engines from indexing this site**. If Yoast
   or Rank Math is installed, use `/blog/sitemap_index.xml` instead.

6. In Search Console → **Sitemaps**, remove every blog post URL that was added
   there, then submit `sitemap.xml` and `blog/wp-sitemap.xml`. That's a one-time
   step. Google re-reads both files on its own.

## Afterwards

- New blog post: nothing to do. WordPress adds it to its sitemap.
- New static page: upload the `.html` file. `sitemap.php` lists it automatically.
- To exclude a page, add its file name to `$skipFiles` in `sitemap.php`.
