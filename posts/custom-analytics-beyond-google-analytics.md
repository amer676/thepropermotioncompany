# Custom Analytics Beyond Google Analytics

Google Analytics tells you how many people visited your website. It tells you where they came from, what pages they viewed, and how long they stayed. For a marketing site, that is often enough. But for a software product, a marketplace, a SaaS platform, or any business where the interesting behavior happens after login, Google Analytics is the wrong tool. Building a custom analytics platform tailored to your business lets you answer the questions that actually drive revenue, retention, and operational efficiency.

## Where Google Analytics Falls Short

Google Analytics was designed for content websites. Its data model revolves around pageviews and sessions, concepts that map poorly to modern web applications. When a user interacts with a dashboard, submits a form through multiple steps, or uses a feature that never triggers a page navigation, GA either misses the interaction or requires awkward workarounds to capture it.

GA4 improved on this with an event-based model, but the limitations remain substantial. Custom event properties are capped at 25 per event. You get 50 custom dimensions and 50 custom metrics per property. For a simple SaaS product, that might suffice. For a logistics platform tracking shipment states, driver behavior, route efficiency, and customer interactions, you will hit those limits in the first month.

Data freshness is another gap. GA4 standard reports can lag by 24 to 48 hours. For an operations team monitoring real-time platform health, or a marketplace watching supply-demand balance, that delay is unacceptable.

Then there is data ownership. GA data lives on Google's servers, processed by Google's pipeline, subject to Google's sampling rules. When your dataset is large, GA4 samples the data, meaning your reports are approximations rather than exact counts. For financial reporting or compliance-sensitive analytics, approximations are not acceptable. Furthermore, linking GA data to your internal user records requires careful identity resolution that GA was not built to support.

Privacy regulations add another dimension. GA has faced legal challenges under GDPR in multiple European countries. Several EU data protection authorities have ruled that transferring user data to Google's US servers violates GDPR. If your product serves European users, relying on GA introduces regulatory risk that a self-hosted analytics stack avoids.

## Designing Your Event Taxonomy

The foundation of any custom analytics system is the event taxonomy: the structured vocabulary of user actions and system events that you capture. Get this right and every downstream analysis becomes straightforward. Get it wrong and you spend months retrofitting your tracking.

Start by mapping your product's core user journeys. For a B2B SaaS product, these might include: signup and onboarding, first value moment, feature adoption, collaboration (inviting teammates), billing and plan changes, and churn. Each journey contains specific events. The signup journey might include: form_started, form_completed, email_verified, onboarding_step_completed (with a step property), and first_project_created.

Follow a consistent naming convention. We recommend the object_action pattern: project_created, invoice_paid, report_exported, team_member_invited. This reads naturally, sorts well, and scales without ambiguity. Avoid vague names like "click" or "action" that require looking at properties to understand what happened.

Every event should carry a standard set of properties: user_id, timestamp, session_id, platform (web, iOS, Android), and app_version. Beyond that, each event gets properties specific to its context. A report_exported event might include report_type, row_count, format (CSV, PDF), and time_to_generate_ms.

Document the taxonomy in a shared schema file, ideally a JSON Schema or Protocol Buffer definition that both the engineering team and the analytics team reference. This prevents drift between what engineers instrument and what analysts expect to query.

## Building the Data Pipeline

A custom analytics pipeline has four stages: collection, transport, storage, and query.

For collection, instrument your application to emit events. On the web, a lightweight JavaScript SDK that batches events and sends them to your collection endpoint every few seconds works well. On mobile, use a similar pattern with local persistence to handle offline scenarios. The collection endpoint should be simple: accept a JSON array of events, validate the schema, and acknowledge receipt. Keep the endpoint fast by doing minimal processing synchronously.

For transport, a message queue decouples collection from processing. Apache Kafka is the standard for high-volume pipelines, handling millions of events per second with configurable retention. For smaller-scale systems, Amazon SQS or Google Cloud Pub/Sub offer managed alternatives with less operational overhead. The queue provides durability (events are not lost if a downstream component fails) and back-pressure handling (spikes in event volume do not crash the processing layer).

For storage, the choice depends on your query patterns. If you primarily need aggregated metrics (daily active users, feature adoption rates, conversion funnels), a columnar database like ClickHouse or BigQuery excels. ClickHouse is open-source and can run on your own infrastructure, processing billions of rows in seconds on modest hardware. BigQuery is fully managed and charges per query, which works well for intermittent analytical workloads.

If you need to query individual user timelines (show me everything user X did in the last 30 days), add a row-oriented store or use ClickHouse with appropriate indexing. For real-time dashboards, a time-series database like TimescaleDB or InfluxDB provides sub-second query performance on recent data.

For the query layer, build internal APIs that serve pre-defined metrics to your dashboards, and provide a SQL interface (through ClickHouse's native SQL support or a tool like Apache Superset) for ad-hoc exploration by analysts.

## Funnel Analysis and Cohort Tracking

Two analytics patterns that GA handles poorly and custom systems handle well are funnel analysis and cohort tracking.

Funnel analysis measures how users progress through a sequence of steps, identifying where they drop off. GA4 supports basic funnels, but custom funnels let you define flexible step criteria, time windows between steps, and segment by any property. For example: show me the conversion rate from trial_started to subscription_created, where the user completed at least three project_created events in between, within 14 days, segmented by acquisition channel.

In ClickHouse, a funnel query uses the windowFunnel function, which takes a time window and a sequence of conditions and returns the furthest step each user reached. This runs in seconds over millions of users and can be parameterized for interactive exploration.

Cohort tracking groups users by a shared characteristic, typically their signup week, and measures a metric over time. The classic retention cohort shows what percentage of users who signed up in week 1 are still active in weeks 2, 3, 4, and so on. A custom system lets you define cohorts by any event (not just signup) and measure any metric (not just retention).

For a marketplace, you might cohort sellers by their first_listing_created week and track gross_merchandise_volume per cohort over time. This reveals whether newer sellers are ramping faster than older cohorts did, which is a leading indicator of marketplace health.

## Real-Time Operational Analytics

For platforms where latency matters, custom analytics enables real-time operational visibility that GA cannot provide. A food delivery service needs to know, right now, how many orders are in each state, what the average delivery time is over the last hour, and whether any geographic areas are experiencing driver shortages.

The architecture for real-time analytics extends the event pipeline with a stream processing layer. Apache Flink, Apache Kafka Streams, or even a simple consumer that maintains in-memory aggregations can compute rolling metrics and push them to a dashboard via WebSocket connections.

The key design decision is the granularity of real-time versus batch. Not everything needs to be real-time. Compute metrics that drive immediate action (current order backlog, active driver count, error rates) in real time. Compute metrics that inform strategy (weekly retention, monthly revenue, feature adoption trends) in batch on a daily or hourly schedule. Mixing the two in a Lambda architecture, where a real-time layer provides approximate current values and a batch layer provides exact historical values, balances freshness with accuracy and cost.

## Cost Comparison and Build-Versus-Buy

The economics of custom analytics depend on event volume and team size. Managed analytics platforms like Mixpanel, Amplitude, and Heap charge based on tracked users or events. Mixpanel's Growth plan, for example, costs roughly $20 per month per million events. At 100 million events per month, that is $2,000 per month or $24,000 per year.

A self-hosted ClickHouse instance on a cloud provider can handle 100 million events per month on a machine costing $300 to $500 per month, including storage. The tradeoff is operational overhead: you manage the infrastructure, handle upgrades, and build the query interfaces yourself.

The real cost of custom analytics is not infrastructure but engineering time. Building and maintaining a robust event pipeline, instrumentation SDK, and query interface requires dedicated effort. For companies with fewer than 50,000 monthly active users, a managed tool like Mixpanel or PostHog (which offers a self-hosted option) is usually the right starting point. For companies with complex event models, high volumes, or specific compliance requirements, the investment in custom infrastructure pays for itself.

A hybrid approach often works well: use a managed tool for product analytics (funnels, retention, feature adoption) while building custom pipelines for operational analytics that require real-time data, custom aggregations, or integration with internal systems.

---

If you need analytics that go beyond pageview counts and actually reflect how your business operates, [let's have a conversation](/contact.html). We build custom analytics platforms that answer the questions your off-the-shelf tools cannot.
