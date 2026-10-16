# How to add a blog post to the AVP website

Each post is its own HTML page in `public_html`. Adding one takes two edits and an upload.
You can edit the files in Hostinger's file browser, or on your computer with a text editor
(**VS Code** is free) and then upload them.

**Always download a backup of `blog.html` before editing it.**

## 1. Create the post page

1. Copy `post-template.html` and rename the copy after the post, using lowercase words
   joined by dashes, for example `how-to-onboard-a-virtual-assistant.html`.
   This becomes the web address: `usa-vp.com/how-to-onboard-a-virtual-assistant.html`.
2. Open it and search for ✏️. Every place you need to change is marked with it:
   - the `<title>` and description at the top (shown in Google and on the browser tab)
   - category, post title, date and reading time
   - cover image, introduction, section headings and paragraphs
   - optional: inline image, quote and summary box. Delete any of these you don't need.
3. When the post is ready, **delete the line** `<meta name="robots" content="noindex">`.
   It keeps drafts out of Google.

The two published posts (`managing-distributed-teams-accountability.html` and
`outsourced-sales-teams-for-service-businesses.html`) are good examples to copy from.
They show tables, highlighted quotes, bullet boxes and a FAQ section.

### Text formatting cheat sheet

| You want | Type this |
|---|---|
| Paragraph | `<p>Your text</p>` |
| Section heading | `<h2>Heading</h2>` |
| Smaller heading | `<h3>Heading</h3>` |
| **Bold** | `<b>bold words</b>` |
| *Italic* | `<i>italic words</i>` |
| Link | `<a href="contact-us.html#contact-form">link text</a>` |
| Bulleted list | `<ul><li>One</li><li>Two</li></ul>` |
| Numbered list | `<ol><li>One</li><li>Two</li></ol>` |
| Highlighted quote | `<blockquote class="post-pull">Text</blockquote>` |

Characters to watch out for: write `&amp;` for **&**, `&lt;` for **<** and `&gt;` for **>**.

### Images

- Cover images: **1600 × 900 px**, saved as **.webp**, under **300 KB**
  (squoosh.app converts and shrinks images for free).
- Upload the image to `public_html` next to the pages and refer to it by name:
  `src="my-cover.webp"`.
- Always fill in `alt="..."` with a short description of the picture.

## 2. Add the post to the Blog page

Open `blog.html`.

**a) Add its card to "Latest Articles"**
1. Search for **TO ADD A POST**.
2. Copy one `<a class="blog-card" ...> ... </a>` block and paste it at the **top** of the list,
   so the newest post comes first.
3. In the copy, change: `href` (the new file name), `img src` (cover image), the category,
   title, one-sentence summary, and date/reading time.
4. Only the first card has the blue highlight (`class="blog-card is-featured"`).
   Remove `is-featured` from the card that used to be first.
5. Once you have **three or more posts**, delete the "More Insights on the Way" card
   (the block starting with `<div class="blog-card is-soon">`).

**b) Optional: make it the featured post at the top**
Search for **BLOG HEADER + FEATURED POST**. Update the links (`href`), image, category,
title, summary and date in that section to point at the new post.

## 3. Publish

Upload the new post page, its cover image and the updated `blog.html` to `public_html`.
Open `usa-vp.com/blog.html` in an incognito window, check the card, and click through to the post.
