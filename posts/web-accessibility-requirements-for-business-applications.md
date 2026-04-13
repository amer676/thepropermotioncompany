# Web Accessibility Requirements for Business Applications

Accessibility in business software is not a nice-to-have feature you add after launch. It is a legal requirement, a market expansion strategy, and an engineering discipline that, when done correctly, improves the product for every user, not just those with disabilities. Yet the majority of business applications we audit fail basic accessibility standards. Buttons without labels, forms without error descriptions, color-only status indicators, keyboard traps in modal dialogs. These are not obscure edge cases. They are fundamental usability failures that affect roughly 15% of the global population, over one billion people who experience some form of disability.

The good news is that accessibility is not as difficult or expensive as most teams assume. The core principles are straightforward, the tooling is mature, and the vast majority of issues can be prevented by following established patterns rather than inventing new ones.

## The Legal Landscape You Cannot Afford to Ignore

Accessibility lawsuits in the United States have increased dramatically. In 2023, over 4,600 ADA-related digital accessibility lawsuits were filed in federal courts, up from approximately 2,300 in 2018. These are not limited to consumer-facing websites. Business applications, particularly those used by employees and partners, are subject to the same requirements.

**Section 508** requires that all electronic and information technology developed, procured, maintained, or used by the federal government be accessible. If you sell software to any US government agency, Section 508 compliance is a procurement requirement, not a preference.

**ADA Title III** has been interpreted by courts to apply to websites and digital services offered to the public. While the law does not specify technical standards, courts consistently reference WCAG 2.1 AA as the benchmark.

**European Accessibility Act (EAA)** takes effect in June 2025 and applies to a wide range of digital products and services sold in the EU, including e-commerce, banking services, and certain business software. Non-compliance carries financial penalties.

**AODA in Canada, the Equality Act in the UK, and similar legislation in Australia, Japan, and South Korea** create a global patchwork of accessibility requirements that any business operating internationally must navigate.

The cost of a lawsuit ranges from $10,000-150,000 in legal fees and settlements for a single case. The cost of building accessibility correctly from the start is typically 5-10% of the total development budget. The math is clear.

## WCAG 2.1 AA: The Practical Standard for Business Applications

The Web Content Accessibility Guidelines (WCAG) define three conformance levels: A (minimum), AA (standard), and AAA (enhanced). For business applications, **WCAG 2.1 Level AA** is the target. It is what courts reference, what procurement requirements specify, and what balances thoroughness with feasibility.

WCAG is organized around four principles, often remembered by the acronym POUR:

**Perceivable.** Information must be presentable in ways users can perceive. This means: all images have descriptive alt text, videos have captions, content does not rely on color alone to convey meaning, and text has sufficient contrast against its background (minimum 4.5:1 ratio for normal text, 3:1 for large text).

**Operable.** Users must be able to operate the interface. This means: all functionality is available via keyboard, users have enough time to read and interact with content, content does not cause seizures (no flashing more than three times per second), and navigation is consistent and predictable.

**Understandable.** Information and operation of the interface must be understandable. This means: text is readable (appropriate language level, abbreviations are defined), the interface behaves predictably (no unexpected context changes), and users are helped to avoid and correct mistakes (clear error messages, input validation guidance).

**Robust.** Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies. This means: valid HTML markup, proper use of ARIA attributes, and compatibility with screen readers, voice control software, and other assistive tools.

For a business application, the most impactful WCAG criteria to address are: keyboard accessibility (2.1.1), focus visible (2.4.7), color contrast (1.4.3), name/role/value for interactive elements (4.1.2), and error identification (3.3.1). Getting these five right eliminates approximately 70% of accessibility issues.

## Keyboard Navigation: The Foundation of Accessible Interaction

If your application cannot be operated entirely by keyboard, it is not accessible. Full stop. Screen reader users, motor-impaired users, and power users who prefer keyboard shortcuts all depend on keyboard operability.

**Tab order must be logical.** When a user presses Tab, focus should move through the page in a sequence that matches the visual layout: header, then main navigation, then content area, then sidebar, then footer. If the tab order jumps unpredictably due to CSS positioning tricks or incorrect `tabindex` values, the experience is disorienting.

Use the natural DOM order for tab sequence whenever possible. Avoid setting `tabindex` to positive values (1, 2, 3...) as this overrides natural order and creates maintenance nightmares. Use `tabindex="0"` to make non-interactive elements focusable when necessary, and `tabindex="-1"` to make elements programmatically focusable but not part of the tab sequence.

**Focus indicators must be visible.** The default browser focus outline (a thin dotted border or blue glow) is often removed by CSS resets for aesthetic reasons. Removing it without providing an alternative makes the application unusable for keyboard users because they cannot see where focus currently is.

Design a custom focus indicator that is visible against all background colors in your application. A 2-3px solid outline in a contrasting color, offset by 2px from the element, works in most cases. Test it on light backgrounds, dark backgrounds, and image backgrounds.

**Keyboard traps must be eliminated.** A keyboard trap occurs when a user can tab into a component but cannot tab out. Modal dialogs are the most common offender. When a modal opens, focus should move to the modal. The user should be able to tab through all interactive elements in the modal. Pressing Escape should close the modal and return focus to the element that triggered it. Focus should not escape to elements behind the modal while it is open.

**Custom components need keyboard patterns.** If you build custom dropdown menus, date pickers, tabs, or accordions, follow the WAI-ARIA Authoring Practices patterns. A custom dropdown should open with Enter or Space, navigate options with arrow keys, select with Enter, and close with Escape. Do not invent new keyboard patterns. Users and assistive technologies expect standard patterns.

## ARIA Attributes: When HTML Is Not Enough

ARIA (Accessible Rich Internet Applications) attributes add semantic information to HTML elements so that assistive technologies can interpret custom components correctly. The first rule of ARIA is: if you can use a native HTML element that already has the right semantics, do that instead.

A `<button>` element is inherently focusable, activatable by keyboard, and announced as a button by screen readers. A `<div onclick="doSomething()">` has none of these properties. Making it accessible requires adding `role="button"`, `tabindex="0"`, keyboard event handlers for Enter and Space, and possibly `aria-label` if the text content is not descriptive. Using a `<button>` in the first place avoids all of this.

**When to use ARIA:**

- `aria-label` and `aria-labelledby`: When a visible label is not present or when the visible text does not adequately describe the element's purpose. An icon-only button needs `aria-label="Close dialog"`.
- `aria-describedby`: To associate additional descriptive text with an element. A form input with validation requirements can reference a description: `aria-describedby="password-requirements"`.
- `aria-expanded`: For toggleable elements (accordions, menus, collapsible sections). Set to "true" when expanded, "false" when collapsed.
- `aria-live`: For dynamic content that updates without page reload. A toast notification or an inline validation message should be in an `aria-live="polite"` region so screen readers announce the change.
- `role`: For custom components that cannot use native HTML equivalents. A custom tab interface needs `role="tablist"`, `role="tab"`, and `role="tabpanel"` to be interpretable by assistive technologies.

**Common ARIA mistakes:** Using `aria-label` on elements that already have visible text (creating conflicting labels), setting `role="button"` without adding keyboard handlers, using `aria-hidden="true"` on elements that are still visually visible and interactive, and adding ARIA to native HTML elements that already have the correct semantics (a `<nav>` element does not need `role="navigation"`).

## Testing Accessibility: Automated and Manual Approaches

No single testing approach catches all accessibility issues. You need both automated tools and manual testing.

**Automated testing catches approximately 30-40% of accessibility issues.** Tools like axe-core (integrated into browser DevTools or run as a CI check), Lighthouse accessibility audit, and WAVE can detect: missing alt text, insufficient color contrast, missing form labels, duplicate IDs, and incorrect ARIA attribute usage. Run automated scans on every page and component, ideally as part of your CI pipeline so regressions are caught before merge.

**Manual keyboard testing catches navigation and interaction issues.** At minimum, test every page by: unplugging your mouse and navigating the entire workflow using only Tab, Shift+Tab, Enter, Space, Escape, and arrow keys. Can you reach every interactive element? Can you see where focus is? Can you activate every button and link? Can you escape from every modal and dropdown?

**Screen reader testing catches semantic and announcement issues.** Test with at least one screen reader: VoiceOver on macOS (built-in, free), NVDA on Windows (free, open source), or JAWS on Windows (commercial, most widely used by screen reader users). Listen to how the screen reader announces page content, form labels, button purposes, and dynamic updates. If the announcement does not make sense with your eyes closed, sighted users are getting information that screen reader users are missing.

**User testing with people who have disabilities** is the gold standard but often the most neglected. Recruit 3-5 testers who use assistive technologies in their daily life and observe them completing core workflows in your application. Their feedback reveals issues that no automated tool or developer simulation can catch.

## Building an Accessibility Culture, Not Just Compliant Code

Accessibility is not a checklist you complete once. It is an ongoing practice that requires awareness across the entire product team.

**Design reviews should include accessibility.** Before a design moves to development, verify: color contrast of all text, availability of non-color indicators for status, touch target sizes (minimum 44x44 CSS pixels), and readability of text sizes. Catching issues in design is 10x cheaper than fixing them in code.

**Component libraries should be accessible by default.** If your team uses a shared component library, invest in making every component accessible once. Then every developer who uses that button, input, modal, or dropdown inherits accessibility for free. Libraries like Radix UI, Headless UI, and React Aria provide unstyled, accessible component primitives that you can style to match your brand.

**Accessibility acceptance criteria belong in every user story.** Not as a separate "accessibility story" but as criteria within feature stories. "As a user, I can filter the transaction table" should include: "Filter controls are keyboard operable, filter state is announced to screen readers, and results update is communicated via an aria-live region."

---

At The Proper Motion Company, we build business applications that work for every user from day one. If you need an accessibility audit of an existing application or want to build a new product with accessibility as a first-class requirement, [contact us](/contact.html).
