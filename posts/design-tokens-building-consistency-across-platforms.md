# Design Tokens: Building Consistency Across Platforms

Every product team eventually hits the same wall. The mobile app uses one shade of blue, the web app uses another, and the marketing site uses a third. Button corner radii drift. Spacing scales diverge. Typography stacks multiply. What started as a unified brand slowly fragments into a patchwork of almost-right implementations.

Design tokens solve this problem by extracting visual design decisions into platform-agnostic data. Instead of defining `#1A73E8` in a CSS file, a Figma library, and a Swift color asset independently, you define a single token called `color.primary` in a central source of truth, then generate platform-specific outputs automatically. The result is pixel-perfect consistency across web, iOS, Android, and any other surface your product touches.

## What Design Tokens Actually Are

A design token is a named design decision stored as data. That decision can be a color value, a font size, a spacing unit, a border radius, a shadow definition, an animation duration, or any other atomic visual property. Tokens are not components; they are the raw values that components consume.

Tokens are typically organized in a hierarchy. At the base level, you have global tokens (also called primitive or reference tokens) that define the raw palette: `blue.500: #1A73E8`, `gray.100: #F5F5F5`, `spacing.4: 16px`. Above that, you have semantic tokens (also called alias tokens) that assign meaning: `color.primary: {blue.500}`, `color.surface: {gray.100}`, `spacing.component-padding: {spacing.4}`. Semantic tokens reference global tokens, creating an indirection layer that makes theming and rebranding straightforward.

The most mature systems add a third tier: component tokens. These map semantic tokens to specific component properties: `button.background: {color.primary}`, `button.padding-horizontal: {spacing.component-padding}`. Component tokens are optional but valuable when you have dozens of components that need fine-grained control.

The W3C Design Tokens Community Group has been developing a specification (formerly called the Design Tokens Format Module) that standardizes how tokens are defined in JSON. Adopting this format, or something close to it, future-proofs your token files against tooling changes.


> Related: [Why Big Software Redesigns Almost Always Fail](/blog/why-big-software-redesigns-almost-always-fail/)


## Structuring Your Token Taxonomy

The biggest mistake teams make is jumping straight into tooling before defining their taxonomy. A poorly structured token system is worse than no tokens at all, because it creates a false sense of consistency while making changes harder.

Start by auditing your existing designs. Extract every unique color, font size, spacing value, border radius, shadow, and animation timing from your production applications. Most teams discover they have 15 to 30 unique colors when they thought they had 8, and spacing values that range from 2px to 47px with no discernible pattern.

Consolidate these values into a rational scale. For spacing, use a base unit (typically 4px or 8px) and build a scale: 4, 8, 12, 16, 24, 32, 48, 64, 96. For typography, define a modular scale with a clear ratio (1.2 or 1.25 works well) applied to a base size of 16px. For colors, build a palette with 10 shades per hue (50 through 900) and map semantic names to specific shades.

Name tokens using a consistent, predictable convention. We recommend a dot-separated path that reads from general to specific: `color.text.primary`, `color.background.surface`, `spacing.inline.md`, `typography.heading.lg.font-size`. Avoid names tied to specific values (`color.blue` tells you nothing about where to use it) or names tied to specific components (`sidebar-background` breaks when you use the same color elsewhere).

Document the intent of each semantic token. `color.text.secondary` should include a note like "Used for supporting text, captions, and labels. Contrast ratio of 4.5:1 minimum against color.background.surface." This documentation prevents well-meaning developers from repurposing tokens in ways that break accessibility or visual coherence.

## Tooling and the Token Pipeline

The token pipeline transforms your source token files into platform-specific outputs. The dominant tool in this space is Style Dictionary, originally developed by Amazon. It reads JSON or YAML token files and generates CSS custom properties, SCSS variables, iOS Swift structs, Android XML resources, Compose theme objects, and virtually any other format via custom transforms and formatters.

A typical pipeline looks like this: designers define tokens in Figma using a plugin like Tokens Studio (formerly Figma Tokens), which stores token JSON in a Git repository. A CI pipeline runs Style Dictionary to generate outputs for each platform. Generated files are published as packages: an npm package for web, a CocoaPod or Swift Package for iOS, and a Maven artifact or local module for Android.

Here is a simplified Style Dictionary configuration:

```json
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "css": {
      "transformGroup": "css",
      "buildPath": "build/css/",
      "files": [{
        "destination": "tokens.css",
        "format": "css/variables"
      }]
    },
    "ios-swift": {
      "transformGroup": "ios-swift",
      "buildPath": "build/ios/",
      "files": [{
        "destination": "Tokens.swift",
        "format": "ios-swift/class.swift",
        "className": "DesignTokens"
      }]
    },
    "android": {
      "transformGroup": "android",
      "buildPath": "build/android/",
      "files": [{
        "destination": "tokens.xml",
        "format": "android/resources"
      }]
    }
  }
}
```

Custom transforms handle platform-specific conversions. A color defined as hex in your source file might need to become a UIColor initializer on iOS, a `@ColorRes` reference on Android, and a CSS custom property on web. Spacing values defined in pixels might need to convert to `rem` for web and `dp` for Android.

For teams using Tailwind CSS, generate a Tailwind theme extension directly from your tokens. Map `color.primary` to `theme.extend.colors.primary`, `spacing.4` to `theme.extend.spacing.4`, and so on. This lets developers use familiar Tailwind classes (`bg-primary`, `p-4`) while the underlying values stay synchronized with the token system.


> See also: [Designing Data-Heavy Applications: Tables, Charts, and Dashboards](/blog/designing-data-heavy-applications-tables-charts-and-dashboards/)


## Implementing Theming and Dark Mode

One of the most powerful capabilities of a well-structured token system is theming. Because semantic tokens reference global tokens through indirection, you can swap the underlying values to create entirely different visual themes without changing a single component.

For dark mode, define two sets of semantic token values. In light mode, `color.background.surface` resolves to `gray.50` (a near-white). In dark mode, it resolves to `gray.900` (a near-black). `color.text.primary` flips from `gray.900` to `gray.50`. Every component that uses semantic tokens automatically adapts.

In CSS, this maps naturally to custom properties scoped to a selector:

```css
:root {
  --color-background-surface: #FAFAFA;
  --color-text-primary: #1A1A1A;
}

[data-theme="dark"] {
  --color-background-surface: #1A1A1A;
  --color-text-primary: #FAFAFA;
}
```

On native platforms, implement a token provider that reads the current theme and resolves tokens accordingly. On iOS, this integrates with `UITraitCollection` for dynamic colors. On Android, it maps to Material You theme overlays or custom theme attributes.

Beyond dark mode, tokens enable brand theming for white-label products. A SaaS platform that serves multiple enterprise clients can swap the global token palette per tenant, producing distinct branded experiences from a single codebase. One client gets their navy-and-gold palette; another gets forest-green-and-cream. The components remain identical; only the tokens change.

## Governance and Adoption Strategies

A token system is only as good as its adoption rate. If half your developers use tokens and the other half hard-code values, you gain complexity without consistency.

Enforce token usage through linting. On web projects, configure Stylelint to flag raw color values, pixel-based spacing, and hard-coded font sizes. A rule like `declaration-property-value-disallowed-list` can reject any `color` property that does not use a `var(--token-*)` reference. On native platforms, use SwiftLint or Detekt custom rules to flag non-token values in UI code.

Make tokens the path of least resistance. If using a token requires importing a file and typing a long variable name, developers will shortcut it. Provide IDE snippets, autocomplete integrations, and component APIs that accept token names directly. The developer experience of using tokens should be faster than hard-coding.

Establish a governance process for token changes. Adding a new color to the global palette or renaming a semantic token affects every platform simultaneously. Treat token changes like API changes: propose them in a pull request, review the generated output diff across all platforms, and communicate changes through release notes. Breaking changes (renaming or removing tokens) should follow a deprecation cycle.

Measure adoption quantitatively. Run periodic audits that scan your codebases for hard-coded values versus token references. Track the ratio over time. A healthy system shows token usage increasing monotonically toward 95% or higher. If the ratio stalls, investigate why developers are bypassing tokens and address the friction.

## Measuring the Impact

The ROI of design tokens compounds over time. In the short term, expect a 30% to 50% reduction in the time required to implement design changes that span multiple platforms. A rebrand that previously took six weeks of coordinated work across three platform teams can be completed in days by updating token values.

Accessibility improves because contrast ratios and font sizes are defined once and enforced everywhere. Dark mode launches become a token configuration exercise rather than a component-by-component audit. New platforms (a watch app, a TV app, an embedded widget) inherit the full design language on day one because they consume the same token packages.

The less tangible benefit is cultural. Tokens create a shared vocabulary between designers and developers. When a designer says "use the secondary text color," the developer knows exactly which token to reach for. Ambiguity drops, review cycles shorten, and the gap between design intent and implementation narrows to near zero.

---

Design tokens are foundational infrastructure for any multi-platform product. If your team is struggling with visual inconsistency across platforms or spending too much time on design-to-development handoffs, [reach out to our team](/contact.html) to learn how we can help you build a token system that scales.
