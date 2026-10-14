# How to add a blog post to the AVP website

Each post is its own HTML page. Adding one takes two edits and an upload.
Open the files in any text editor. **VS Code** (free) is easiest; Notepad or TextEdit work too.

## 1. Create the post page

1. In your site folder, copy `post-template.html`.
2. Rename the copy after the post, using lowercase words joined by dashes, for example
   `how-to-hire-a-virtual-assistant.html`. This becomes the web address:
   `usa-vp.com/how-to-hire-a-virtual-assistant.html`.
3. Open it and search for ✏️. Every place you need to change is marked with it:
   - the `<title>` and description at the top (shown in Google and on the browser tab)
   - category, post title, author, date and reading time
   - cover image, introduction, section headings and paragraphs
   - optional: inline image, quote and summary box. Delete any of these you don't need.
4. When the post is ready, **delete the line** `<meta name="robots" content="noindex">`.
   It keeps drafts out of Google.

### Text formatting cheat sheet

| You want | Type this |
|---|---|
| Paragraph | `<p>Your text</p>` |
| Section heading | `<h2>Heading</h2>` |
| Smaller heading | `<h3>Heading</h3>` |
| **Bold** | `<b>bold words</b>` |
| *Italic* | `<i>italic words</i>` |
| Link | `<a href="contact-us.html">link text</a>` |
| Bulleted list | `<ul><li>One</li><li>Two</li></ul>` |
| Numbered list | `<ol><li>One</li><li>Two</li></ol>` |

Characters to watch out for: write `&amp;` for **&**, `&lt;` for **<** and `&gt;` for **>**.

### Images

- Save images as **.webp** or **.jpg**, about **1600 px wide**, under **300 KB**.
  (squoosh.app converts and shrinks images for free.)
- Put the image file in the same folder as the pages. Refer to it by name: `src="my-photo.webp"`.
- Always fill in `alt="..."` with a short description of the picture.

## 2. Add the post's card to the blog page

1. Open `blog.html` and search for **TO ADD A POST**.
2. Copy one `<a class="blog-card" ...> ... </a>` block and paste it at the **top** of the list,
   so the newest post comes first.
3. In the copy, change:
   - `href="..."` to the new file name, e.g. `how-to-hire-a-virtual-assistant.html`
   - `img src="..."` to the cover image
   - `data-cat="..."` to `operations`, `va` or `growth`. This decides which filter button shows the post.
   - the category label, title, one-sentence summary, and date/reading time
4. Only the first card has the blue highlight (`class="blog-card is-featured"`).
   Remove `is-featured` from the card that used to be first.
5. Optional: to feature the post at the top of the blog page, update the large image,
   the three small thumbnails and the "Read Featured Story" button (all near the top of
   `blog.html`) to point at it.

## 3. Publish

Drag the whole site folder onto your site's **Deploys** tab in Netlify, as before.
Check the post at `your-site/your-post-name.html` and click its card on `blog.html`.

## Replacing the sample content

The six article cards, the three guide cards and `blog-post.html` are examples.
Replace them with real posts, or delete them once you have your own.
Also update the four numbers in the stats row on `blog.html` (120+, 40K+, 300+, 60%)
with your real figures, or delete that block.
