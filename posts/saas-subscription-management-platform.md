# SaaS Subscription Management Platform

Subscription billing looks simple from the outside: charge customers a monthly fee, give them access. In practice, subscription management is one of the most complex domains in software engineering. You are dealing with prorations, plan changes mid-cycle, dunning workflows, tax calculations across jurisdictions, usage-based metering, entitlement enforcement, free trials that convert (or do not), annual versus monthly billing, seat-based versus usage-based versus hybrid pricing, and the entire revenue recognition problem that keeps finance teams up at night.

Most SaaS companies start with Stripe Billing and a few webhook handlers. That works until it does not — and the point where it breaks is usually when the business needs pricing flexibility that the billing system's configuration cannot express.

## The Entitlement System Nobody Builds Early Enough

Billing and entitlements are separate concerns, and conflating them is one of the most common architectural mistakes in SaaS platforms. Billing answers the question "how much does this customer owe us?" Entitlements answer the question "what is this customer allowed to do right now?"

In early-stage SaaS, these are often the same: you check the customer's Stripe subscription status and use the plan ID to determine feature access. This works with two or three plans and no add-ons. It falls apart when you introduce: plan-specific feature flags (Pro gets API access, Starter does not), usage limits (free plan gets 1,000 API calls per month), seat-based limits that can be adjusted independent of the plan, add-on products that grant additional entitlements outside the base plan, and custom enterprise deals that do not map cleanly to any predefined plan.

The architecture that scales is a dedicated entitlement service — a system that maintains a real-time view of what each account is entitled to, fed by events from the billing system but not coupled to its data model. When a user attempts to access a feature, the application queries the entitlement service, not Stripe. When a subscription changes (upgrade, downgrade, cancellation, add-on purchase), the billing system emits an event, and the entitlement service updates its state accordingly.

The data model for the entitlement service is straightforward: a table of entitlements keyed by account ID, with columns for entitlement type (feature flag, usage limit, seat count), the current value, and the source (which subscription or add-on granted this entitlement). Usage tracking gets its own table: account ID, entitlement type, usage count, and period.

This separation pays for itself the first time a salesperson closes a deal with custom terms that do not fit any existing plan. Instead of creating a fake Stripe subscription that sort-of-matches, you record the billing terms in your billing system and the entitlements in your entitlement service, and neither system has to compromise its data model.


> Related: [SaaS Pricing Strategy: Models, Psychology, and Implementation](/blog/saas-pricing-strategy-models-psychology-and-implementation/)


## Handling Plan Changes Without Losing Money or Trust

Plan changes — upgrades, downgrades, and seat adjustments — are where subscription billing complexity concentrates. The business rules around what happens to the current billing cycle when a customer changes their plan are surprisingly contentious.

For upgrades, the standard approach is immediate access to the new plan with a prorated charge for the remainder of the current billing period. Stripe handles this natively with `proration_behavior: 'create_prorations'`. The UX challenge is making the prorated amount clear to the customer before they confirm the change. A preview endpoint that calculates and displays the prorated charge — "You will be charged $47.50 today for the remaining 19 days of your billing cycle, and your next invoice on March 1 will be $149/month" — eliminates support tickets about unexpected charges.

Downgrades are trickier. Most SaaS companies apply downgrades at the end of the current billing period: the customer keeps their current plan features until the period they have already paid for expires. This is fair and straightforward to implement — you schedule the plan change in Stripe and update entitlements when the change takes effect. But you need to handle the edge case where the customer's current usage exceeds the limits of the plan they are downgrading to. Do you force them to reduce usage before the downgrade takes effect? Do you grandfather their current data but prevent new creation? The answer is product-specific, but the system needs to support whatever policy you choose.

Seat-based changes require their own logic. Adding seats is usually immediate with a prorated charge. Removing seats should not be allowed to go below the number of active users — the customer needs to deactivate users first. The seat management UI needs to show active versus allocated seats, provide a clear workflow for deactivating users, and display the billing impact of seat changes before confirmation.

## Usage Metering at Scale

Usage-based billing introduces a real-time data problem. You need to accurately count API calls, storage consumption, compute minutes, or whatever usage dimension drives your pricing — and you need to do it at a scale where simple database increments will not work.

The architecture for usage metering typically involves three components: an ingestion layer that accepts usage events with minimal latency, an aggregation layer that rolls up raw events into billable quantities, and a billing integration that reports aggregated usage to your billing system at the end of each billing period.

For the ingestion layer, the critical requirement is that recording usage must not add latency to the user's request. This means asynchronous ingestion: the application emits a usage event to a queue (Kafka, SQS, Redis Streams) and continues processing the request. A consumer reads events from the queue and writes them to the aggregation store.

The aggregation store needs to support fast increment operations and efficient period-based queries. Redis with sorted sets (keyed by account and period, scored by timestamp) works well for real-time usage lookups. For persistent storage and billing reconciliation, a time-series table in PostgreSQL with a composite index on (account_id, period_start, metric_type) handles most SaaS-scale workloads — you would need to be processing tens of millions of events per day before this becomes a bottleneck.

The tricky part is handling usage that crosses billing period boundaries, dealing with retries and deduplication (if the usage event is published but the acknowledgment is lost, you do not want to double-count), and reconciling your internal usage counts with what Stripe or your billing system records. Running a nightly reconciliation job that compares your aggregated usage with the billing system's records — and alerting on discrepancies — catches integration issues before they become customer-facing billing errors.


> See also: [Complex Subscription Billing Architecture](/blog/complex-subscription-billing-architecture/)


## Dunning and Involuntary Churn Recovery

Failed payments are the most underoptimized part of most subscription businesses. Industry data suggests that 20-40% of SaaS churn is involuntary — customers whose payments fail due to expired cards, insufficient funds, or bank-side fraud blocks, not because they chose to cancel. Recovering even a fraction of these failed payments has a direct, measurable impact on revenue.

Stripe's built-in retry logic (Smart Retries) handles the basics: it attempts failed charges multiple times over a configurable window, using machine learning to optimize retry timing. But the customer-facing communication is equally important and usually requires custom implementation.

A good dunning sequence looks like: on first failure, send an email notifying the customer and linking directly to a hosted payment method update page (not your general settings page — reduce the number of clicks to resolve the issue). If the first retry also fails, send a more urgent email 3 days later. On the final retry failure, send a warning that the account will be downgraded to a free tier (not immediately cancelled — cancellation destroys the relationship). If no action is taken, downgrade the account but preserve data. Send a recovery email 7 days later offering to restore full access when payment is updated.

The payment method update flow should be dead simple: a single page with a card input, pre-filled with the customer's email, that updates the payment method and immediately retries the outstanding invoice. Stripe's Customer Portal handles this, but the default design is generic. A branded, inline experience converts better.

Track your involuntary churn recovery rate as a key metric. If your dunning sequence recovers less than 30% of initially failed payments, there is room to improve — better email copy, SMS in addition to email, in-app banners for users with failing payments, or earlier notification before a card's expiration date.

## Revenue Recognition and Reporting

For SaaS companies past the early stage, revenue recognition (ASC 606 compliance) is a real concern. The core principle is that revenue is recognized when performance obligations are satisfied, not when cash is received. For a monthly subscription, this is simple: you recognize 1/30th of the monthly fee each day. For annual subscriptions paid upfront, you receive the cash in month one but recognize revenue ratably over 12 months.

The reporting requirements include: monthly recurring revenue (MRR) broken down by new, expansion, contraction, and churned; annual recurring revenue (ARR); deferred revenue balances; and cohort-based retention metrics. These numbers need to be accurate, consistent, and auditable.

Most SaaS companies at scale use a dedicated revenue recognition tool — ChartMogul, Baremetrics, or ProfitWell (now Paddle) for SaaS metrics, and tools like Zuora RevPro or Stripe Revenue Recognition for ASC 606 compliance. The integration between your billing system and these tools is critical: every invoice, credit note, refund, and plan change needs to flow through to the revenue system in real-time.

If you are earlier stage and not yet worried about ASC 606, at minimum build a dashboard that tracks MRR, shows the components of MRR change month over month, and calculates net revenue retention (NRR). NRR above 100% means your existing customers are growing faster than they are churning, and it is the single most important metric for a subscription business.

Building subscription management infrastructure is a significant investment, but the alternative — outgrowing your billing system and doing a mid-flight migration — is worse. If you are planning a SaaS product or struggling with the complexity of your current subscription system, [we have done this before and can help](/contact.html).
