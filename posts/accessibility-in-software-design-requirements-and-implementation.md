# Accessibility in Software Design: Requirements and Implementation

Accessibility is not a feature you bolt on before launch. It is a design constraint that, when integrated from the start, produces better software for everyone. Products built with accessibility in mind are more usable, more resilient, and reach a larger market. Products that retrofit accessibility after the fact spend 3 to 10 times more and still end up with a compromised experience.

This guide covers the legal landscape, the technical implementation details, and the organizational practices that make accessibility a sustainable part of your development process.

## The Legal and Business Case You Cannot Ignore

The legal landscape for digital accessibility has shifted dramatically. In the United States, the Department of Justice published its final rule under Title II of the ADA in April 2024, establishing WCAG 2.1 Level AA as the technical standard for state and local government websites. While Title III (which covers private businesses) does not yet have a formal rule, federal courts have consistently held that websites are "places of public accommodation" under the ADA. In 2023, over 4,600 digital accessibility lawsuits were filed in the U.S., up from 2,300 in 2018.

The European Accessibility Act takes effect in June 2025, requiring that digital products and services sold in the EU meet accessibility standards. This applies to any company with EU customers, regardless of where the company is headquartered.

Beyond legal compliance, the business case is straightforward. Over 1.3 billion people worldwide live with some form of disability. In the U.S. alone, the disability community controls over $490 billion in disposable income. An inaccessible product excludes this market entirely.

There is also the curb-cut effect: features designed for accessibility benefit everyone. Closed captions help users in noisy environments. Keyboard navigation helps power users work faster. High-contrast interfaces are more readable in bright sunlight. Accessible design is simply good design.

## WCAG 2.1 Level AA: What It Actually Requires

The Web Content Accessibility Guidelines are organized around four principles: Perceivable, Operable, Understandable, and Robust (POUR). Level AA compliance requires meeting 50 specific success criteria. Here are the ones that most commonly trip up development teams.

**Color contrast.** Text must have a contrast ratio of at least 4.5:1 against its background (3:1 for large text, defined as 18px bold or 24px regular). Use a tool like the WebAIM Contrast Checker to verify. Common failure: light gray text (#999999) on a white background has a ratio of 2.85:1. Bump it to #767676 for a compliant 4.54:1.

**Keyboard navigation.** Every interactive element must be reachable and operable via keyboard alone. Users must be able to Tab through focusable elements in a logical order, activate buttons and links with Enter or Space, and navigate menus with arrow keys. The focus indicator must be visible (at least 2px solid outline with sufficient contrast). Custom components built with `<div>` elements need `tabindex`, `role`, and keyboard event handlers to function equivalently to native HTML elements.

**Form labels and error handling.** Every form input must have a programmatically associated `<label>` element (connected via the `for` attribute matching the input's `id`). Error messages must identify the field in error, describe the error clearly, and be announced to screen readers via `aria-live="assertive"` or `role="alert"`.

**Alternative text for images.** Informative images need descriptive alt text. Decorative images need `alt=""` (empty alt attribute, not missing). Complex images like charts and infographics need both brief alt text and a longer text alternative (via `aria-describedby` or a linked description).

**Heading hierarchy.** Use heading levels (h1 through h6) to create a logical document outline. Do not skip levels (going from h2 to h4). Screen reader users navigate by headings, so a well-structured heading hierarchy is equivalent to a table of contents.

## Implementing Accessible Components in Practice

The most reliable path to accessible components is using semantic HTML elements whenever possible. A `<button>` element is keyboard-focusable, activatable with Enter and Space, and announced correctly by screen readers, all without a single line of JavaScript. A `<div onClick={handleClick}>` provides none of these behaviors by default.

**Modals and dialogs.** Use the native `<dialog>` element or implement the WAI-ARIA dialog pattern. Requirements: focus must move to the dialog when it opens, Tab must be trapped within the dialog (cycling from the last focusable element back to the first), Escape must close the dialog, and focus must return to the triggering element when the dialog closes. On the dialog element itself, set `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the dialog's heading.

**Dropdown menus.** Implement the WAI-ARIA menu button pattern. The trigger button needs `aria-haspopup="true"` and `aria-expanded="false"` (toggled to "true" when open). Menu items need `role="menuitem"`. Arrow keys navigate between items, Enter or Space activates the focused item, and Escape closes the menu.

**Data tables.** Use proper `<table>`, `<thead>`, `<th>`, and `<td>` elements. Add `scope="col"` to column headers and `scope="row"` to row headers. For complex tables with merged cells, use `headers` attributes. For sortable columns, add `aria-sort="ascending"`, `"descending"`, or `"none"` to the `<th>` element. Avoid using `<div>`-based grid layouts for tabular data.

**Single-page application routing.** When the route changes, announce the new page to screen readers. Set focus to the main content heading or use an `aria-live` region to announce the page title. Without this, screen reader users have no indication that navigation occurred.

## Testing Accessibility: Automated and Manual Approaches

Automated testing catches approximately 30 to 40 percent of accessibility issues. The remainder requires manual testing and assistive technology verification.

**Automated testing tools.** Integrate axe-core into your CI/CD pipeline using @axe-core/playwright or jest-axe. Run automated checks on every pull request. axe-core identifies missing alt text, insufficient color contrast, missing form labels, and incorrect ARIA usage. Lighthouse accessibility audits provide a complementary check. Set a minimum score threshold (we recommend 90) and fail the build if it drops below.

**Keyboard testing (manual, 15 minutes per page).** Tab through every interactive element on the page. Verify that focus is visible, that the tab order is logical, that all functionality is operable without a mouse, and that no keyboard traps exist (places where Tab cannot escape). This single test catches more usability issues than any automated tool.

**Screen reader testing.** Test with at least two screen readers: VoiceOver on macOS (free, built into the OS) and NVDA on Windows (free, open-source). Navigate the page using only the screen reader and keyboard. Listen for: correct heading announcements, meaningful link text (not "click here"), form label associations, dynamic content updates, and image descriptions.

**Assistive technology matrix.** For thorough coverage, test these combinations:
- VoiceOver + Safari on macOS
- NVDA + Chrome on Windows
- TalkBack + Chrome on Android
- VoiceOver + Safari on iOS

You do not need to test every combination on every sprint. Rotate through them, covering each combination at least once per quarter.

## Building Accessibility Into Your Development Workflow

Accessibility is sustainable only when it is integrated into existing workflows rather than treated as a separate workstream.

**Design phase.** Designers annotate mockups with accessibility information: heading levels, alt text for images, focus order for interactive elements, and color contrast ratios. Use a Figma plugin like Stark or A11y Annotation Kit. This takes 15 to 20 minutes per screen and saves hours of developer guesswork.

**Development phase.** Use an ESLint plugin like eslint-plugin-jsx-a11y to catch common issues during development. Developers run keyboard tests on their own components before requesting code review. The pull request template includes an accessibility checklist: semantic HTML used, keyboard navigation works, ARIA attributes correct, focus management handled.

**Code review phase.** At least one reviewer checks accessibility concerns. Look for: custom components that should be native elements, missing or incorrect ARIA attributes, click handlers without keyboard equivalents, and dynamic content without screen reader announcements.

**QA phase.** Dedicated accessibility testing occurs before each release. Run automated scans, perform keyboard testing on all new or modified pages, and conduct screen reader testing on critical user flows (sign-up, core feature, checkout).

**Ongoing monitoring.** Schedule quarterly accessibility audits covering the full application. Track the count of known accessibility issues over time. Set a target: no critical (Level A) violations, fewer than five moderate (Level AA) violations at any time.

## Common Mistakes and How to Avoid Them

**Overusing ARIA.** The first rule of ARIA is: do not use ARIA if you can use native HTML. A `<button>` is always better than `<div role="button">`. ARIA should extend HTML semantics, not replace them.

**Hiding content from screen readers with display:none when it should be visually hidden.** Use a "visually hidden" CSS class (position: absolute, clip: rect(0,0,0,0), width: 1px, height: 1px, overflow: hidden) for content that screen readers need but sighted users do not.

**Relying solely on color to convey information.** A form field with a red border to indicate an error is invisible to color-blind users. Always pair color with text, icons, or patterns.

**Placeholder text as labels.** Placeholder text disappears when the user starts typing, removing the only indication of what the field expects. Always use a visible `<label>` element.

Accessibility is an ongoing practice, not a one-time project. The teams that build it into their process from day one spend less total effort and produce fundamentally better products.

---

If your product needs to meet accessibility standards or you want to build accessibility into your development process from the ground up, [get in touch](/contact.html). The Proper Motion Company helps teams build software that works for everyone.
