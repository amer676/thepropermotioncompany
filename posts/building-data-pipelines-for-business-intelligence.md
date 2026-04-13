# Building Data Pipelines for Business Intelligence

A company with data spread across twelve SaaS tools and three internal databases has plenty of information. What it lacks is intelligence. The sales numbers are in Salesforce. The marketing spend is in Google Ads and Meta. The product usage data is in a PostgreSQL database. The financial data is in QuickBooks. The customer support metrics are in Zendesk. Each tool has its own dashboard, its own export format, and its own definition of what a "customer" is.

Business intelligence requires bringing this data together, cleaning it, transforming it into a consistent shape, and making it available for analysis. That is what a data pipeline does. Building one well is the difference between a leadership team that makes decisions based on gut feelings and one that makes decisions based on evidence.

## Extraction: Getting Data Out of Source Systems

The first stage of any data pipeline is extraction -- pulling data from the systems where it originates. Each source has its own access method and its own quirks.

**API-based extraction** covers most modern SaaS tools. Salesforce, Stripe, HubSpot, Zendesk, and Google Analytics all offer REST or GraphQL APIs for data export. The practical challenges are rate limiting (Salesforce limits to 100,000 API calls per 24 hours on Enterprise plans), pagination (most APIs return 100-250 records per request, requiring sequential page fetches for large datasets), and schema changes (when the vendor adds a field or changes a data type, your extraction logic needs to handle it gracefully).

Build extraction jobs as idempotent operations that can be safely re-run. Use cursor-based pagination where available (fetching records modified since the last successful extraction) rather than offset-based pagination (which can miss or duplicate records when data changes between pages). Store the high-water mark -- the timestamp or cursor of the last successfully extracted record -- in a state table so that each run picks up where the previous one left off.

**Database replication** is the most efficient method for internal databases. PostgreSQL's logical replication streams changes (inserts, updates, deletes) to a subscriber in real time, with sub-second latency and minimal impact on the source database. For MySQL, binlog-based replication serves the same purpose. This approach is dramatically more efficient than periodic full-table exports for large tables -- instead of extracting 10 million rows every hour, you extract only the rows that changed since the last sync.

**File-based extraction** handles legacy systems, government data feeds, and partner integrations that deliver data as CSV, XML, or fixed-width files dropped into an SFTP server or S3 bucket. Build a file watcher that detects new files, validates their format (correct headers, expected column count, valid encoding), and queues them for processing. Malformed files should be quarantined and flagged for manual review, not silently skipped.

For most mid-size companies, expect to integrate 8-15 data sources. Off-the-shelf ETL tools like Fivetran, Airbyte, or Stitch handle the most common sources with pre-built connectors, reducing the extraction effort from weeks to days. Custom extraction code is necessary for proprietary internal systems or niche SaaS tools without pre-built connectors.

## Transformation: Cleaning and Shaping Data

Raw extracted data is inconsistent, duplicated, and structured for the source system's needs rather than your analytical needs. The transformation layer resolves this.

**Standardize identifiers.** Customer "Acme Corp" in Salesforce is "ACME Corporation" in Stripe and "acme-corp" in your product database. Without a canonical mapping, you cannot answer the question "How much revenue does Acme Corp generate, and how much do they use our product?" Build a master entity table that maps source-specific identifiers to a single canonical ID. This can be as simple as a manually maintained lookup table for companies or as sophisticated as a fuzzy matching algorithm for individuals.

**Normalize data types and formats.** Dates arrive as "2024-01-15", "01/15/2024", "January 15, 2024", and Unix timestamps depending on the source. Currency amounts arrive as strings ("$1,234.56"), floats (1234.56), or integers in cents (123456). Normalize everything to consistent types during transformation: ISO 8601 dates, integer amounts in cents, and UTC timestamps.

**Calculate derived metrics.** Raw data tells you that Customer X made a payment of $5,000 on January 15. Business intelligence tells you that Customer X's annual contract value is $60,000, they are in the second year of their contract, their usage has increased 23% quarter-over-quarter, and their health score (a composite of usage, support ticket frequency, and payment timeliness) is 82/100. These derived metrics are calculated during transformation by joining data from multiple sources and applying business logic.

**Handle slowly changing dimensions.** When a customer changes their plan from Basic to Pro, do you want your historical reports to show them as Basic (what they were at the time) or Pro (what they are now)? This is the slowly changing dimension problem (SCD), and the answer depends on the analytical question. SCD Type 1 overwrites the old value (simplest, but loses history). SCD Type 2 creates a new row with effective dates (preserves history, enables accurate point-in-time reporting). Choose Type 2 for any dimension that affects financial reporting or cohort analysis.

We recommend dbt (data build tool) for managing transformations. dbt lets you write transformations as SQL SELECT statements, manages dependencies between transformations automatically, runs tests to validate data quality, and generates documentation. It has become the de facto standard for the transformation layer in modern data stacks.

## Loading and Storage: The Data Warehouse

Transformed data lands in a data warehouse optimized for analytical queries. The choice of warehouse depends on data volume and budget.

**PostgreSQL** handles analytical workloads well up to about 50-100 GB of data. It is free, familiar, and already running in most environments. For early-stage BI efforts, a dedicated PostgreSQL instance with appropriate indexing and partitioning is sufficient and avoids introducing a new technology.

**Snowflake, BigQuery, or Redshift** become necessary when data volume exceeds what PostgreSQL handles efficiently, when query concurrency is high (many analysts running queries simultaneously), or when you need to separate analytical workload from transactional workload entirely. These columnar storage engines are designed for the read-heavy, aggregation-heavy query patterns typical of BI. Snowflake in particular offers pay-per-query pricing that makes it cost-effective for workloads with variable demand.

Structure the warehouse using a dimensional model. Fact tables store events and measurements (orders, payments, page views, support tickets). Dimension tables store the descriptive context around those events (customers, products, dates, geographies). This star schema pattern is optimized for the aggregation and filtering queries that BI dashboards execute: "Show me total revenue by region by month" joins the orders fact table with the customer dimension (for region) and the date dimension (for month).

## Orchestration: Making It Run Reliably

A data pipeline is only useful if it runs on schedule, handles failures gracefully, and alerts you when something goes wrong.

**Apache Airflow** is the standard orchestration tool for data pipelines. It represents your pipeline as a directed acyclic graph (DAG) of tasks: extract from Salesforce, then extract from Stripe, then run transformations, then run data quality tests, then refresh dashboards. Tasks can run in parallel where there are no dependencies. Failed tasks retry automatically with configurable backoff. The web UI shows the status of every pipeline run, with logs accessible for each task.

For simpler pipelines, a cron job calling a well-structured script is adequate. But as soon as you have inter-task dependencies, retry logic, or monitoring requirements, an orchestration tool pays for itself.

**Schedule pipelines based on business needs, not technical convenience.** If the executive team reviews dashboards every Monday morning, the pipeline should complete by Sunday night. If customer success needs real-time usage data, the product database extraction should run on a streaming or near-real-time basis while the less time-sensitive sources run daily.

**Monitor data freshness.** Set up alerts that fire when a pipeline has not completed within its expected window. If the Salesforce extraction usually completes in 8 minutes and has been running for 45 minutes, something is wrong -- the API might be rate-limited, the network might be down, or the query might be scanning an unexpectedly large dataset.

**Monitor data quality.** Run automated checks after each pipeline run: row counts should be within expected ranges (a daily extraction that returns zero rows is probably broken), key fields should not be null, amounts should not be negative (unless your business model allows it), and referential integrity should hold (every order should reference a valid customer). dbt's built-in testing framework handles these checks natively.

## From Pipeline to Dashboard

The pipeline is plumbing. The value is in the dashboards and reports that business users interact with daily.

Connect a BI tool -- Metabase (open-source, excellent for smaller teams), Looker, Tableau, or Power BI -- to the data warehouse. Build dashboards around the questions leadership actually asks: What is our monthly recurring revenue and how is it trending? Which customer segments have the highest churn rate? What is our customer acquisition cost by channel? How does product usage correlate with retention?

Each dashboard should have a defined owner, a refresh schedule, and a data dictionary explaining what each metric means and how it is calculated. "Revenue" that means gross revenue in one chart and net revenue in another creates confusion and erodes trust in the data.

Start with 3-5 core dashboards rather than building 30. A small number of well-designed, trusted dashboards drives more adoption than a sprawling collection that nobody maintains. Expand based on demand: when a department asks a question that existing dashboards cannot answer, build a new one.

---

If your data is scattered across systems and your reporting is manual, [let's talk](/contact.html) about building a pipeline that turns your data into decisions.
