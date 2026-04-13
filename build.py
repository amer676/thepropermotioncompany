#!/usr/bin/env python3
"""
Build script: Pre-renders all 300 blog posts as static HTML files.
Generates /blog/<slug>/index.html for each post with full SEO metadata.
Also generates blog index pages with pagination (20 posts per page).
Updates sitemap.xml with clean URLs.
"""
import json, os, re, markdown, html as htmlmod

POSTS_DIR = "posts"
BLOG_DIR = "blog"
SITE_URL = "https://thepropermotioncompany.com"
POSTS_PER_PAGE = 20
OG_IMAGE = f"{SITE_URL}/og-image.png"

with open(os.path.join(POSTS_DIR, "posts.json")) as f:
    posts = json.load(f)

posts.sort(key=lambda x: x["date"], reverse=True)

md = markdown.Markdown(extensions=["extra", "smarty"])

# Read shared components from existing pages
def get_head_block(title, description, canonical, og_title=None, og_type="article"):
    """Generate full <head> with all SEO tags."""
    og_t = og_title or title
    desc_safe = htmlmod.escape(description)
    title_safe = htmlmod.escape(title)
    og_t_safe = htmlmod.escape(og_t)
    return f"""<head>
  <meta charset="UTF-8">
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-CTF8CRVLH4"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-CTF8CRVLH4');</script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title_safe}</title>
  <meta name="description" content="{desc_safe}">
  <link rel="canonical" href="{canonical}">
  <meta property="og:type" content="{og_type}">
  <meta property="og:title" content="{og_t_safe}">
  <meta property="og:description" content="{desc_safe}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:site_name" content="The Proper Motion Company">
  <meta property="og:image" content="{OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{og_t_safe}">
  <meta name="twitter:description" content="{desc_safe}">
  <meta name="twitter:image" content="{OG_IMAGE}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Playfair+Display:wght@400;700&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js" defer></script>
  <script src="/constellation.js" defer></script>
  <script src="/main.js" defer></script>
</head>"""

NAV = """<header class="nav" id="nav" role="banner">
    <a href="/" class="nav-logo" aria-label="Home">
      <span class="nav-logo-brand">The Proper <span class="accent">Motion</span> Company</span>
      <span class="nav-logo-est">Est. 2022</span>
    </a>
    <nav class="nav-right" role="navigation" aria-label="Main">
      <ul class="nav-links">
        <li><a href="/work.html">Work</a></li>
        <li><a href="/process.html">Process</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
      <a href="/contact.html" class="nav-cta">Start a project</a>
    </nav>
    <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </header>
  <div class="mobile-menu" id="mobileMenu">
    <a href="/">Home</a><a href="/work.html">Work</a><a href="/process.html">Process</a><a href="/about.html">About</a><a href="/blog/">Blog</a><a href="/contact.html">Contact</a>
    <span class="mobile-menu-email">team@televistaleadgeneration.com</span>
  </div>"""

FOOTER = """<footer class="footer" role="contentinfo">
    <div class="footer-brand-statement"><div class="container"><div class="footer-big-text">PROPER MOTION</div><div class="footer-big-text-overlay"><div class="footer-tagline">We build the <span class="gold">actual</span> thing.</div></div></div></div>
    <div class="footer-links-area"><div class="container"><div class="footer-grid">
      <div class="footer-brand-col">
        <div class="footer-logo-row"><span class="footer-logo-brand">The Proper <span class="accent">Motion</span> Company</span></div>
        <div class="footer-brand-tagline">Software studio. Design, engineering, AI.<br>Built from scratch since 2022.</div>
        <div class="footer-status"><span class="footer-status-dot"></span> Accepting new projects</div><br>
        <div class="footer-division">A division of Televista Lead Generation</div>
      </div>
      <div><div class="footer-col-label">Navigation</div><ul class="footer-col-links"><li><a href="/">Home</a></li><li><a href="/work.html">Work</a></li><li><a href="/process.html">Process</a></li><li><a href="/about.html">About</a></li><li><a href="/blog/">Blog</a></li><li><a href="/contact.html">Contact</a></li></ul></div>
      <div><div class="footer-col-label">Services</div><ul class="footer-col-links"><li><a href="/#services">Product Design</a></li><li><a href="/#services">Engineering</a></li><li><a href="/#services">AI Integration</a></li></ul></div>
      <div><div class="footer-col-label">Connect</div><a href="mailto:team@televistaleadgeneration.com" class="footer-contact-email">team@televistaleadgeneration.com</a><div class="footer-contact-note">We respond within 1 business day</div></div>
    </div></div></div>
    <div class="footer-disclaimer"><div class="container"><p>The Proper Motion Company is a registered trade name owned and operated by <a href="https://televistaleadgeneration.com" target="_blank" rel="noopener noreferrer">Televista Lead Generation</a>. All services, contracts, and billing are managed through Televista Lead Generation.</p></div></div>
    <div class="footer-bottom"><div class="container"><div class="footer-bottom-inner"><span>&copy; 2022&ndash;2026 The Proper Motion Company</span><span class="gold">&#10022;</span><span>Designed &amp; built by The Proper Motion Company</span></div></div></div>
  </footer>"""

def format_date(d):
    from datetime import datetime
    dt = datetime.strptime(d, "%Y-%m-%d")
    return dt.strftime("%B %d, %Y")

# ============================================================
# Generate individual blog post pages
# ============================================================
print("Generating blog post pages...")
for post in posts:
    slug = post["slug"]
    title = post["title"]
    desc = post["description"]
    date = post["date"]
    tags = post["tags"]
    read_time = post["readTime"]

    # Read markdown
    md_path = os.path.join(POSTS_DIR, f"{slug}.md")
    if not os.path.exists(md_path):
        print(f"  SKIP: {slug} (no markdown file)")
        continue

    with open(md_path) as f:
        md_content = f.read()

    md.reset()
    html_content = md.convert(md_content)

    # Ensure description is at least 100 chars
    if len(desc) < 80:
        desc = f"{title}. {desc} Expert guide from The Proper Motion Company, a custom software studio."

    page_title = f"{title} | The Proper Motion Company Blog"
    if len(page_title) > 65:
        page_title = f"{title} | Proper Motion"
    if len(page_title) > 65:
        page_title = title[:60]

    canonical = f"{SITE_URL}/blog/{slug}/"

    tags_html = "".join(f'<span class="blog-card-tag">{t}</span>' for t in tags)

    # Article schema
    schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": desc[:160],
        "datePublished": date,
        "dateModified": date,
        "author": {
            "@type": "Organization",
            "name": "The Proper Motion Company",
            "url": SITE_URL
        },
        "publisher": {
            "@type": "Organization",
            "name": "The Proper Motion Company",
            "url": SITE_URL
        },
        "mainEntityOfPage": canonical,
        "articleSection": tags[0] if tags else "Software Development",
    }, indent=2)

    page_html = f"""<!DOCTYPE html>
<html lang="en">
{get_head_block(page_title, desc[:160], canonical)}
<body>
  <a href="#blog-post" class="skip-nav">Skip to content</a>
  <div class="page-transition-overlay"></div>
  <div class="scroll-progress" id="scrollProgress"></div>
  <div class="scroll-gradient"></div>
  <div class="cursor-outer" id="cursorOuter"></div>
  <div class="cursor-inner" id="cursorInner"></div>

  {NAV}

  <main>
    <section class="section--dark" id="blog-post" style="padding-top:120px">
      <div class="container">
        <article class="blog-post">
          <div class="blog-post-header">
            <a href="/blog/" class="blog-post-back">&larr; Back to blog</a>
            <div class="blog-post-meta">
              <span class="blog-card-date">{format_date(date)}</span>
              <span class="blog-card-read">{read_time} read</span>
              {tags_html}
            </div>
            <h1 class="blog-post-title">{htmlmod.escape(title)}</h1>
            <p class="blog-post-desc">{htmlmod.escape(desc[:200])}</p>
          </div>
          <div class="blog-post-content">
            {html_content}
          </div>
        </article>
      </div>
    </section>
  </main>

  {FOOTER}

  <script type="application/ld+json">
  {schema}
  </script>
</body>
</html>"""

    # Write to blog/<slug>/index.html
    post_dir = os.path.join(BLOG_DIR, slug)
    os.makedirs(post_dir, exist_ok=True)
    with open(os.path.join(post_dir, "index.html"), "w") as f:
        f.write(page_html)

print(f"  Generated {len(posts)} blog post pages")

# ============================================================
# Generate paginated blog index pages
# ============================================================
print("Generating blog index pages...")
total_pages = (len(posts) + POSTS_PER_PAGE - 1) // POSTS_PER_PAGE

for page_num in range(total_pages):
    start = page_num * POSTS_PER_PAGE
    end = min(start + POSTS_PER_PAGE, len(posts))
    page_posts = posts[start:end]

    if page_num == 0:
        page_title = "Blog — The Proper Motion Company | Software, AI & Design Insights"
        canonical = f"{SITE_URL}/blog/"
        page_dir = BLOG_DIR
    else:
        page_title = f"Blog Page {page_num + 1} — The Proper Motion Company"
        canonical = f"{SITE_URL}/blog/page/{page_num + 1}/"
        page_dir = os.path.join(BLOG_DIR, "page", str(page_num + 1))

    os.makedirs(page_dir, exist_ok=True)

    # Build post cards HTML
    cards = []
    for i, p in enumerate(page_posts):
        tags_h = "".join(f'<span class="blog-card-tag">{t}</span>' for t in p["tags"])
        d = p["description"]
        if len(d) < 50:
            d = f'{p["title"]}. {d}'
        cards.append(f"""<a href="/blog/{p['slug']}/" class="blog-card reveal" style="transition-delay:{i*80}ms">
            <div class="blog-card-meta">
              <span class="blog-card-date">{format_date(p['date'])}</span>
              <span class="blog-card-read">{p['readTime']} read</span>
              {tags_h}
            </div>
            <div class="blog-card-title">{htmlmod.escape(p['title'])}</div>
            <p class="blog-card-desc">{htmlmod.escape(d[:180])}</p>
            <span class="blog-card-link">Read post <span>&rarr;</span></span>
          </a>""")

    cards_html = "\n".join(cards)

    # Pagination nav
    pag_links = []
    if page_num > 0:
        prev_url = "/blog/" if page_num == 1 else f"/blog/page/{page_num}/"
        pag_links.append(f'<a href="{prev_url}" style="color:var(--color-accent);font-size:14px">&larr; Newer posts</a>')
    if page_num < total_pages - 1:
        pag_links.append(f'<a href="/blog/page/{page_num + 2}/" style="color:var(--color-accent);font-size:14px">Older posts &rarr;</a>')
    pag_html = f'<div style="display:flex;justify-content:space-between;margin-top:48px;padding-top:32px;border-top:1px solid var(--color-border-subtle)">{" ".join(pag_links)}</div>' if pag_links else ""

    # Link rel prev/next
    link_tags = ""
    if page_num > 0:
        prev_u = f"{SITE_URL}/blog/" if page_num == 1 else f"{SITE_URL}/blog/page/{page_num}/"
        link_tags += f'\n  <link rel="prev" href="{prev_u}">'
    if page_num < total_pages - 1:
        link_tags += f'\n  <link rel="next" href="{SITE_URL}/blog/page/{page_num + 2}/">'

    # Blog CollectionPage schema (page 1 only)
    schema_block = ""
    if page_num == 0:
        items = []
        for idx, p in enumerate(posts[:10]):
            items.append({
                "@type": "ListItem",
                "position": idx + 1,
                "url": f"{SITE_URL}/blog/{p['slug']}/",
                "name": p["title"]
            })
        schema_block = f"""<script type="application/ld+json">
  {json.dumps({"@context": "https://schema.org", "@type": "CollectionPage", "name": "The Proper Motion Company Blog", "description": "Insights on custom software development, AI integration, product design, and building products that work.", "url": f"{SITE_URL}/blog/", "mainEntity": {"@type": "ItemList", "itemListElement": items}}, indent=2)}
  </script>"""

    desc = "Insights on custom software development, AI integration, product design, and building products that work. From The Proper Motion Company."

    # Hero only on page 1
    hero = ""
    if page_num == 0:
        hero = """<section class="page-hero">
      <div class="page-hero-gradient" style="background:linear-gradient(180deg, rgba(6,8,14,0.3) 0%, rgba(6,8,14,0.95) 100%)"></div>
      <div class="page-hero-content">
        <div class="section-label reveal">// Blog</div>
        <h1 class="hero-headline reveal" style="font-size:52px">Thoughts on<br>building things.</h1>
        <p class="reveal" style="font-weight:400;font-size:18px;color:var(--color-text-secondary);margin-top:24px;max-width:480px;line-height:1.7">Software, design, AI, and the craft of shipping products that actually work.</p>
      </div>
    </section>"""
    else:
        hero = f"""<section class="page-hero" style="min-height:30vh;padding-top:140px">
      <div class="page-hero-content">
        <div class="section-label">// Blog</div>
        <h1 class="section-headline" style="font-size:36px">Page {page_num + 1}</h1>
      </div>
    </section>"""

    head = get_head_block(page_title[:60], desc[:160], canonical, og_type="website")
    # Inject link prev/next into head
    head = head.replace("</head>", f"{link_tags}\n</head>")

    page_html = f"""<!DOCTYPE html>
<html lang="en">
{head}
<body>
  <a href="#blog-list" class="skip-nav">Skip to content</a>
  <div class="page-transition-overlay"></div>
  <div class="scroll-progress" id="scrollProgress"></div>
  <div class="scroll-gradient"></div>
  <div class="cursor-outer" id="cursorOuter"></div>
  <div class="cursor-inner" id="cursorInner"></div>

  {NAV}

  <main>
    {hero}

    <section class="section--dark" style="padding:100px 0" id="blog-list">
      <div class="container">
        <div class="blog-grid">
          {cards_html}
        </div>
        {pag_html}
      </div>
    </section>

    <section class="cta-banner section--mid">
      <div class="container">
        <div class="section-label reveal" style="text-align:center">// Get started</div>
        <h2 class="section-headline reveal" style="text-align:center">Ready to build?</h2>
        <p class="cta-banner-sub reveal">Tell us what you're building.</p>
        <div class="reveal" style="text-align:center"><a href="/contact.html" class="cta-banner-btn">Start a project <span>&rarr;</span></a></div>
      </div>
    </section>
  </main>

  {FOOTER}

  {schema_block}
</body>
</html>"""

    with open(os.path.join(page_dir, "index.html"), "w") as f:
        f.write(page_html)

print(f"  Generated {total_pages} blog index pages")

# ============================================================
# Generate updated sitemap
# ============================================================
print("Generating sitemap...")
sitemap_lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    f'  <url><loc>{SITE_URL}/</loc><lastmod>2026-04-13</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>',
    f'  <url><loc>{SITE_URL}/work.html</loc><lastmod>2026-04-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>',
    f'  <url><loc>{SITE_URL}/process.html</loc><lastmod>2026-04-13</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>',
    f'  <url><loc>{SITE_URL}/about.html</loc><lastmod>2026-04-13</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>',
    f'  <url><loc>{SITE_URL}/contact.html</loc><lastmod>2026-04-13</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>',
    f'  <url><loc>{SITE_URL}/blog/</loc><lastmod>2026-04-13</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>',
]

# Pagination pages
for i in range(1, total_pages):
    sitemap_lines.append(f'  <url><loc>{SITE_URL}/blog/page/{i+1}/</loc><lastmod>2026-04-13</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>')

# Individual posts
for p in posts:
    sitemap_lines.append(f'  <url><loc>{SITE_URL}/blog/{p["slug"]}/</loc><lastmod>{p["date"]}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>')

sitemap_lines.append('</urlset>')

with open("sitemap.xml", "w") as f:
    f.write("\n".join(sitemap_lines) + "\n")

print(f"  Sitemap: {len(sitemap_lines) - 2} URLs")
print("Done!")
