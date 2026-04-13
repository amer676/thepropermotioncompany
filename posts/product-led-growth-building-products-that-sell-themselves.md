# Product-Led Growth: Building Products That Sell Themselves

Product-led growth is not a marketing strategy. It is an engineering and design philosophy that determines how you build software from the database schema up. When Dropbox lets you share a file with a non-user and that person signs up to retrieve it, that is not a growth hack — it is a core product decision that influenced their data model, their permissions system, their notification infrastructure, and their onboarding flow. Every PLG success story is rooted in architecture choices that most people never see.

The reason PLG is hard to retrofit is the same reason it is hard to fake: it requires the product itself to be the primary mechanism for acquisition, conversion, and expansion. If your product cannot demonstrate its value without a sales call, no amount of free tier generosity will make PLG work.

## Designing the Free-to-Paid Boundary

The most consequential product decision in a PLG company is where you draw the line between free and paid. Get it wrong in one direction and you give away too much value, creating a massive free user base with no conversion pressure. Get it wrong in the other direction and free users never experience enough value to understand why they should pay.

The best free-to-paid boundaries are usage-based rather than feature-based. Slack's message history limit (originally 10,000 messages) was brilliant because it was invisible on day one and became painful precisely when the team was deeply dependent on the product. Figma's limit on the number of project files works similarly: a single designer can do real work on the free tier, but a team hits the ceiling at exactly the point where Figma has become integral to their workflow.

Feature-based limits — where certain capabilities are locked behind a paywall — tend to work poorly for PLG because they prevent users from experiencing the full product. If the best feature is behind the paywall, users never discover it. If it is a marginal feature, it does not create conversion pressure.

The technical implementation of usage limits matters more than you would think. Hard cutoffs ("you have hit your limit, upgrade to continue") create frustration. Soft limits with degraded experience ("your workspace exceeds the free plan — older items will be archived in 7 days") create urgency without blocking work. The infrastructure to support this — tracking usage metrics per account in real-time, displaying contextual upgrade prompts, and gracefully degrading rather than hard-blocking — needs to be designed into the system from the beginning, not bolted on after launch.

## Activation Metrics and the Aha Moment

Every successful PLG product has a specific, measurable action that correlates strongly with long-term retention. For Slack, it was a team sending 2,000 messages. For Dropbox, it was placing a file in the synced folder. For Zoom, it was completing a meeting with more than one participant. These are not vanity metrics — they are the empirical signal that a user has experienced the core value proposition.

Finding your activation metric requires instrumentation and analysis, not guessing. Instrument every meaningful user action in your product from day one. Use event tracking (Segment, Rudderstack, or a custom event pipeline) to capture what users do, when they do it, and in what sequence. Then run a cohort analysis: for users who retained at 30/60/90 days versus those who churned, what actions did the retained group take in their first session, first day, and first week that the churned group did not?

The answer is often surprising. We worked with a project management tool that assumed their activation metric was "create a project." It was actually "invite a second team member." Solo users churned at 80% within 30 days regardless of how many projects they created. Users who invited even one teammate retained at 60%. This single insight reshaped their entire onboarding flow: instead of guiding new users to create their first project, they prompted them to invite colleagues first.

Once you have identified the activation metric, your entire onboarding experience should be engineered to drive users toward that action as quickly as possible, with as few steps as possible, and with as little friction as possible.

## Viral Loops That Are Actually Part of the Product

Viral growth in PLG is not about referral programs with discount codes. It is about product mechanics that naturally create exposure to non-users. There are three patterns that consistently work:

Collaboration loops: the product requires interaction between users, and at least some of those users are not yet on the platform. Google Docs, Figma, Notion, Miro — all of them let existing users share content with non-users, and the non-user must engage with the product to participate. The key technical requirement is a frictionless experience for the non-user: they should be able to view and interact with shared content without creating an account, and the account creation prompt should come after they have already experienced value.

Output loops: the product creates artifacts that are shared externally and carry the brand. Calendly links in email signatures, Typeform surveys embedded on websites, Loom videos shared in Slack channels. The artifact serves the user's purpose and simultaneously introduces the product to everyone who encounters it. Building this requires making the shared output genuinely useful on its own while including a subtle but visible attribution that links back to the product.

Network effect loops: the product becomes more valuable as more people in an organization or ecosystem adopt it. Slack within a company, GitHub within open source, Stripe within e-commerce. These are the hardest to engineer but the most defensible once established.

The technical foundation for all three patterns is a robust sharing and permissions system, a seamless guest or anonymous user experience, and instrumentation to track the full viral loop from share event to recipient engagement to conversion.

## Pricing Architecture for Self-Serve Revenue

PLG pricing must be self-serve by definition. If a user needs to talk to someone to understand your pricing, you have broken the model. The pricing page should answer every question a prospect has in under 60 seconds.

The most effective PLG pricing structures have three tiers at most, with clear value differentiation between each tier. The free tier exists to drive adoption. The mid tier (usually $10-50/user/month for B2B) captures individuals and small teams. The top tier captures larger organizations with needs around administration, security, compliance, or volume.

Per-seat pricing is the most common model but not always the best. If your product's value scales with usage rather than users — data volume, API calls, storage, compute — usage-based pricing aligns your revenue with the value you deliver. The challenge is predictability: customers dislike unpredictable bills, so you need clear dashboards showing current usage, projected costs, and alerts before they hit thresholds.

The billing infrastructure for PLG is non-trivial. You need: metering that tracks usage in real-time or near-real-time, a billing system that can handle prorated upgrades and downgrades mid-cycle (Stripe Billing or a custom system on top of Stripe's API), dunning logic for failed payments that does not immediately lock out the user, and a self-serve portal where users can manage their subscription without contacting support. Stripe, Paddle, and Lago are the common choices for the payment layer, but the metering and entitlement logic almost always requires custom code.

## Instrumentation That Drives Product Decisions

PLG requires a level of product analytics that most companies underinvest in. You need to understand not just aggregate metrics but the full funnel from first touch to activation to conversion to expansion, segmented by acquisition channel, user persona, and behavior cohort.

The minimum instrumentation for a PLG product includes: page views and feature usage events (with user and account identifiers), funnel tracking through signup, activation, and conversion milestones, cohort retention curves (weekly or monthly depending on your product's natural usage cadence), and revenue attribution back to acquisition source and activation behavior.

The tooling typically involves an event collection layer (Segment or a custom Kafka-based pipeline), a product analytics platform (Amplitude, Mixpanel, or PostHog for self-hosted), and a data warehouse (BigQuery, Snowflake) for custom analysis that goes beyond what the analytics platform supports. PostHog deserves special mention because it combines event tracking, session recording, feature flags, and A/B testing in a single self-hosted platform, which simplifies the stack considerably and keeps user data under your control.

The metric that matters most for PLG is not MRR or DAU — it is the ratio of signups to activated users to paying customers, and how that ratio changes over time. If your signup-to-activation rate is declining, your onboarding is degrading. If your activation-to-conversion rate is declining, your free tier is too generous or your paid tier is not compelling enough. These ratios are the vital signs of a PLG business.

## When PLG Is the Wrong Model

PLG is not universally applicable, and forcing it onto the wrong product is expensive. It does not work when the product requires significant configuration or integration before it delivers value — an enterprise data pipeline tool that needs a week of setup will never be PLG. It does not work when the buyer is not the user — if procurement makes software decisions rather than the people who use the software, top-down sales will always outperform bottom-up adoption. And it does not work when the market is small and high-value — if you have 500 potential customers who each pay $100K+/year, you want a sales team, not a self-serve funnel.

The hybrid model — PLG for acquisition and land, sales-assisted for expansion and enterprise deals — is where most successful companies end up. Slack, Notion, and Figma all started as pure PLG and layered on sales teams as they moved upmarket. The product does the work of getting into an organization; the sales team does the work of expanding the contract.

If you are building a product where the growth model is as important as the features themselves, [let's talk about how to architect for PLG from the start](/contact.html).
