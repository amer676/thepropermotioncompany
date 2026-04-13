# Stripe Payment Integration: Subscriptions, Invoicing, and Marketplace Payments

Stripe processes over $1 trillion in payments annually and powers the billing infrastructure for companies ranging from solo SaaS founders to Amazon and Shopify. Its dominance is deserved -- the API design is excellent, the documentation is among the best in the industry, and the feature set covers nearly every payment scenario a web application encounters.

But Stripe's breadth is also its challenge. The platform offers so many products, configurations, and integration paths that teams frequently make architectural decisions early that become expensive to undo later. A subscription billing system that works fine for 100 customers can become a tangle of webhook race conditions and proration edge cases at 10,000. A marketplace payment integration that passes compliance review with a simple model falls apart when you add international sellers or complex fee structures.

This guide covers the three most common Stripe integration patterns -- subscriptions, invoicing, and marketplace payments -- with specific attention to the architectural decisions that matter at scale.

## Subscription Billing: Getting the Data Model Right

Stripe's subscription system is powerful but opinionated. Understanding its data model before you start building saves significant rework.

**The Stripe object hierarchy for subscriptions:** A `Customer` has one or more `Subscriptions`. Each `Subscription` has one or more `SubscriptionItems`, each tied to a `Price`. A `Price` belongs to a `Product`. This hierarchy is important because many applications conflate customers with subscriptions or assume a 1:1 relationship.

**Map Stripe customers to your users correctly.** Create a Stripe Customer when a user signs up or when they first need billing -- not both. Store the Stripe Customer ID (`cus_xxx`) on your user record. One user should have exactly one Stripe Customer, even if they have multiple subscriptions. If your application has organizations with multiple members, the Stripe Customer should correspond to the organization, not the individual user who entered the credit card.

**Use Stripe as the source of truth for billing state.** This is the most important architectural decision. Your application database should store the Stripe Customer ID and Subscription ID, but the canonical subscription state (status, current period, plan, quantity) should always be read from Stripe via webhooks. Do not build logic that writes subscription state to your database and then tries to keep it in sync with Stripe -- you will lose that race.

Instead, listen for `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted` webhooks. When these arrive, update your local cache of the subscription state. Your application's access control (checking whether a user has an active subscription) should query your local cache for performance but should be reconcilable against Stripe's API if discrepancies arise.

**Handling plan changes and proration.** When a customer upgrades from a $49/month plan to a $99/month plan mid-cycle, Stripe handles proration automatically by default. It calculates the unused portion of the old plan, credits it, and charges the prorated amount of the new plan. This is usually what you want, but test the proration behavior with specific scenarios: what happens when a customer upgrades on the last day of the billing cycle? What if they downgrade and then upgrade again in the same cycle? What if they change from monthly to annual billing?

Use `proration_behavior: 'create_prorations'` (the default) for most cases. Set it to `'none'` only if your business model does not prorate (rare). Use `'always_invoice'` if you want the customer to pay the difference immediately rather than at the next invoice.

**Trial periods and free tiers.** Stripe supports trial periods natively on subscriptions (`trial_period_days` or `trial_end`). For free tiers, you have two options: do not create a Stripe Subscription at all (simpler -- your application checks for the absence of a subscription and grants free-tier access), or create a subscription with a $0 price (more complex but useful if you want Stripe's lifecycle management and easy upgrade paths). We recommend the first approach for most applications.


> Related: [Next.js for Business Applications: Why We Choose It](/blog/nextjs-for-business-applications-why-we-choose-it/)


## Invoice Architecture for B2B Billing

SaaS applications serving businesses often need invoicing capabilities beyond simple subscription charges: usage-based billing, one-time charges, tax compliance, and accounts receivable workflows.

**Stripe Invoices vs. Stripe Billing.** Stripe creates invoices automatically for subscription charges, but you can also create standalone invoices for one-time charges, consulting fees, or custom quotes. Use `invoice.created` webhooks to capture every invoice and store a reference in your database. Display invoices to customers through Stripe's hosted invoice page (via the `hosted_invoice_url` property) rather than building your own invoice rendering -- Stripe's hosted page handles tax display, payment collection, and receipt generation.

**Usage-based billing with metered pricing.** For applications that charge based on consumption (API calls, storage, compute hours, messages sent), Stripe's metered billing works as follows: create a Price with `recurring.usage_type: 'metered'`, then report usage throughout the billing period using the Usage Record API. At the end of each period, Stripe calculates the total usage, generates an invoice, and charges the customer.

Report usage as close to real-time as practical. If you batch usage reports (e.g., once per hour), idempotency keys prevent double-counting if a batch is retried. Set `action: 'set'` to report absolute usage for the period rather than `action: 'increment'` for each event -- this is safer because a retry does not double the count.

For high-volume metering (millions of events per day), do not call the Stripe Usage Record API for every event. Instead, aggregate events in your own system (using Redis counters or a time-series database) and report summarized usage to Stripe periodically (every hour or every six hours).

**Tax calculation and compliance.** Stripe Tax calculates and collects sales tax, VAT, and GST automatically based on the customer's location and the product's tax code. Enable it early -- retrofitting tax compliance is painful. Register your tax obligations in the Stripe Dashboard, assign tax codes to your products, and Stripe handles rate lookup, calculation, and reporting.

For US-based SaaS, economic nexus rules mean you may owe sales tax in states where you have customers but no physical presence. The thresholds vary by state ($100,000 in revenue or 200 transactions is common). Stripe Tax tracks your approach to these thresholds and alerts you when you may need to register.

**Dunning and failed payment recovery.** B2B customers fail payments more often than you expect -- expired cards, insufficient funds, bank declines. Stripe's Smart Retries automatically retry failed charges with optimized timing, recovering up to 40 percent of failed payments without any action from you. Configure your retry schedule in the Stripe Dashboard (three retries over 14 days is a reasonable default) and set up `invoice.payment_failed` webhooks to trigger your own dunning communications -- emails to the customer asking them to update their payment method.

Build a grace period into your access control. When a payment fails, do not immediately revoke access. Give the customer 7 to 14 days to resolve the issue. Immediately locking someone out of a tool they depend on daily generates support tickets and churn, not payments.

## Marketplace Payments with Stripe Connect

If your platform facilitates payments between buyers and sellers (a marketplace, a booking platform, a gig economy app), Stripe Connect is the integration layer. It is also the most complex Stripe product and the one most frequently implemented incorrectly.

**Choose the right Connect account type.** Stripe offers three account types for connected sellers:

*Standard accounts:* Sellers create their own Stripe accounts through Stripe's hosted onboarding flow. Your platform redirects them to Stripe, they enter their business and banking details, and Stripe handles KYC verification. You can then create charges on their behalf. This is the simplest integration and is appropriate for platforms where sellers are established businesses.

*Express accounts:* Stripe hosts the onboarding experience but your platform controls the account. Sellers see a Stripe-branded dashboard customized with your branding. This is the most common choice for marketplaces and gig platforms.

*Custom accounts:* You build the entire onboarding experience and are responsible for collecting and transmitting KYC information to Stripe. This gives you full UI control but adds significant compliance burden. Use Custom accounts only if Express accounts do not meet your UX requirements.

For most platforms, Express accounts are the right choice. They balance user experience control with compliance simplicity.

**Payment flow architecture.** For marketplace payments, use the Payment Intents API with either direct charges, destination charges, or separate charges and transfers.

*Destination charges* are the most common pattern: the customer pays your platform, and Stripe automatically transfers the seller's portion to their connected account minus your platform fee. The charge appears on the customer's statement as your platform name.

```
PaymentIntent.create(
  amount: 10000,  // $100.00
  currency: 'usd',
  application_fee_amount: 1500,  // $15.00 platform fee
  transfer_data: { destination: 'acct_seller123' }
)
```

This single API call handles payment collection, fee extraction, and seller payout. Stripe deposits the seller's share ($85.00) into their connected account according to their payout schedule.

**Handling refunds in marketplace models.** Refund logic in marketplaces is more complex than in direct sales because you need to decide: Does the platform absorb the refund? Does the seller absorb it? Is the platform fee refunded? Stripe lets you reverse the transfer to the connected account when issuing a refund, but you must explicitly configure this. By default, refunding a destination charge refunds the full amount from your platform's balance without reversing the transfer to the seller.

**Onboarding compliance.** Stripe requires connected accounts to complete KYC verification. Monitor the `account.updated` webhook and check the `requirements` field. If `requirements.currently_due` is not empty, the seller has outstanding compliance requirements that will eventually result in payouts being paused. Build UI in your platform that surfaces these requirements and links the seller to their Stripe dashboard to resolve them.


> See also: [How to Build a Booking and Scheduling System](/blog/how-to-build-a-booking-and-scheduling-system/)


## Webhook Reliability and Event Processing

Webhooks are the backbone of every Stripe integration, and getting them wrong causes the most subtle and damaging bugs.

**Verify webhook signatures.** Every webhook endpoint must verify the `Stripe-Signature` header using your webhook signing secret. This prevents attackers from sending fake events to your endpoint. Use Stripe's official library function (`stripe.webhooks.constructEvent` in Node.js) rather than implementing verification yourself.

**Design for at-least-once delivery.** Stripe may send the same webhook event multiple times. Your event handlers must be idempotent -- processing the same event twice should have the same result as processing it once. Use the event ID (`evt_xxx`) as an idempotency key: before processing, check if you have already processed this event ID. If so, return 200 without processing again.

**Process webhooks asynchronously.** Your webhook endpoint should validate the event, store it in a database or queue, and return 200 immediately. Do not perform business logic synchronously in the webhook handler -- if your processing takes more than 10 seconds, Stripe will time out and retry, potentially causing duplicate processing.

**Handle event ordering.** Stripe does not guarantee webhook delivery order. You may receive `invoice.paid` before `invoice.created`, or `customer.subscription.updated` before `customer.subscription.created`. Design your handlers to be tolerant of out-of-order delivery. If a handler receives an event that references an object your system does not know about yet, either queue it for retry in 30 seconds or fetch the object directly from the Stripe API.

A well-architected Stripe integration feels invisible to users -- payments just work, subscriptions renew without friction, and marketplace sellers get paid on time. The engineering effort is in the edge cases, the retry logic, and the data consistency that make this reliability possible.

---

If you are building a payment system with Stripe and want to get the architecture right from the start, [talk to The Proper Motion Company](/contact.html). We have integrated Stripe into applications handling subscription billing, usage metering, and multi-sided marketplace payments.
