# How to Build an Invoicing and Billing System

Billing is one of those systems that seems simple until you actually build it. You need to generate invoices --- how hard can that be? Then you encounter partial payments, pro-rated charges, mid-cycle plan changes, tax calculations across multiple jurisdictions, dunning sequences for failed payments, revenue recognition rules, and the inevitable customer who disputes a charge from three months ago. A billing system that handles all of this reliably is a serious engineering undertaking, and getting it wrong directly costs you money through revenue leakage, customer disputes, and accounting reconciliation nightmares.

This guide covers the architecture and key decisions for building an invoicing and billing system that scales with your business, handles the edge cases that trip up most implementations, and keeps your finance team sane.

## Core Data Model Design

The foundation of any billing system is its data model. Get this right and everything downstream is manageable. Get it wrong and you will be fighting schema migrations for years.

**Customers and accounts** should be separated from the start. A customer is the legal entity you have a relationship with. An account is a billing context within that customer. Enterprise customers routinely need multiple accounts: one per department, one per project, or one per subsidiary. If your data model equates customer with account, you will need a painful migration when your first enterprise deal requires separate invoicing for their marketing and engineering departments.

**Products and prices** need a many-to-many relationship with versioning. A product (your SaaS platform, a professional services package, a data API) can have multiple prices: a monthly price, an annual price, a per-seat price, a usage-based price, and promotional prices for specific customers. Prices change over time, but existing subscriptions should honor the price at the time of purchase unless explicitly migrated. Store price history as immutable records with effective dates.

**Subscriptions** track the ongoing relationship between an account and a set of products/prices. A subscription has a status (active, paused, canceled, past_due), a billing cycle (monthly, quarterly, annual), a current period start and end date, and references to the specific price records that govern it. Support multiple subscriptions per account --- customers frequently purchase add-ons or secondary products that bill on different cycles.

**Line items** are the atomic units of a charge. Every charge on an invoice traces back to a line item with a description, quantity, unit price, amount, tax amount, and references to the product, price, and subscription that generated it. Line items should be immutable once invoiced. If you need to adjust a charge, create a credit line item rather than modifying the original.

**Invoices** aggregate line items for a billing period. An invoice has a status (draft, open, paid, void, uncollectible), an issue date, a due date, a total amount, a balance due, and a collection of line items. Store invoices as immutable documents once they transition from draft to open. Regulatory requirements in many jurisdictions prohibit modifying issued invoices --- corrections must be made via credit notes.

**Payments** record money received. Link payments to invoices, but do not assume a one-to-one relationship. A single payment can cover multiple invoices (a customer catches up on past-due invoices with one wire transfer), and a single invoice can be covered by multiple payments (a partial payment followed by the remainder).


> Related: [How to Plan and Execute a Software Migration](/blog/how-to-plan-and-execute-a-software-migration/)


## Handling Usage-Based and Hybrid Billing

Usage-based billing (charging per API call, per GB stored, per transaction processed) adds significant complexity because the billable amount is not known until the end of the billing period.

**Metering infrastructure** must be reliable, scalable, and auditable. Usage events flow from your application into a metering pipeline that aggregates them by account, product, and billing period. This pipeline must handle at-least-once delivery semantics --- duplicate events must be idempotent rather than double-counted. Use a unique event ID for deduplication.

Process usage events in near-real-time (within 5-15 minutes of occurrence) even if you only invoice monthly. This enables:
- Real-time usage dashboards for customers so they can monitor their consumption
- Alerts when customers approach usage thresholds or spending limits
- Prepaid balance deduction so customers see their remaining credits decrease as they consume

**Aggregation tiers** allow you to charge different rates at different usage levels: $0.10 per API call for the first 10,000, $0.08 for 10,001-100,000, $0.05 above 100,000. Implement tier calculation as a function that takes total usage and a tier schedule as inputs and returns the total charge and a breakdown by tier. Test this function exhaustively with edge cases: usage exactly at tier boundaries, zero usage, usage exceeding all defined tiers.

**Hybrid billing** combines a flat subscription fee with usage-based charges. A SaaS platform might charge $500/month for the base plan plus $0.02 per transaction processed. The subscription charge is known in advance and can be invoiced at the start of the billing period. The usage charge is calculated at the end and invoiced in arrears. You need to decide whether to issue two separate invoices or combine them on a single invoice with different line item types. Most businesses prefer a single combined invoice for simplicity.

## Tax Calculation and Compliance

Sales tax, VAT, and GST compliance is the single most underestimated aspect of billing system development. If you sell to customers in multiple states or countries, tax calculation is not something you can build correctly in-house without dedicated tax expertise.

In the United States alone, there are over 13,000 tax jurisdictions with different rates, rules about what is taxable (SaaS is taxed differently than downloadable software, which is taxed differently than professional services), and filing requirements. The 2018 South Dakota v. Wayfair Supreme Court decision established that states can require sales tax collection from out-of-state sellers based on economic nexus (typically $100,000 in sales or 200 transactions in a state).

**Use a tax calculation service** like Avalara, TaxJar, or Anrok rather than building tax logic. These services maintain the tax rate databases, determine taxability based on product classification, and handle the ongoing rate changes that occur constantly. Integration typically involves sending the line item details (product type, amount, ship-to address) to the tax API and receiving back the applicable tax rate and amount.

Configure your product catalog with tax codes that map to the tax service's classification system. A "SaaS subscription" has different taxability than "data processing services" or "consulting" in most jurisdictions. Incorrect product classification is the most common source of tax calculation errors.

**Store tax details at the line item level.** Record the tax rate, tax amount, tax jurisdiction, and the tax service's transaction ID for each line item. This audit trail is essential for tax filing and for responding to tax authority inquiries.

**Automate tax filing** if your volume justifies it. Services like Avalara Returns can automatically file sales tax returns in all jurisdictions where you have obligations. Below approximately $50,000 in monthly taxable revenue, manual quarterly filing may be manageable. Above that threshold, automation prevents missed filings and associated penalties.


> See also: [The AI Technology Stack: Models, Frameworks, and Infrastructure Guide](/blog/the-ai-technology-stack-models-frameworks-and-infrastructure-guide/)


## Payment Processing and Dunning

Collecting payment is the point of the entire system. Build robust payment processing with graceful handling of the many things that go wrong.

**Integrate with a payment processor** like Stripe, Braintree, or Adyen for card payments, and consider ACH/bank transfer support for B2B customers with larger invoice amounts. Store only tokenized payment method references --- never store raw card numbers. PCI DSS compliance is mandatory if you handle card data, and the simplest path to compliance is never touching card data directly.

**Implement smart retry logic** for failed payments. Card payments fail for many reasons: insufficient funds (temporary), expired card (permanent until updated), processor downtime (transient), fraud block (requires customer action). Do not retry all failures the same way.

A recommended dunning sequence:
- **Day 0:** Payment fails. Retry immediately once (catches transient processor issues).
- **Day 1:** Send email notification to customer about the failed payment with a link to update their payment method.
- **Day 3:** Retry payment. If the card was declined for insufficient funds, a few days' delay often resolves it.
- **Day 5:** Send second email notification with increased urgency.
- **Day 7:** Retry payment.
- **Day 10:** Send final warning email stating the account will be restricted or suspended.
- **Day 14:** Retry payment. If this fails, transition the subscription to past_due status and restrict access according to your policy.
- **Day 30:** If still unpaid, transition the invoice to uncollectible status and the subscription to canceled. Depending on the amount, route to collections.

Each step in the sequence should be configurable (timing, email content, retry behavior) without code changes. Different customer segments may warrant different dunning aggressiveness --- an enterprise customer on a $50,000 annual contract deserves a phone call, not an automated email threatening suspension.

**Handle credit notes and refunds** as first-class operations. When you need to reverse a charge, issue a credit note linked to the original invoice. If the customer has already paid, process a refund through the payment processor and record it against the credit note. The credit note maintains your audit trail and keeps your accounting clean.

## Reporting and Revenue Recognition

Your billing system produces data that feeds directly into financial reporting. Build reporting capabilities that satisfy both operational and accounting needs.

**Operational dashboards** should show: monthly recurring revenue (MRR) and its components (new, expansion, contraction, churn), outstanding receivables aging (current, 30 days, 60 days, 90+ days), payment success rates and failure reasons, and revenue by product, plan, and customer segment.

**Revenue recognition** under ASC 606 requires recognizing revenue when performance obligations are satisfied, not when payment is received. For a monthly SaaS subscription paid annually, you collect $12,000 upfront but recognize $1,000 per month over the subscription term. For usage-based billing, revenue is recognized as usage occurs. Your billing system must generate the journal entries or data feeds that your accounting system needs to record revenue correctly.

Build an automated reconciliation process that matches payments received (from your payment processor's records) against invoices in your billing system and deposits in your bank account. Discrepancies happen --- processor fees, currency conversion differences, partial payments --- and catching them promptly prevents month-end accounting headaches.

**Export capabilities** are essential. Your finance team needs to get data into their accounting system (QuickBooks, Xero, NetSuite, or a custom ERP). Build exports in the formats your accounting system accepts, running on a schedule that aligns with your close process.

---

If you need a custom invoicing and billing system that handles the complexity of your pricing model --- usage-based billing, multi-entity invoicing, tax compliance, or subscription management --- [get in touch](/contact.html). We build billing systems that scale with your business and keep your finance team confident in the numbers.
