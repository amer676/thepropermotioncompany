# The Proper Motion Company — Full Website Brief
> Complete build specification for Claude Code. Single `index.html` output. All CSS and JS embedded.

---

## Project Overview

Build a complete, multi-section single-file website for **The Proper Motion Company**, a software building company operating as a division of Televista Lead Generation. Output must be one `index.html` file with all CSS and JS embedded. No frameworks, no build tools, no dependencies except Google Fonts and GSAP (via CDN).

---

## Brand Context

The name comes from astronomy: proper motion is the actual movement of a star across the sky, measured against the distant background — stripped of all apparent motion, all distortion, all noise. It's the *true* movement. That is the company's philosophy. It builds the actual thing. Not the appearance of it. Not a prototype dressed up as a product. The real thing, built properly.

This should feel like a company that has been operating quietly and confidently for a decade. Restrained. Precise. Serious without being cold.

---

## Design Direction

### Mood
Cinematic. Dark. Editorial. Deep space, star trails, atmospheric night sky. Think: a lone figure standing at the edge of something vast. Film still energy. Not corporate SaaS. Not a Webflow template. Something that feels authored.

### Color Palette

```css
--color-bg-deep:        #05050E;
--color-bg-dark:        #08080F;
--color-bg-mid:         #0D0D1A;
--color-bg-surface:     #111122;
--color-text-primary:   #F2F0EA;
--color-text-secondary: rgba(242, 240, 234, 0.65);
--color-text-muted:     rgba(242, 240, 234, 0.35);
--color-accent-gold:    #C9A96E;
--color-accent-blue:    #A8C4D4;
--color-border-subtle:  rgba(255, 255, 255, 0.07);
--color-border-mid:     rgba(255, 255, 255, 0.12);
```

### Typography

```css
--font-display: 'Playfair Display', Georgia, serif;
--font-body:    'Inter', system-ui, sans-serif;
```

Load both via Google Fonts `<link>` in `<head>`:
- Playfair Display: weights 400, 700
- Inter: weights 300, 400, 500

### Visual Texture
- Film grain noise overlay on hero — CSS SVG `feTurbulence` filter, opacity 0.06–0.09
- Subtle star field: JS-generated sparse dots on hero and contact section backgrounds
- Everything slightly worn, slightly analog — not sterile

### Animation Philosophy
- Every element should *arrive*, not appear — fade + upward translate on scroll entry
- Stagger children 100–150ms apart
- Parallax on hero background (moves at 0.4× scroll speed via GSAP)
- Custom cursor: small circle follows mouse, expands on hover over interactive elements
- Numbers count up when entering viewport
- Page load sequence: staggered fade-in of nav, then hero content top to bottom
- All animations respect `prefers-reduced-motion`

### Scroll Behavior
- Smooth scroll globally (`scroll-behavior: smooth`)
- Active nav link updates on scroll via Intersection Observer
- Thin gold progress bar at very top of viewport tracking scroll depth

---

## Technical Requirements

- **Single `index.html`** — all CSS in `<style>`, all JS in `<script>`
- GSAP via CDN:
  - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js`
  - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js`
- Google Fonts via `<link>`
- No jQuery, no other external libraries
- Valid semantic HTML5 with proper landmark elements (`<header>`, `<main>`, `<section>`, `<footer>`)
- Fully responsive — mobile-first, breakpoints at 768px and 1200px
- All images via Unsplash URLs with `?w=` and `?q=` params, `loading="lazy"` on below-fold images
- Custom cursor desktop only (`pointer-events: none`, hidden on touch devices)
- `prefers-reduced-motion`: disable all animations when set

---

## Page Architecture

```
Navigation (sticky, transparent → solid on scroll)
Hero
Marquee Ticker
What We Do
Services (3 cards)
Process (4-step timeline)
Work / Case Studies (3 projects)
About
Testimonials (3)
FAQ (accordion)
Contact / CTA (with form)
Footer
```

---

## Navigation

**Behavior:**
- Fixed top, full width, `z-index: 1000`
- Initially transparent
- Past 80px scroll: `background: rgba(5, 5, 14, 0.92)`, `backdrop-filter: blur(12px)`, bottom border `1px solid var(--color-border-subtle)`
- Transition: 400ms ease

**Layout:**
- Left: logo text `The Proper Motion Company` — Inter, weight 500, 13px, letter-spacing 0.04em, off-white. Below in tiny text: `Est. 2026` — Inter, weight 300, 10px, muted
- Right: links `Work` · `Process` · `About` · `Contact` — Inter, 13px, off-white 70%, hover: accent gold, transition 250ms
- Far right: `Start a project` — pill button, border `1px solid var(--color-border-mid)`, off-white text, hover: fills `rgba(201,169,110,0.15)`, border goes accent gold

**Mobile (< 768px):**
- Hamburger icon right (3 lines, animated to × on open)
- Full-screen dark overlay menu (`#05050E` at 97% opacity)
- Links stacked, large, Playfair Display, slide in from left staggered on open
- Close button top right
- Social note at bottom: `hello@propermotionco.com`

---

## Section 1: Hero

**Layout:** 100vh, full width

**Background:**
```
https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=1800&q=80
```
`background-size: cover`, `background-position: center`

**Overlays:**
1. Gradient: `linear-gradient(160deg, rgba(5,5,14,0.2) 0%, rgba(5,5,14,0.85) 70%, rgba(5,5,14,1) 100%)`
2. Film grain: SVG `feTurbulence` filter pseudo-element, opacity 0.07
3. Sparse star dots (JS-generated, ~150 dots)

**Parallax:** GSAP ScrollTrigger — background moves at 0.4× scroll rate

**Content position:** centered vertically, left-aligned (desktop) / centered (mobile)

**Content:**

Tag line — Inter, 11px, uppercase, letter-spacing 0.15em, accent gold:
```
Software studio · Est. 2026
```

Headline — Playfair Display, 80px desktop / 48px tablet / 38px mobile, off-white, line-height 1.05:
```
We build
the actual thing.
```

Subline — Inter weight 300, 18px desktop / 15px mobile, off-white 70% opacity, max-width 540px, line-height 1.75:
```
Not the approximation. Not the appearance of it.
The Proper Motion Company builds software the way
astronomers measure stars — against the real background,
stripped of all noise.
```

CTA row (margin-top 48px, flex, gap 24px):
- `Start a project →` — accent gold, Inter weight 500, arrow animates right on hover
- `See our work` — off-white muted, same Inter style

Scroll indicator (absolute bottom-center):
- `Scroll to explore` — Inter 11px, muted, letter-spacing wide
- Animated chevron below, slow bounce
- Fades after 200px scroll

**Load animation sequence:**
1. 0ms — background fades in from black
2. 200ms — tag line fades + slides up
3. 400ms — headline line 1
4. 600ms — headline line 2
5. 800ms — subline
6. 1000ms — CTA row
7. 1200ms — nav
8. 1400ms — scroll indicator

---

## Section 2: Marquee Ticker

**Layout:** Full width, height 48px, no padding
**Background:** `#05050E`
**Borders:** 1px top and bottom `var(--color-border-subtle)`

**Content** (repeating, pure CSS animation):
```
Proper motion  ✦  Software that holds  ✦  Built from the ground up  ✦  No shortcuts  ✦  Ship it  ✦  The actual thing  ✦  Design + engineering  ✦  Full stack  ✦  AI integration  ✦  Serious work  ✦
```

- Inter, 12px, uppercase, letter-spacing 0.1em, off-white 45% opacity
- `✦` glyphs in accent gold
- `@keyframes marquee` with `transform: translateX(-50%)`, duplicate content for seamless loop
- Hover: `animation-play-state: paused`

---

## Section 3: What We Do

**Background:** `#08080F`
**Padding:** 140px vertical desktop / 80px mobile

**Layout:** Two-column desktop (50/50) / single column mobile

**Left column:**

Section label — Inter, 11px, uppercase, letter-spacing 0.15em, accent gold:
```
What we do
```

Headline — Playfair Display, 52px desktop / 36px mobile, off-white:
```
Software built to
the real specification.
```

**Right column:**

Body — Inter weight 300, 17px, off-white 70% opacity, line-height 1.8:
```
We design and build software products from scratch.
Websites, web apps, internal tools, AI integrations.
We work with founders and operators who know what
they want and need someone who can execute it.

No bloat. No hand-holding. No overpromising.
Just clean work, shipped on time.
```

Stat row (3 stats, flex, margin-top 64px, separated by thin vertical lines):

| Number | Label |
|---|---|
| `100%` | Custom built |
| `3` | Core disciplines |
| `0` | Templates used |

- Numbers: Playfair Display, 48px, off-white — count up animation on entry
- Labels: Inter, 12px, muted

**Scroll animations:** Label → headline lines → body → stats, each staggered 150ms

---

## Section 4: Services

**Background:** `#0D0D1A`
**Padding:** 140px vertical desktop / 80px mobile

**Header (centered):**

Label: `What we build`

Headline — Playfair Display, 52px:
```
Three disciplines.
One standard.
```

**Cards (3-column desktop / stacked mobile):**

Base card styles:
- Border: `1px solid var(--color-border-subtle)`
- Border-radius: 12px
- Padding: 48px desktop / 32px mobile
- Background: `rgba(255,255,255,0.02)`
- Hover: border → `var(--color-border-mid)`, `transform: translateY(-6px)`, subtle gold box-shadow
- Transition: 350ms ease

**Card 1 — Product Design**
- Number: `01` — Inter, 11px, accent gold, uppercase, letter-spacing
- Icon: minimal SVG grid/layout, 28px, off-white
- Title: `Product Design` — Playfair Display, 28px
- Body: `From concept to interface. We design systems that are clear, functional, and built to last. No decoration for its own sake. Everything earns its place.`
- Tags: `UI/UX` · `Systems` · `Prototyping` — tiny pill chips, 10px, border `var(--color-border-subtle)`

**Card 2 — Engineering**
- Number: `02`
- Icon: minimal SVG code brackets
- Title: `Engineering`
- Body: `Full-stack development. We build it, we ship it, and we make sure it holds up under real conditions. Front end, back end, infrastructure.`
- Tags: `Web Apps` · `APIs` · `Full Stack`

**Card 3 — AI Integration**
- Number: `03`
- Icon: minimal SVG neural/node
- Title: `AI Integration`
- Body: `We connect intelligence to your workflow. Practical, not performative. We build AI features that solve actual problems, not demos.`
- Tags: `LLMs` · `Automation` · `Pipelines`

**Animation:** Cards stagger in, 150ms apart, fade + translateY(32px)

---

## Section 5: Process

**Background:** `#08080F`
**Padding:** 140px vertical desktop / 80px mobile

**Header (left-aligned):**

Label: `How we work`

Headline — Playfair Display, 52px:
```
A process built
for real outcomes.
```

**Steps (vertical timeline):**

Connecting vertical line between steps: `1px solid var(--color-border-subtle)`
GSAP animation: line `scaleY` draws from 0→1 as section scrolls into view, each step fades in as line reaches it.

Large decorative step numbers: Playfair Display, 120px, `var(--color-text-muted)`, positioned absolute/decorative behind content.

**Step 1**
- Week label: `Week 1` — Inter, 11px, accent gold, uppercase
- Title: `Discovery & definition` — Playfair Display, 32px
- Body: `We start by understanding exactly what you need. Not what sounds good, not what's easy to build — what you actually need. One focused call. A written brief. No ambiguity.`

**Step 2**
- Week label: `Week 2–3`
- Title: `Architecture & design`
- Body: `We design the system before we build it. Wireframes, component structure, technical architecture. You review and approve. Changes happen here, not after.`

**Step 3**
- Week label: `Week 4–8`
- Title: `Development & iteration`
- Body: `We build in public-facing sprints. You see real progress every week, not a reveal at the end. Feedback is incorporated continuously.`

**Step 4**
- Week label: `Week 8+`
- Title: `Delivery & handoff`
- Body: `We ship. Then we hand over everything — code, documentation, credentials. You own it completely. We stay available for questions.`

---

## Section 6: Work / Case Studies

**Background:** `#0D0D1A`
**Padding:** 140px vertical desktop / 80px mobile

**Header (left-aligned):**

Label: `Selected work`

Headline — Playfair Display, 52px:
```
Things we've
shipped.
```

Subline — Inter weight 300, 17px, muted:
```
A sample of recent projects. More available on request.
```

**Case Study Cards (3 total, alternating image/text desktop / stacked mobile):**

Card styles:
- Full-width sections
- Image: 16:9, rounded 12px, dark overlay on hover lifts slightly
- Image hover: scale 1.03, overlay lightens, transition 400ms
- Link: `View project →` — accent gold

**Card 1**
- Image: `https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=75`
- Client type: `SaaS Startup`
- Project: `Operations Dashboard`
- Description: `A complete internal operations platform built for a logistics SaaS company. Real-time data visualization, team management, automated reporting. Replaced four separate tools.`
- Tags: `React` · `Node.js` · `PostgreSQL` · `AI`
- Outcome: `Deployed in 6 weeks. 40% reduction in operational overhead.`

**Card 2**
- Image: `https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=75`
- Client type: `Real Estate`
- Project: `Lead Intelligence Platform`
- Description: `AI-powered lead scoring and routing system for a real estate investor network. Integrated with existing CRM, automated follow-up sequences, real-time property matching.`
- Tags: `Python` · `FastAPI` · `Next.js` · `OpenAI`
- Outcome: `3× improvement in lead conversion rate within 90 days.`

**Card 3**
- Image: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=75`
- Client type: `Professional Services`
- Project: `Client Portal & Billing`
- Description: `A custom client-facing portal with project tracking, document management, invoicing, and messaging. Replaced a patchwork of email and spreadsheets.`
- Tags: `Next.js` · `Supabase` · `Stripe`
- Outcome: `Onboarded 12 clients in first month. Zero support tickets.`

---

## Section 7: About

**Background:** `#08080F`
**Padding:** 140px vertical desktop / 80px mobile
**Layout:** Two-column desktop (image left, text right) / stacked mobile

**Image:**
```
https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=75
```
Rounded 12px, no border.

**Header:**

Label: `About`

Headline — Playfair Display, 52px:
```
Built by people
who've shipped things.
```

**Body** — Inter weight 300, 17px, off-white 70%, line-height 1.85:
```
The Proper Motion Company is a software studio that builds
products for founders, operators, and growing companies.

We're not a large agency with layers of project managers.
We're a focused team of designers and engineers who work
directly with clients from brief to delivery.

We operate as a division of Televista Lead Generation,
a company with deep experience building systems that
generate real business outcomes. That operational background
shapes how we approach every build.

We care about the work. We care about shipping.
We care about it actually working when it's done.
```

**Facts row** (below body, thin top border, Inter small):
- `Based in` — `Remote-first, distributed globally`
- `Founded` — `2026`

---

## Section 8: Testimonials

**Background:** `#0D0D1A`
**Padding:** 120px vertical desktop / 80px mobile

**Header (centered):**

Label: `From clients`

Headline — Playfair Display, 48px:
```
What people say.
```

**Cards (3-column desktop / stacked mobile):**

Card styles:
- Background: `rgba(255,255,255,0.025)`
- Border: `1px solid var(--color-border-subtle)`
- Border-radius: 12px
- Padding: 40px
- Opening `"` decorative: Playfair Display, 80px, accent gold, line-height 0

**Testimonial 1**
- Quote: `"They delivered exactly what we scoped, on time, with zero drama. The dashboard has been running without issues for four months. That's rare."`
- Attribution: `Operations Director, Logistics SaaS`
- Stars: 5 gold `★`

**Testimonial 2**
- Quote: `"The AI integration they built changed how our team works completely. It wasn't just technical — they understood the business problem first."`
- Attribution: `Founder, Real estate investment firm`
- Stars: 5 gold `★`

**Testimonial 3**
- Quote: `"Proper Motion built our client portal in six weeks. It's been the single best investment we've made in our operations this year."`
- Attribution: `Managing Partner, Professional services firm`
- Stars: 5 gold `★`

---

## Section 9: FAQ

**Background:** `#08080F`
**Padding:** 120px vertical desktop / 80px mobile
**Content max-width:** 720px, centered

**Header (left-aligned):**

Label: `Questions`

Headline — Playfair Display, 48px:
```
Things people
usually ask.
```

**Accordion behavior:**
- Each item: bottom border `1px solid var(--color-border-subtle)`
- Question: Inter weight 500, 17px, off-white, full-width clickable row
- Icon: `+` / `×` right-aligned, animates on toggle
- Answer: Inter weight 300, 16px, off-white 70% opacity, line-height 1.8
- Open/close: smooth `max-height` transition, 350ms ease
- Only one item open at a time

**Q1:** `How long does a typical project take?`
**A1:** `It depends on scope. A focused web app or dashboard typically takes 6–10 weeks from brief to delivery. We'll give you a realistic timeline before any work begins — and we stick to it.`

**Q2:** `What do you need from us to get started?`
**A2:** `A clear sense of what you're trying to build and why. We don't need a spec document — we'll help you shape that. What we do need is your time for a focused discovery session at the start.`

**Q3:** `Do you work with early-stage startups or only established companies?`
**A3:** `Both. We've built first products for founders with just an idea, and internal tools for established operations teams. What matters is whether you're serious about what you're building.`

**Q4:** `What happens after you deliver?`
**A4:** `You own everything — code, repositories, credentials, documentation. We hand it all over cleanly. We're available for questions and support after delivery, and we offer ongoing retainer arrangements for companies that want continued development.`

**Q5:** `Do you use templates or start from scratch?`
**A5:** `Scratch. Every time. The Proper Motion Company does not do template customization. If you want a ThemeForest site with a logo change, we're not the right fit.`

**Q6:** `How do we get started?`
**A6:** `Fill out the contact form below or email us directly at hello@propermotionco.com. We'll respond within one business day to schedule a call.`

---

## Section 10: Contact / CTA

**Background:** `#05050E` with JS-generated sparse star dots (~150)
**Padding:** 160px vertical desktop / 100px mobile
**Layout:** Two-column desktop (headline left, form right) / stacked mobile

**Left column:**

Label: `Get in touch`

Headline — Playfair Display, 56px:
```
Start moving.
```

Subline — Inter weight 300, 17px, off-white 65% opacity, max-width 360px:
```
Tell us what you're building.
We'll tell you how we'd approach it.
No commitment, no pitch deck.
```

Contact detail (margin-top 48px):
- Email: `hello@propermotionco.com` — accent gold, 14px, mailto link
- Note: `We respond within 1 business day` — muted, 12px

**Right column — Contact Form:**

Form field styles:
- Background: `rgba(255,255,255,0.03)`
- Border: `1px solid var(--color-border-subtle)`
- Border-radius: 8px
- Padding: 14px 18px
- Font: Inter, 15px, off-white
- Focus: border → accent gold, subtle gold glow (`box-shadow: 0 0 0 3px rgba(201,169,110,0.1)`)
- Placeholder: muted off-white
- Transition: 250ms ease

**Fields:**
1. Name — text, placeholder `Your name`
2. Email — email, placeholder `your@email.com`
3. Company — text, placeholder `Company (optional)`
4. Project type — select: `Web Application` / `Product Design` / `AI Integration` / `Internal Tool` / `Not sure yet`
5. Message — textarea 5 rows, placeholder `Tell us about the project. What are you building? What problem does it solve?`
6. Budget — select: `Under $10k` / `$10k–$25k` / `$25k–$50k` / `$50k+` / `Let's discuss`

**Submit button:**
- Full width, background `var(--color-accent-gold)`, text `Send message`, dark text `#05050E`
- Border-radius: 8px, padding: 16px
- Hover: brightens, `transform: scale(1.01)`
- Submit state: brief loading, then success message replaces form

**Success message:**
```
✦
Message received.
We'll be in touch within one business day.
```
Fades in centered, `✦` in accent gold above text.

---

## Section 11: Footer

**Background:** `#03030A`
**Top border:** `1px solid var(--color-border-subtle)`
**Padding:** 80px vertical desktop / 48px mobile
**Layout:** 4-column desktop / 2-column tablet / stacked mobile

**Column 1 — Brand:**
- `The Proper Motion Company` — Inter weight 500, 13px
- `We build the actual thing.` — Inter weight 300, 12px, muted
- `A division of Televista Lead Generation` — Inter, 11px, very muted (margin-top 24px)

**Column 2 — Navigation:**
- Label: `Navigation` — Inter, 10px, uppercase, letter-spacing, muted
- Links: `Work` · `Process` · `About` · `Contact`

**Column 3 — Services:**
- Label: `Services`
- Links: `Product Design` · `Engineering` · `AI Integration`

**Column 4 — Contact:**
- Label: `Contact`
- `hello@propermotionco.com` — accent gold, 13px
- `Responds within 1 business day` — muted, 12px

**Bottom bar** (full width, top border, padding-top 32px, margin-top 48px):
- Left: `© 2026 The Proper Motion Company`
- Center: `✦` in accent gold
- Right: `Built by The Proper Motion Company`
- All Inter, 12px, muted

---

## Custom Cursor (Desktop Only)

- `cursor: none` on body, hidden on touch devices (`@media (hover: none)`)
- Outer ring: 32px circle, `border: 1px solid rgba(201,169,110,0.5)`, follows cursor with lerp lag (80ms)
- Inner dot: 4px circle, solid accent gold, follows cursor exactly
- Both `position: fixed`, `pointer-events: none`, `z-index: 9999`
- Hover over `a`, `button`, `.card`: outer ring expands to 48px, border brightens, transition 200ms
- Hover over images: outer ring fills `rgba(201,169,110,0.08)`

---

## Scroll Progress Bar

- `position: fixed`, top 0, left 0, `z-index: 9999`
- Height: 2px
- Background: `var(--color-accent-gold)`
- Width: updated via JS scroll event listener — `(scrollY / (documentHeight - windowHeight)) * 100`%
- No border-radius

---

## Star Field Effect

Generated via JS on page load for hero and contact sections:
- Create 150–200 `div` elements, `position: absolute`, `width: 1px` or `2px`, `border-radius: 50%`
- Random `top` and `left` percentages
- Background: white at 40–90% opacity (randomized)
- Random `animation-delay` and `animation-duration` (2–6s) for twinkle
- `@keyframes twinkle`: opacity 0.4 → 1 → 0.4, infinite

---

## Animation Specifications

### Entrance (all scroll-triggered via GSAP ScrollTrigger or Intersection Observer)

Start state:
```css
opacity: 0;
transform: translateY(28px);
```

End state:
```css
opacity: 1;
transform: translateY(0);
transition: opacity 0.75s ease, transform 0.75s ease;
```

### Stagger delays

| Element | Delay |
|---|---|
| Section label | 0ms |
| Headline line 1 | 100ms |
| Headline line 2 | 200ms |
| Body text | 300ms |
| Cards (per card) | 150ms each |
| Stats (per stat) | 200ms each |
| FAQ items | 80ms each |

### GSAP-specific
- Hero parallax: `gsap.to(heroBg, { backgroundPosition: "50% 60%", scrollTrigger: { start: "top top", end: "bottom top", scrub: true } })`
- Timeline line: `scaleY` 0 → 1, `transformOrigin: "top center"`, scrub on scroll
- Number count-up: custom JS, triggered once on IntersectionObserver entry

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
Also disable custom cursor and GSAP ScrollTrigger animations in JS when `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

---

## Mobile Considerations

- Hamburger nav < 768px, full-screen overlay
- Hero headline: 38px, subline 15px
- All 2-column grids → single column
- Service cards stack vertically
- Process steps single column, decorative numbers inline not absolute
- Case studies: image on top, text below
- Testimonials: horizontal scroll carousel or stacked
- Footer: 2-column then single column
- Font sizes ~20% smaller than desktop across all sections
- No custom cursor on touch devices
- Tap targets minimum 44×44px

---

## Performance Notes

- Unsplash params: `?w=1800&q=80` hero, `?w=1200&q=75` case studies, `?w=800&q=75` about
- `loading="lazy"` on all images except hero
- `decoding="async"` on all images
- Animate only `transform` and `opacity` — never `height`, `width`, `top`, `left`
- GSAP `will-change: transform` on parallax elements only, removed after animation
- Marquee: pure CSS, no JS

---

## Full Copy Reference

| Section | Element | Copy |
|---|---|---|
| Nav | Logo | The Proper Motion Company |
| Nav | Subtext | Est. 2026 |
| Nav | Links | Work · Process · About · Contact |
| Nav | CTA | Start a project |
| Hero | Tag | Software studio · Est. 2026 |
| Hero | H1 | We build the actual thing. |
| Hero | Sub | Not the approximation. Not the appearance of it. The Proper Motion Company builds software the way astronomers measure stars — against the real background, stripped of all noise. |
| Hero | CTA 1 | Start a project → |
| Hero | CTA 2 | See our work |
| Hero | Scroll | Scroll to explore |
| Ticker | — | Proper motion ✦ Software that holds ✦ Built from the ground up ✦ No shortcuts ✦ Ship it ✦ The actual thing ✦ Design + engineering ✦ Full stack ✦ AI integration ✦ Serious work ✦ |
| What We Do | Label | What we do |
| What We Do | H2 | Software built to the real specification. |
| Services | Label | What we build |
| Services | H2 | Three disciplines. One standard. |
| Process | Label | How we work |
| Process | H2 | A process built for real outcomes. |
| Work | Label | Selected work |
| Work | H2 | Things we've shipped. |
| About | Label | About |
| About | H2 | Built by people who've shipped things. |
| Testimonials | Label | From clients |
| Testimonials | H2 | What people say. |
| FAQ | Label | Questions |
| FAQ | H2 | Things people usually ask. |
| Contact | Label | Get in touch |
| Contact | H2 | Start moving. |
| Contact | Sub | Tell us what you're building. We'll tell you how we'd approach it. No commitment, no pitch deck. |
| Contact | Email | hello@propermotionco.com |
| Contact | Submit | Send message |
| Contact | Success | ✦ Message received. We'll be in touch within one business day. |
| Footer | Tagline | We build the actual thing. |
| Footer | Division | A division of Televista Lead Generation |
| Footer | Copyright | © 2026 The Proper Motion Company |
| Footer | Built by | Built by The Proper Motion Company |
