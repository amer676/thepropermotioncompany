# The Complete Guide to SaaS Metrics

SaaS businesses live and die by their metrics. Unlike traditional software where you sell a license and move on, SaaS revenue compounds or decays month over month. Understanding which numbers matter, what good looks like, and how metrics relate to each other is the difference between a founder who reacts to problems and one who anticipates them.

This guide covers every metric a SaaS founder needs to track, with benchmarks drawn from OpenView Partners, ProfitWell, ChartMogul, and our own experience working with SaaS companies from pre-revenue through Series B.

## Revenue Metrics That Tell the Full Story

Revenue in SaaS is more nuanced than total income. You need to decompose it.

**Monthly Recurring Revenue (MRR).** The foundation of all SaaS metrics. MRR is the sum of all recurring subscription revenue normalized to a monthly figure. Annual subscriptions are divided by 12. One-time fees (setup charges, consulting) are excluded. Track MRR, not total revenue, because MRR reflects the sustainable, predictable portion of your business.

Break MRR into its components: New MRR (revenue from customers who subscribed this month), Expansion MRR (revenue increase from existing customers upgrading or adding seats), Contraction MRR (revenue decrease from downgrades), Churned MRR (revenue lost from cancellations), and Reactivation MRR (revenue from previously churned customers returning). The formula: Net New MRR = New MRR + Expansion MRR + Reactivation MRR - Contraction MRR - Churned MRR. Positive Net New MRR means you are growing. Negative means you are shrinking.

**Annual Recurring Revenue (ARR).** MRR multiplied by 12. ARR is the standard metric used by investors and in valuation discussions. Most SaaS companies begin tracking ARR once they exceed $100K MRR.

**Average Revenue Per Account (ARPA).** Total MRR divided by number of paying accounts. Track ARPA over time; a rising ARPA indicates you are either moving upmarket, successfully upselling, or both. Benchmark: ARPA varies enormously by segment. SMB SaaS products typically range from $30 to $200/month. Mid-market products from $500 to $5,000/month. Enterprise from $5,000 to $50,000+/month.

**Revenue growth rate.** Calculate month-over-month MRR growth rate. Early-stage SaaS companies (under $1M ARR) should target 15% to 20% month-over-month growth. Companies between $1M and $10M ARR should target 8% to 12%. Beyond $10M ARR, 5% to 8% month-over-month is strong. These are aggressive benchmarks; many successful companies grow slower. But if your growth rate is below 3% month-over-month at any stage, you have a structural problem to diagnose.

## Customer Acquisition Metrics

How much it costs to acquire a customer and how long it takes to recoup that cost are survival-level questions for SaaS.

**Customer Acquisition Cost (CAC).** Total sales and marketing spend in a period divided by the number of new customers acquired in that period. Include salaries, advertising spend, software tools, events, and content production costs. Be honest about what goes into sales and marketing; underreporting CAC creates a false sense of efficiency.

Benchmark: For self-serve SaaS (no sales team), CAC ranges from $100 to $500. For sales-assisted SaaS with SDRs and AEs, CAC ranges from $2,000 to $15,000. For enterprise SaaS with complex sales cycles, CAC can exceed $50,000. None of these numbers are inherently good or bad; they must be evaluated against LTV.

**CAC Payback Period.** The number of months to recoup the cost of acquiring a customer. Formula: CAC divided by (ARPA times gross margin). If your CAC is $3,000, your ARPA is $300/month, and your gross margin is 80%, your payback period is $3,000 / ($300 x 0.80) = 12.5 months. Benchmark: under 12 months is healthy. Under 6 months is excellent. Over 18 months is a red flag unless you have very high retention (net revenue retention above 120%).

**LTV:CAC ratio.** Customer Lifetime Value divided by CAC. This is the single most important efficiency metric. Formula for LTV: ARPA times gross margin divided by monthly churn rate. If your ARPA is $200, gross margin is 85%, and monthly churn is 3%, then LTV = ($200 x 0.85) / 0.03 = $5,667. If your CAC is $1,500, your LTV:CAC ratio is 3.8:1. Benchmark: 3:1 is the minimum threshold for a healthy business. Below 3:1, you are spending too much to acquire customers relative to their value. Above 5:1, you may be under-investing in growth.

**Sales cycle length.** The time from first touch to closed deal. Track this by segment and channel. Self-serve signups close in 1 to 14 days. SMB sales-assisted deals close in 14 to 45 days. Mid-market deals close in 30 to 90 days. Enterprise deals close in 90 to 365 days. A lengthening sales cycle is an early indicator of market fit problems or competitive pressure.

## Retention and Churn Metrics

Retention is the engine of SaaS. Improving retention by even 1% has cascading effects across all other metrics.

**Logo churn rate.** The percentage of customers who cancel in a given period. Formula: number of customers who churned in the month divided by total customers at the start of the month. Benchmark: monthly logo churn under 3% for SMB SaaS, under 1% for mid-market, and under 0.5% for enterprise. If your monthly logo churn exceeds 5%, growth is nearly impossible because you are refilling a leaky bucket.

**Revenue churn rate (gross).** The percentage of MRR lost to cancellations and downgrades. This is more important than logo churn because it weights the impact by revenue. Losing one $5,000/month enterprise customer hurts more than losing ten $50/month SMB customers, even though the logo count is different.

**Net Revenue Retention (NRR).** The most powerful SaaS metric. NRR measures what happens to a cohort of customers' revenue over time, including expansion. Formula: (Starting MRR + Expansion MRR - Contraction MRR - Churned MRR) / Starting MRR, for a defined cohort over a defined period (usually 12 months).

NRR above 100% means your existing customers are generating more revenue over time even without new customer acquisition. Benchmark: NRR above 100% is the minimum for a healthy SaaS business. Above 110% is good. Above 120% is excellent and indicates strong product-market fit with expansion potential. Best-in-class public SaaS companies (Snowflake, Datadog, Twilio) have achieved NRR above 130%.

**Cohort retention analysis.** Track retention by monthly signup cohort. A healthy SaaS product shows cohorts flattening after 3 to 6 months: initial churn occurs as poor-fit customers leave, then retention stabilizes. If cohorts continue declining after 6 months, you have a product value problem, not an onboarding problem. Plot cohort curves monthly and look for changes: improving cohorts indicate product improvements are working; deteriorating cohorts indicate emerging problems.

## Engagement and Product Health Metrics

Financial metrics are lagging indicators. Engagement metrics are leading indicators that predict future churn and expansion.

**Daily Active Users / Monthly Active Users (DAU/MAU).** The ratio indicates engagement frequency. A DAU/MAU ratio of 50% means the average user engages every other day, which is excellent for most B2B SaaS products. A ratio below 15% suggests your product is used infrequently, which correlates with higher churn risk. Track this at the account level for B2B (at least one user from the account active) rather than individual user level.

**Feature adoption rate.** For each key feature, measure the percentage of active accounts that have used it at least once and the percentage that use it regularly (weekly or monthly, depending on the feature). Low adoption of a high-value feature indicates a discovery or usability problem. High adoption of a feature you considered minor reveals unmet needs you should invest in.

**Time to value (TTV).** The time from account creation to the moment the user experiences the core value proposition. For a project management tool, this might be "created a project and assigned a task." For an analytics product, it might be "connected a data source and viewed a dashboard." Measure TTV and optimize aggressively. Every day of delay between signup and first value is a day the customer might abandon. Benchmark: TTV under 24 hours for self-serve products, under 7 days for sales-assisted products.

**Health score.** Combine multiple engagement signals into a single account health score: login frequency, feature breadth (how many features they use), depth of usage (volume of core actions), support ticket frequency and sentiment, contract renewal date proximity, and champion engagement (whether your internal advocate is still active). Weight these signals based on correlation with historical churn. Flag accounts below a threshold for proactive outreach.

## Financial Efficiency Metrics for Fundraising

Investors use specific metrics to evaluate SaaS businesses. Knowing these metrics and their benchmarks prepares you for fundraising conversations.

**Gross margin.** Revenue minus cost of goods sold (COGS) divided by revenue. For SaaS, COGS includes hosting costs, third-party software costs that scale with customers, and customer support and success team costs. Benchmark: SaaS gross margins should be 70% to 85%. Below 70% suggests infrastructure inefficiency or over-investment in support. Above 85% is typically self-serve with minimal support costs.

**Burn multiple.** Net burn divided by net new ARR. If you burn $500,000 in a quarter and add $200,000 in net new ARR, your burn multiple is 2.5x. Benchmark: under 1.5x is capital-efficient. Between 1.5x and 2.5x is acceptable in growth mode. Above 3x is a warning sign that growth is too expensive. Investors increasingly favor capital efficiency, and burn multiple is the metric they use to evaluate it.

**Rule of 40.** Revenue growth rate plus profit margin (or minus burn rate as a percentage of revenue) should exceed 40%. A company growing at 50% year-over-year with a -15% profit margin scores 35, which is close but below the threshold. A company growing at 30% with a 15% profit margin scores 45, which clears the bar. This metric is most relevant for companies above $10M ARR. Below that, prioritize growth rate.

**Magic Number.** Net new ARR in a quarter divided by sales and marketing spend in the prior quarter. This measures the efficiency of your go-to-market spend with a one-quarter lag (acknowledging that marketing spend takes time to convert). Benchmark: above 0.75 is efficient. Above 1.0 is highly efficient and means you should invest more in sales and marketing. Below 0.5 means your go-to-market engine needs fixing before you scale spending.

**Quick ratio.** (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR). This ratio measures your growth efficiency relative to revenue loss. Benchmark: above 4.0 is healthy growth. Between 2.0 and 4.0 is acceptable. Below 2.0 means churn is consuming too much of your growth. A quick ratio of 1.0 means you are running in place: every dollar of new revenue is offset by a dollar of lost revenue.

---

Metrics are only useful if you act on them. Set up a dashboard that surfaces these numbers weekly, establish benchmarks for your stage and segment, and create alert thresholds that trigger investigation when numbers move outside expected ranges. If you need help building a SaaS analytics infrastructure or want to discuss which metrics matter most for your specific stage, [reach out to our team](/contact.html).
