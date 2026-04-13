# Database Design Mistakes That Cost Companies Thousands

A poorly designed database does not announce itself on day one. It waits until you have ten thousand users, or until a critical report takes four minutes to load, or until a developer spends three days trying to add a field that should have taken an hour. By then, the cost of fixing the problem is ten to fifty times what it would have been to get the design right from the start. These are the database architecture mistakes we see most often, why they are so expensive, and how to avoid them before they compound.

## Treating the Database as an Afterthought to Application Code

The most expensive mistake happens before a single table is created: treating database design as something that falls out of the application code rather than something that drives it. Developers spin up an ORM, define some models, run migrations, and call it done. The result is a schema that mirrors object hierarchies rather than data relationships.

Here is a concrete example. A team building an e-commerce platform defines a Product model with a `variants` JSON column because the ORM makes it easy to serialize arrays. Six months later, they need to query "show me all products available in size Large" across 50,000 products. That query now requires scanning and parsing every JSON blob in the table. The fix requires a new `product_variants` table, a data migration, and updates to every query that touches variants. Total cost: two to three weeks of engineering time plus a risky production migration.

The better approach is to spend two to four hours designing your data model on paper before writing any code. Ask three questions for every entity: What queries will run against this data? What are the relationships? What will change over time? Those questions surface the need for proper normalization, indexes, and join tables before the ORM creates technical debt.


> Related: [Privacy-First Software Development as Competitive Advantage](/blog/privacy-first-software-development-as-competitive-advantage/)


## Ignoring Indexing Until Performance Degrades

Indexes are the single most impactful performance tool in any relational database, yet they are routinely neglected. We have audited databases with hundreds of thousands of rows where not a single non-primary-key index existed. The symptoms are predictable: page loads that creep from 200ms to 2 seconds to 12 seconds as data grows.

A PostgreSQL table with 500,000 rows and no index on a frequently queried `email` column will perform a sequential scan on every lookup. Adding a B-tree index on that column reduces query time from roughly 150ms to under 1ms. That is a 150x improvement from a single line of SQL.

But indexes are not free. Each index consumes storage (typically 10-30% of the table size per index) and slows down INSERT and UPDATE operations. The key rules:

- Index every column that appears in WHERE clauses, JOIN conditions, and ORDER BY clauses of frequent queries.
- Use composite indexes for queries that filter on multiple columns. An index on `(status, created_at)` serves queries that filter on status alone or on both columns, but not queries that filter only on `created_at`.
- Monitor slow query logs weekly. PostgreSQL's `pg_stat_statements` extension and MySQL's slow query log are your best diagnostic tools.
- Remove unused indexes. They cost write performance for zero benefit. In PostgreSQL, `pg_stat_user_indexes` shows index usage statistics.

A database with thoughtful indexing from the start avoids the emergency performance triage that typically costs $5,000 to $15,000 in consulting fees and days of downtime risk.

## The Null Column Epidemic and Soft Schema Rot

Nullable columns are a reasonable tool when used deliberately. But in practice, most databases accumulate nullable columns the way attics accumulate boxes: someone adds them "just in case," nobody removes them, and eventually the schema tells you nothing about what data is actually required.

We recently audited a client's database where a `customers` table had 47 columns, 31 of which were nullable. The application code was littered with null checks, and different parts of the system assumed different columns would be populated. The `phone` column was null for 60% of records because one onboarding flow collected it and another did not. The `company_name` column was sometimes null, sometimes an empty string, and sometimes the literal text "N/A."

The fix involves several principles:

**Default to NOT NULL.** Make columns nullable only when null has a specific, documented meaning (such as "this field has not been provided yet" versus "this field does not apply").

**Use CHECK constraints.** PostgreSQL and modern MySQL support CHECK constraints that enforce data validity at the database level. `CHECK (status IN ('active', 'inactive', 'suspended'))` prevents garbage data from entering the system regardless of which application writes to the table.

**Normalize optional data into separate tables.** If only 20% of customers have a shipping address, a `customer_shipping_addresses` table is cleaner than four nullable columns on the customers table.

**Audit column usage quarterly.** Run queries to find columns that are null for more than 80% of rows. Those columns either need to be populated consistently or moved to a separate table.


> See also: [Building White-Label SaaS Platforms for Multiple Brands](/blog/building-white-label-saas-platforms-for-multiple-brands/)


## Over-Normalizing (Yes, It Is Possible)

While under-normalization creates data duplication and update anomalies, over-normalization creates its own set of problems: queries that require six or seven JOINs to assemble basic information, application code that is painfully complex for simple operations, and performance bottlenecks from excessive table lookups.

The classic example is normalizing address components into separate tables: a `streets` table, a `cities` table, a `states` table, and a `zip_codes` table, all joined through foreign keys. This is textbook-correct third normal form. It is also impractical for most applications. Addresses change infrequently, the storage savings are minimal, and every address lookup now requires four JOINs.

The pragmatic approach is to normalize to third normal form as a baseline, then selectively denormalize where read performance matters and write frequency is low. Common patterns include:

- Storing a user's `display_name` on the `orders` table alongside `user_id` to avoid joining the users table for order list views.
- Using materialized views in PostgreSQL to pre-compute complex aggregations that are queried frequently but only need to be refreshed hourly.
- Keeping audit fields (like `created_by_name`) denormalized because they capture a point-in-time value that should not change if the source record changes.

Every denormalization is a tradeoff. Document the decision and the rationale. Future developers (including your future self) will thank you.

## Choosing the Wrong Database for the Workload

Not every problem is a relational database problem, but not every problem needs a NoSQL database either. We see two common mistakes: teams choosing MongoDB because "it's more flexible" for data that is fundamentally relational, and teams forcing time-series data into PostgreSQL when purpose-built options exist.

Here is a quick decision framework:

**Relational databases (PostgreSQL, MySQL)** are the right choice for transactional data with well-defined relationships: orders, customers, products, accounts, and most business entities. If your data has foreign key relationships and you need ACID transactions, use a relational database. PostgreSQL handles JSON columns well enough for semi-structured data that does not need to be queried deeply.

**Document databases (MongoDB, DynamoDB)** excel when your data is genuinely schema-less (user-generated content, event logs with varying structures) or when you need horizontal scaling across regions. They are not a good choice for data that needs complex joins or transactional consistency across multiple documents.

**Time-series databases (TimescaleDB, InfluxDB)** are purpose-built for sensor data, metrics, and event streams where the primary query pattern is aggregation over time ranges. Forcing this data into a regular relational table leads to tables with billions of rows that are expensive to query and maintain.

**Search engines (Elasticsearch, Meilisearch)** complement your primary database for full-text search, faceted filtering, and fuzzy matching. They are not a replacement for your source-of-truth data store.

The most expensive version of this mistake is choosing a database based on what is trending on Hacker News rather than what fits the workload. Migrating a production database with millions of rows to a different engine typically costs $30,000 to $100,000 in engineering time and carries significant risk.

## Neglecting Backup Strategy and Disaster Recovery

It is not glamorous, but a missing or untested backup strategy has destroyed more businesses than any architectural mistake. We have encountered companies whose "backup strategy" consisted of nightly `pg_dump` scripts writing to the same server as the database. When the disk failed, both the database and the backups were lost.

A production-grade backup strategy includes:

- **Automated daily backups** stored in a different geographic region than your primary database. AWS RDS automated backups, Google Cloud SQL backups, or manual scripts pushing to separate cloud storage.
- **Point-in-time recovery** capability using write-ahead log (WAL) archiving in PostgreSQL or binary log replication in MySQL. This lets you restore to any moment, not just the last backup.
- **Monthly restore tests.** A backup you have never restored is not a backup. Schedule a monthly test where you restore from backup to a staging environment and verify data integrity.
- **Documented recovery procedures.** When disaster strikes, you do not have time to figure out the process. Write it down, keep it current, and make sure at least two people on the team know how to execute it.

The cost of a proper backup strategy is roughly $100-$500 per month in storage and tooling. The cost of losing your data is existential.

---

If your database is slowing down, your schema has grown unwieldy, or you are planning a new system and want to get the foundation right, we can help. [Reach out to us](/contact.html) for a database architecture review or to discuss your project's data needs.
