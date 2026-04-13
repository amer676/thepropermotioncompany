# Web Typography Guide for Business Applications

Typography in a business application is not decoration. It is infrastructure. When a warehouse manager scans a picking list at arm's length, when an analyst reads a dense financial table for two hours straight, when a field technician glances at a status dashboard in direct sunlight — the typeface, size, weight, line height, and contrast ratio are all doing functional work. Get them right and the interface feels effortless. Get them wrong and the same interface becomes a source of eye strain, misread data, and quiet frustration that users rarely articulate but always feel.

This guide covers the typographic decisions that matter most for business applications — not marketing sites, not editorial publications, but dense, data-heavy tools that people use for hours every day.

## Choosing a Typeface for Utility, Not Personality

Brand expression through type is a legitimate concern for marketing sites. For internal tools and SaaS dashboards, legibility at small sizes, clear character differentiation, and tabular numeral support should drive the decision.

**Sans-serif as the default.** Inter, Roboto, Source Sans Pro, and IBM Plex Sans are all strong choices. They share the qualities that matter: large x-heights (the height of lowercase letters relative to uppercase), open counters (the enclosed or partially enclosed spaces within letters like "e" and "a"), and careful disambiguation of similar characters (capital I, lowercase l, and the number 1 are visually distinct).

**Monospace for data.** Anywhere numbers need to align vertically — tables, financial figures, timestamps, code snippets — use a monospace or tabular-numeral typeface. JetBrains Mono, IBM Plex Mono, and Fira Code are excellent. If you prefer to stay within a single type family, check whether your chosen sans-serif offers tabular numerals as an OpenType feature (`font-variant-numeric: tabular-nums` in CSS). Inter and Roboto both do.

**Weight range matters.** A typeface with at least Regular (400), Medium (500), SemiBold (600), and Bold (700) weights gives you the tools to create hierarchy without changing size. Many business applications lean too heavily on size variation when weight variation is more efficient and disrupts layout less.

**Performance consideration.** Every font weight and style you load adds to page weight. A practical approach: load two weights (Regular and SemiBold) initially, lazy-load additional weights as needed, and use `font-display: swap` to prevent invisible text during loading. Variable fonts (a single file containing all weights along a continuous axis) are ideal — Inter's variable font file is roughly 300KB and replaces what would otherwise be six or seven separate files.


> Related: [Data Dashboard Design: Principles for Complex Applications](/blog/data-dashboard-design-principles-for-complex-applications/)


## Establishing a Type Scale That Works for Dense Interfaces

Marketing sites can afford dramatic size variation — 72px headings with 18px body text. Business applications cannot. The information density is too high, and dramatic size jumps waste vertical space.

A modular scale based on a ratio of 1.2 (the "minor third") produces a tighter, more practical progression:

- 12px — Labels, captions, metadata
- 14px — Secondary body text, table cells
- 16px — Primary body text, form inputs
- 19px — Section headings (H3)
- 23px — Page section headings (H2)
- 28px — Page titles (H1)

This scale preserves visual hierarchy while keeping the overall size range compact. In a data table, 14px cell text with 12px column headers creates a clear hierarchy without making the table feel cramped or the headers feel like footnotes.

Implement the scale as CSS custom properties or design tokens:

```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.1875rem;  /* 19px */
  --text-xl: 1.4375rem;  /* 23px */
  --text-2xl: 1.75rem;   /* 28px */
}
```

Using rem units ensures the entire scale respects the user's browser font-size preference — an accessibility requirement that too many applications ignore by setting a fixed pixel base.

## Line Height, Line Length, and Spacing

These three properties interact to determine readability more than any individual typeface choice.

**Line height (leading):** For body text, a line-height of 1.5 is the accessibility baseline (WCAG 1.4.12). For dense interfaces — tables, sidebars, navigation items — 1.3 to 1.4 is acceptable when the text blocks are short (one to two lines). For long-form content (help documentation, multi-paragraph descriptions), 1.6 provides comfortable reading.

A common mistake is applying a single line-height to all text. Headings need tighter leading than body text (1.1 to 1.2 for headings), and captions can be slightly tighter still. CSS lets you set line-height per typographic role, and you should.

**Line length (measure):** The ideal line length for readable prose is 45 to 75 characters per line, with 66 characters often cited as the target. In business applications, this manifests as `max-width` constraints on text-heavy content areas. A form with labels and inputs should not stretch to fill a 2560px monitor — the labels become disconnected from their inputs, and paragraph-length help text becomes unreadable.

For data tables, the constraint is different. Columns should be wide enough that typical content does not truncate, but narrow enough that the eye can track across a row without losing its place. Alternating row backgrounds or subtle horizontal rules help with this.

**Paragraph spacing:** Use margin rather than empty lines between paragraphs. A spacing of 0.75em to 1em between paragraphs maintains visual grouping without the double-spacing feel. For lists in a sidebar or navigation, tighter spacing (0.25em to 0.5em between items) preserves grouping.


> See also: [Why Great Software Feels Invisible to Users](/blog/why-great-software-feels-invisible-to-users/)


## Color, Contrast, and Dark Mode

Text color in business applications is often treated as an afterthought — black on white, maybe a gray for secondary text. But the contrast choices you make directly impact readability, hierarchy, and user comfort during extended use.

**Do not use pure black on pure white.** `#000000` on `#FFFFFF` creates maximum contrast (21:1 ratio), but that intensity causes halation — a visual effect where bright white backgrounds bleed into dark text, making characters appear thinner and harder to read. A dark gray like `#1a1a2e` or `#212529` on a warm white like `#fafafa` or `#f8f9fa` produces a softer, more comfortable reading experience while maintaining a contrast ratio well above the WCAG AA minimum of 4.5:1.

**Three-tier text color system:**
- Primary text: `#212529` — for headings, body text, and data values. Contrast ratio ~16:1 on `#ffffff`.
- Secondary text: `#6c757d` — for labels, captions, timestamps, and metadata. Contrast ratio ~5.5:1 on `#ffffff` (meets AA for text 14px and above).
- Disabled/placeholder text: `#adb5bd` — for disabled inputs and placeholder text. Contrast ratio ~3:1 (meets AA for large text, which includes 14px bold).

**Dark mode is not optional for tools used in varied lighting conditions.** Developers, operations staff, and anyone working late hours will expect it. The implementation pitfalls are specific:
- Do not simply invert colors. A blue link on white becomes a blue link on dark gray, but the specific blue needs to shift lighter to maintain contrast.
- Reduce surface color variety. In light mode, you might use three background shades to create depth (white, light gray, medium gray). In dark mode, use two (dark gray and slightly lighter dark gray). Too many surface colors in dark mode creates visual noise.
- Test contrast ratios independently for dark mode. A color that passes WCAG AA on white may fail on dark gray.

## Typography in Data Tables

Tables are the backbone of most business applications, and their typographic treatment deserves special attention.

**Column headers:** SemiBold weight, secondary text color, 12px uppercase with letter-spacing of 0.05em. This treatment creates a clear distinction from cell data without adding visual heaviness. Uppercase combined with increased letter-spacing improves readability of short labels.

**Cell content:** Regular weight, primary text color, 14px. Right-align numeric columns and use tabular numerals so digits align vertically. Left-align text columns. Never center-align data columns — centered text in a table destroys the alignment cues that make scanning efficient.

**Row density:** Dense tables (32px row height) work for expert users who scan large datasets. Comfortable tables (48px row height) work for occasional users and when cells contain multi-line content. Provide a toggle between the two rather than choosing one.

**Truncation:** When cell content exceeds column width, truncate with an ellipsis and provide the full content in a tooltip on hover. Never wrap table cell content to multiple lines unless the column is explicitly designed for long text (e.g., a "Notes" or "Description" column).

**Numeric formatting:** Use locale-aware number formatting (Intl.NumberFormat in JavaScript). Thousands separators, decimal precision, and currency symbols should all respect the user's locale. A financial table that displays `1234567.89` instead of `1,234,567.89` is a readability failure.

## Responsive Typography and Accessibility

Business applications increasingly run on tablets and even phones — field service apps, point-of-sale systems, executive dashboards viewed on an iPad. Typography must adapt.

**Fluid type scaling** adjusts font size smoothly between breakpoints using CSS `clamp()`:

```css
h1 { font-size: clamp(1.5rem, 1.2rem + 1vw, 1.75rem); }
```

This avoids the jarring size jump that occurs with media-query-based approaches and ensures readable text across the full device spectrum.

**Touch target sizing** interacts with typography: any tappable text (links, table row actions) needs at least 44px of effective target height, regardless of the text's visual size. Padding handles this, but the typographic scale should be designed with touch targets in mind from the start.

**Accessibility non-negotiables:**
- Never override the user's browser font-size setting (no `html { font-size: 14px; }`).
- Ensure all text can be resized to 200% without loss of content or functionality.
- Maintain at least 4.5:1 contrast ratio for normal text, 3:1 for large text (18px or 14px bold).
- Use semantic heading levels (H1 through H6 in order) for screen reader navigation, regardless of visual styling.

---

Typography decisions compound. A slightly wrong line-height, a marginal contrast choice, and a sub-optimal typeface individually feel minor, but together they create an interface that tires users out. If you are building a business application and want to get these fundamentals right from the start, [reach out to us](/contact.html) — this is exactly the kind of detail we obsess over.
