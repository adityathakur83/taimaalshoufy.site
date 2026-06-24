# Taymaa Alshoufy — Architecture & Interior Design Website

A 5-page, SEO-optimised portfolio website with a 3D architectural look & feel,
mouse-driven parallax, and scroll animations. Built with plain **HTML, CSS & JS** —
no build step, no frameworks.

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Home — 3D hero scene, services, featured work, reels teaser |
| `about.html` | About — story, experience timeline, software skill bars |
| `portfolio.html` | Work — filterable project grid (Residential / Commercial / Event / 3D) |
| `reels.html` | Video Reels — click-to-play lightbox (YouTube / Vimeo / MP4) |
| `contact.html` | Contact — enquiry form (opens email), info card, Abu Dhabi map |

## Run it
Just open `index.html` in a browser. For correct relative paths during testing:
```bash
cd site
python -m http.server 8000      # then visit http://localhost:8000
```

## 3D / animation features
- **Hero — scroll-scrubbed video (`js/hero.js`)**: the hero film (`assets/hero.mp4`)
  is *paused* and its `currentTime` is driven by scroll — scrolling scrubs the clip
  forward/back. The title overlay fades out, a gold progress bar fills, and the video
  scrolls naturally into the next section. Section length is set by
  `.vhero { height: 380vh }` in `css/style.css` (taller = slower scrub).
- **Scroll reveals**: any `.reveal` element rises in 3D when it enters the viewport.
- **Tilt**: any `[data-tilt]` card tilts toward the cursor.
- **Parallax cut-outs**: any `[data-parallax]` element drifts on scroll.
- Respects `prefers-reduced-motion` (the hero holds a single static frame, no scrub).

## ⭐ Swapping / optimising the hero video
- The current clip is `assets/hero.mp4` (referenced in `index.html`). To use a different
  film, replace that file (or update the `<source src>` in the `.vhero` section).
- **Important — keep it web-optimised:** the file must be **fast-start** (the `moov`
  atom at the *front*) so it streams and scrubs immediately instead of forcing a full
  download. This repo's clip was already fast-started. For any new clip run:
  ```bash
  ffmpeg -i input.mp4 -movflags +faststart -vcodec libx264 -an hero.mp4
  ```
- **For buttery scrubbing**, dense keyframes help a lot (seeking between sparse
  keyframes is slow). Re-encode with a small GOP:
  ```bash
  ffmpeg -i input.mp4 -movflags +faststart -g 12 -an hero.mp4
  ```
- Keep it small — aim for **≤ ~8–10 MB** and ~1080p. (The current clip is ~21 MB, which
  is heavy; compressing it will noticeably speed up first load.)
- Cache-busting: asset links use `?v=YYYYMMDD`. If you replace a file, bump that number
  in `index.html` so browsers fetch the new version.

## Make it yours — checklist
1. **Images** — replace `assets/placeholder.svg` references in the cards with your real
   renders/photos (`.jpg/.png/.webp`). Keep `object-fit:cover`.
2. **Reels** — set each `.reel`'s `data-video="..."` to a YouTube/Vimeo embed URL or a
   direct `.mp4`. Empty = "coming soon" message.
3. **Domain** — find/replace `https://www.taymaaalshoufy.com` with your real domain in
   every `.html`, plus `sitemap.xml` and `robots.txt`.
4. **Instagram** — replace the `#` in the footer/social links.
5. **Map** — the contact map is centred on Al Khalidiyah, Abu Dhabi; adjust the `q=` query.

## SEO included
- Unique `<title>`, meta description & keywords per page
- Canonical URLs, Open Graph + Twitter cards, `og-image.svg`
- **Local SEO (UAE)**: `geo.region=AE-AZ`, geo coordinates, `addressCountry: AE`,
  `areaServed` Abu Dhabi/Dubai/UAE
- JSON-LD structured data: `ProfessionalService`, `Person`, `CollectionPage`,
  `VideoGallery`, `ContactPage`
- `sitemap.xml`, `robots.txt`, `site.webmanifest`, semantic headings, `alt` text, lazy images

## Going live (next steps for ranking)
- Host on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, cPanel).
- Create a **Google Business Profile** for "Abu Dhabi" to power local pack results.
- Submit `sitemap.xml` in Google Search Console.
- Add real project photos with descriptive, location-rich `alt` text.
