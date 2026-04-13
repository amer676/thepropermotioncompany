# Custom E-Commerce Development: When to Go Beyond Shopify

Shopify powers over four million online stores. For good reason --- it handles hosting, payments, security, and basic storefront features out of the box. For a new brand selling 50 products with standard shipping, Shopify is the right answer. But as businesses grow, the constraints of a platform built for the general case start creating friction that costs real revenue.

The decision to invest in custom e-commerce development is not about Shopify being bad. It is about recognizing the point where platform limitations cost more than the engineering investment to remove them. That inflection point differs for every business, but the signals are consistent and identifiable.

## Five Signs You Have Outgrown Your Platform

The most reliable indicator is when you are spending more on workarounds than you would on building the capability properly. Here are the specific symptoms.

**Your app stack is duct tape.** You have 18 Shopify apps installed, each costing $30-200 per month, and they conflict with each other. Your subscription management app breaks your inventory app. Your custom bundle builder slows page load by 3 seconds. The monthly app spend has crept to $2,000, and each app adds another JavaScript payload that drags your Core Web Vitals into the red.

**Your product model does not fit.** You sell configurable products with dozens of options, made-to-order items with customer-uploaded designs, subscription boxes with variable contents, or B2B products with customer-specific pricing. Shopify's variant system supports up to 100 variants per product with three option axes. If your product has 4 configuration dimensions with 5 choices each, that is 625 combinations --- six times the limit.

**Your checkout needs are non-standard.** You need split shipments from multiple warehouses, custom tax calculations for cross-border commerce, deposit-based purchasing, or approval workflows for B2B orders. Shopify's checkout is locked down by design. Shopify Plus opens some extensibility, but fundamental flow changes remain difficult.

**Your integration requirements are deep.** Your ERP, warehouse management system, and CRM need real-time bidirectional sync with your storefront. Shopify webhooks and API rate limits (currently 40 requests per second at the Plus level) create bottlenecks when you are processing thousands of inventory updates per hour across multiple locations.

**Your performance requirements are extreme.** You run flash sales where 50,000 users hit the site simultaneously, or your catalog contains 500,000 SKUs that need sub-second search. Platform-imposed architecture limits your ability to optimize for these scenarios.


> Related: [Privacy-First Software Development as Competitive Advantage](/blog/privacy-first-software-development-as-competitive-advantage/)


## What Custom E-Commerce Actually Looks Like in Practice

Custom e-commerce development does not mean building everything from scratch. It means choosing the right components for each layer and assembling them into a system tailored to your business.

A modern custom e-commerce architecture typically includes: a headless CMS for content management (Sanity, Contentful, or Strapi), a commerce engine for product data, cart, and checkout logic (Medusa, Saleor, or Commerce.js), a custom frontend built in Next.js or Remix for performance and flexibility, a payment processor integrated directly (Stripe, Adyen, or Braintree), and infrastructure on a cloud provider (Vercel, AWS, or GCP) that you control.

This headless approach gives you complete control over the customer experience while leveraging battle-tested services for payments and infrastructure. You are not reinventing credit card processing. You are assembling purpose-built tools and connecting them with custom logic that matches your business exactly.

For a specialty food company we worked with, the custom system included: a product builder that let customers assemble gift boxes from 200 items with real-time weight-based shipping calculation, a subscription engine that adjusted box contents based on seasonal availability, and a B2B portal where restaurant clients ordered at negotiated prices with net-30 terms. None of this was feasible within Shopify's constraints without a stack of plugins that degraded performance and created maintenance nightmares.

## The Real Cost Comparison: Platform vs. Custom

The honest cost comparison is more nuanced than most agencies present. Both sides tend to cherry-pick numbers.

**Shopify Plus costs** for a mid-market business: $2,300/month platform fee, $800-2,000/month in apps, 2.4-2.9% + $0.30 per transaction in payment processing (or 0.15% if using a third-party gateway), and $3,000-8,000/month for a Shopify agency on retainer for customizations. Annual total: $100,000-180,000, plus transaction fees that scale with revenue.

**Custom e-commerce costs**: $120,000-250,000 for initial build (12-20 weeks of development), $3,000-8,000/month for hosting and infrastructure, $2,000-5,000/month for ongoing maintenance and feature development, and payment processing at Stripe's standard 2.9% + $0.30 (or negotiated rates at volume). Annual cost after launch: $60,000-156,000, plus transaction fees.

The crossover point depends heavily on your transaction volume and customization needs. A business doing $5 million in annual revenue with standard requirements is likely cheaper on Shopify Plus. A business doing $5 million with complex product configuration, multi-warehouse fulfillment, and deep ERP integration often spends less on a custom system while getting exactly the functionality they need.

The hidden cost on the Shopify side is opportunity cost: the features you cannot build, the integrations you cannot make seamless, and the performance optimizations you cannot implement. These do not show up on an invoice, but they show up in conversion rates, customer satisfaction, and operational efficiency.


> See also: [Building White-Label SaaS Platforms for Multiple Brands](/blog/building-white-label-saas-platforms-for-multiple-brands/)


## Choosing Your Commerce Engine and Frontend Stack

If you decide to go custom, the technology choices you make in the first month determine your development velocity for the next five years.

For the commerce engine, evaluate based on your specific requirements. **Medusa.js** is open source, Node.js-based, and highly extensible. It handles products, orders, carts, discounts, and payments with a well-designed plugin system. It is a strong choice if your team already works in the JavaScript ecosystem. **Saleor** is Python/Django-based with a GraphQL API and a polished admin dashboard. It excels in multi-channel and multi-currency scenarios. **Commerce.js** is API-first and fully hosted, reducing infrastructure management at the cost of less customization depth.

For the frontend, **Next.js** is the dominant choice for custom e-commerce, and for good reason. Server-side rendering gives you strong SEO without sacrificing interactivity. The App Router with React Server Components lets you stream product pages to the browser progressively, which is measurably faster than client-side rendering for catalog-heavy sites. Image optimization via next/image handles the responsive image problem that plagues e-commerce performance.

Pair your frontend with a headless CMS for marketing content. Product data lives in the commerce engine, but landing pages, blog posts, promotional banners, and editorial content belong in a CMS that your marketing team can update without a developer. Sanity's real-time collaboration and structured content model make it a particularly good fit for e-commerce content.

## Migration Strategy: Moving Off a Platform Without Losing Revenue

Migrating from Shopify to a custom system is a 3-6 month project that must be executed without disrupting active sales. The wrong approach is a big-bang cutover. The right approach is incremental.

**Phase 1: Build the custom frontend while keeping Shopify as the commerce backend (4-8 weeks).** Use Shopify's Storefront API to power a new Next.js frontend. This gives you full control over the customer experience while keeping all commerce logic in Shopify. Launch this and confirm that conversion rates hold or improve.

**Phase 2: Migrate commerce logic to your new engine (4-8 weeks).** Set up Medusa or your chosen engine, migrate product data, and switch the frontend to use the new backend. Run both systems in parallel during the transition, with Shopify handling orders for any edge cases the new system does not yet support.

**Phase 3: Decommission Shopify (2-4 weeks).** Once the custom system handles 100% of orders without issues, redirect all traffic, cancel Shopify apps, and close the account. Keep a data export for historical records.

Throughout the migration, maintain URL parity. Every product URL, category URL, and landing page URL on the old site must either exist on the new site or redirect with a 301. SEO traffic is revenue. Losing it during migration is an unforced error that takes months to recover from.

Set up parallel analytics tracking before the migration starts. You need to compare conversion rate, average order value, and checkout completion rate between the old and new systems on identical traffic. If the new system shows a dip, pause and diagnose before proceeding.

## When Custom Is Not the Answer

Custom development is not always the right call, and an honest assessment saves everyone time and money.

If your annual revenue is under $2 million, the development investment rarely pays off. Shopify's constraints probably are not costing you enough revenue to justify a six-figure build. Focus on marketing and product development instead.

If your differentiation is in your product, not your shopping experience, platform limitations are unlikely to be your bottleneck. A DTC brand selling premium candles does not need a custom commerce engine. It needs great photography, compelling copy, and efficient ad spend.

If you do not have engineering resources for ongoing maintenance, a custom system will deteriorate. Security patches, dependency updates, and bug fixes are your responsibility, not a platform vendor's. Budget for at least 20 hours per month of ongoing engineering work, or the system becomes a liability.

The right question is not "can we build something better than Shopify?" You almost certainly can. The right question is "will the revenue impact of a custom system exceed the cost of building and maintaining it?" Answer that honestly, with real numbers, before writing the first line of code.

---

Evaluating whether custom e-commerce makes sense for your business? [Talk to us](/contact.html) --- we will give you an honest assessment based on your specific situation.
