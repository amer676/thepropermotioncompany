# Building a Product Analytics Stack That Drives Decisions

Most companies have analytics. Few companies have analytics that drive decisions. The difference is not a tool problem --- it is an architecture and culture problem. A team with a $0 analytics budget and a clear measurement framework will learn faster than a team spending $50,000 per year on tools they barely use.

This guide covers how to build a product analytics stack from the ground up: what to track, how to structure your data, which tools to use at each stage of growth, and how to turn raw numbers into actions that improve your product.

## Defining Your Measurement Framework Before Choosing Tools

The most common mistake is starting with a tool. "Let's install Mixpanel" is not a strategy. A strategy starts with three questions:

**What is the core action?** Every product has one action that most directly represents value delivery. For a marketplace, it is a completed transaction. For a project management tool, it is a task moved to "done." For a media product, it is content consumed for a meaningful duration. Identify this action and make it the foundation of your measurement framework.

**What is the activation sequence?** The series of steps a new user takes from first visit to completing the core action for the first time. Map each step, name it clearly, and define the event that represents its completion. A typical activation sequence might be: Visit landing page > Start signup > Complete signup > Create first project > Invite team member > Complete first task. Each transition between steps is a conversion rate you will optimize.

**What are the leading indicators of retention?** Among users who stay for months, what behaviors did they exhibit in their first week? This requires retrospective analysis once you have data, but you can hypothesize at the start. For a collaboration tool, the leading indicator might be "invited at least 2 team members within 3 days." For a data tool, it might be "created at least 1 saved report." These become your "north star" activation metrics.

Document this framework in a single page: the core action, the activation sequence with events at each step, and your hypothesized retention predictors. This document drives every analytics implementation decision that follows.

## Event Taxonomy: The Foundation Nobody Gets Right

Raw event data is only useful if it is consistent, well-named, and well-structured. An event taxonomy is the naming convention and schema that every tracked event follows.

We use a subject-verb-object pattern:

- `user.signed_up` (not "signup" or "SignUp" or "registration_complete")
- `project.created` (not "new_project" or "create-project")
- `task.completed` (not "task_done" or "complete_task")
- `invoice.sent` (not "send_invoice" or "InvoiceSent")

Every event includes a standard set of properties:

- **User properties:** user_id, account_id, plan_type, signup_date, role
- **Session properties:** session_id, referral_source, device_type, browser
- **Event-specific properties:** For `project.created`, include project_type, template_used, team_size. For `invoice.sent`, include amount, currency, recipient_count.

Store the taxonomy in a tracking plan --- a spreadsheet or structured document that lists every event, its trigger condition, required properties, and the team responsible for its implementation. Tools like Avo or Amplitude's Taxonomy feature formalize this, but a well-maintained spreadsheet works for teams with fewer than 50 events.

The tracking plan is a living document. Every new feature ships with updated tracking plan entries. Every analytics question that cannot be answered identifies a missing event. Review the tracking plan quarterly and prune events that no one queries.

## The Three-Layer Analytics Architecture

A production analytics stack has three layers, each serving a different audience and purpose:

**Layer 1: Real-time product instrumentation.** This is the event stream flowing from your application to your analytics platform. Every user action that matters is captured as a structured event and sent to a collection endpoint. Implementation options:

- **Client-side tracking** (JavaScript SDK in the browser, mobile SDK in the app) captures UI interactions: button clicks, page views, form submissions. Advantage: captures user intent even when the server is not involved. Disadvantage: ad blockers, browser restrictions, and client-side bugs can cause data loss.
- **Server-side tracking** (API calls from your backend) captures business events: purchases completed, subscriptions activated, emails sent. Advantage: reliable, not affected by ad blockers, captures events the client does not see. Disadvantage: does not capture client-only interactions.
- **Best practice: use both.** Client-side for engagement events (page views, clicks, scrolls), server-side for transactional events (purchases, signups, API calls). Deduplicate using a shared event ID.

**Layer 2: Data warehouse and transformation.** Raw events flow into a data warehouse (BigQuery, Snowflake, or PostgreSQL for smaller volumes) where they are transformed into analytical models. This is where you build:

- **User profiles:** Aggregated view of each user's behavior --- total sessions, features used, last active date, lifetime value.
- **Funnel tables:** Pre-computed conversion rates for each step of the activation sequence, segmented by cohort, acquisition channel, and plan type.
- **Retention cohorts:** For each weekly or monthly signup cohort, the percentage still active at week 1, week 4, week 8, week 12.

Transformation tools like dbt (data build tool) let you define these models as SQL with version control, testing, and documentation. A dbt model that computes weekly retention cohorts runs daily and produces a table that any BI tool can query.

**Layer 3: Visualization and exploration.** Dashboards and ad-hoc query tools that make the data accessible to non-technical team members. Options by stage:

- **Early stage (under 1,000 users):** PostHog (open-source, self-hostable) or Amplitude's free tier. Both provide funnels, retention charts, and user paths out of the box. Cost: $0 to $100/month.
- **Growth stage (1,000 to 50,000 users):** Amplitude, Mixpanel, or PostHog Cloud. Add a BI tool like Metabase (open-source) or Looker for warehouse-connected dashboards. Cost: $500 to $3,000/month.
- **Scale stage (50,000+ users):** Full warehouse-centric stack with Snowflake/BigQuery, dbt for transformation, and Looker or Tableau for visualization. The analytics platform becomes a query layer for exploration, not the source of truth. Cost: $3,000 to $15,000/month.

## Five Dashboards Every Product Team Needs

Dashboards should be opinionated. A dashboard that shows 40 metrics shows zero insights. Build exactly five dashboards, each answering one question:

**1. Acquisition Dashboard: "Where are new users coming from?"**
Metrics: daily/weekly signups, signups by channel (organic, paid, referral, direct), cost per signup by channel, signup-to-activation conversion rate by channel. This dashboard tells you which channels are working and which are wasting money.

**2. Activation Dashboard: "Are new users finding value?"**
Metrics: step-by-step conversion through the activation funnel, time-to-activation (median and 90th percentile), activation rate by cohort week. The activation rate is arguably the single most important metric for a growing product. If it is improving week over week, you are on the right track.

**3. Engagement Dashboard: "How deeply are users using the product?"**
Metrics: DAU/WAU/MAU, DAU/MAU ratio (a ratio above 0.25 indicates strong daily habit formation), feature adoption rates (percentage of active users who used each feature in the past 7 days), sessions per user per week. This dashboard identifies which features drive engagement and which are ignored.

**4. Retention Dashboard: "Are users coming back?"**
Metrics: retention curves by weekly cohort (the classic retention chart), churn rate by plan type, reactivation rate (formerly churned users who return). The shape of the retention curve tells you whether you have product-market fit. A curve that flattens above 20 percent (B2C) or 40 percent (B2B) indicates a retainable product.

**5. Revenue Dashboard: "Is the business working?"**
Metrics: MRR, MRR growth rate, average revenue per user, expansion revenue (upgrades), contraction revenue (downgrades), net revenue retention. For B2B SaaS, net revenue retention above 110 percent means your existing customers are growing faster than they are churning --- the hallmark of a healthy business.

## From Data to Decisions: The Weekly Analytics Review

Data does not drive decisions by existing. It drives decisions through a structured review process. We recommend a 30-minute weekly analytics review with the product team:

1. **Review the five dashboards** (5 minutes). Look for week-over-week changes greater than 10 percent in any key metric. Ignore small fluctuations.
2. **Investigate anomalies** (10 minutes). If activation rate dropped 15 percent, dig in. Did a specific step in the funnel break? Did a new acquisition channel bring lower-quality traffic? Did a deploy introduce a bug?
3. **Review experiment results** (10 minutes). If you ran an A/B test on the onboarding flow, review the results. Was the difference statistically significant? What is the next experiment?
4. **Set next week's analytics priority** (5 minutes). One specific question to answer with data. "Why do users who sign up on mobile have 40 percent lower activation?" or "Which feature usage in week 1 best predicts retention at week 8?"

This ritual, more than any tool or technology, is what turns analytics from a passive reporting function into an active decision-making engine.

## Common Pitfalls and How to Avoid Them

**Tracking everything, analyzing nothing.** More events are not better. Every event you track creates maintenance burden and noise. Track what you will act on. Delete the rest.

**Vanity metrics.** Total signups, page views, and app downloads tell you almost nothing about product health. Focus on rate metrics (conversion rates, retention rates) and per-user metrics (sessions per user, revenue per user).

**Insufficient sample size.** Do not draw conclusions from 50 users. Statistical significance matters. For A/B tests, use a sample size calculator before starting the experiment. For retention analysis, wait until a cohort has at least 100 users before treating its retention curve as signal.

**Ignoring qualitative data.** Analytics tells you what users do. It does not tell you why. Pair every quantitative finding with qualitative investigation: user interviews, session recordings, support ticket analysis. The most actionable insights emerge at the intersection of what and why.

---

If you need help building an analytics stack that turns data into product decisions, [reach out to The Proper Motion Company](/contact.html). We build measurement systems that product teams actually use.
