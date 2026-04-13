# How to Plan and Execute a Software Migration

Every software migration is two projects pretending to be one. The first project is technical: moving data, rewriting integrations, rebuilding features on a new platform. The second project is organizational: convincing people to change their workflows, managing the fear of data loss, maintaining business continuity during the transition, and keeping stakeholders calm when the timeline slips. Most teams plan for the first project and get blindsided by the second.

We have migrated Rails monoliths to microservices, legacy .NET applications to modern web stacks, on-premise databases to cloud-hosted systems, and homegrown tools to commercial platforms. The technical specifics vary enormously. The patterns of what goes wrong are remarkably consistent.

## Mapping the Existing System Before You Touch Anything

The migration plan cannot be better than your understanding of the existing system, and that understanding is almost always worse than you think. Documentation is out of date. The developer who built the original system left three years ago. There are features that nobody remembers building but that a specific customer depends on every Tuesday.

Before writing a single line of migration code, conduct a system audit that answers: What data is stored, where is it stored, and what are the relationships between entities? What integrations exist — APIs, file imports/exports, database links, email triggers, webhook subscriptions? What are the actual usage patterns — which features are used daily, which are used quarterly, which have not been accessed in a year? What are the undocumented business rules embedded in the code — the if-else branches that encode domain knowledge nobody wrote down?

For data mapping, start with the database schema but do not stop there. Export a sample of production data (anonymized if necessary) and examine it for patterns the schema does not capture: nullable columns that are always populated, VARCHAR fields that always contain integers, foreign keys that reference soft-deleted records, and timestamp columns in ambiguous time zones. Every one of these is a potential migration bug.

For integration mapping, trace every inbound and outbound data flow. The inbound flows are easier — search for API endpoints, webhook receivers, file import jobs, and database write operations. The outbound flows are harder because they might be triggered asynchronously: a cron job that generates a report and emails it to a distribution list, a webhook that fires when a record changes, an API call to a third-party system buried in a callback. Miss one of these, and the new system silently stops sending data that someone depends on.

Tools that help: database schema visualization tools like SchemaSpy or DBeaver, application performance monitoring (APM) tools like Datadog or New Relic that can map service dependencies, and network traffic analysis to discover integrations that are not documented in the codebase.


> Related: [Next.js for Business Applications: Why We Choose It](/blog/nextjs-for-business-applications-why-we-choose-it/)


## The Strangler Fig Pattern and Incremental Migration

The highest-risk approach to migration is the big bang: build the new system in parallel, flip a switch on a Saturday night, and hope everything works Monday morning. This approach maximizes the blast radius of any problem and gives you the least ability to detect and recover from issues.

The strangler fig pattern — named after the tropical tree that gradually envelops and replaces its host — is the lower-risk alternative. Instead of replacing the entire system at once, you incrementally route traffic from the old system to the new system, one feature or one data domain at a time. The old system continues running throughout the migration, handling everything the new system has not yet absorbed.

The implementation requires a routing layer that can direct requests to either system based on the feature being accessed. This might be a reverse proxy (Nginx, Cloudflare Workers, or an API gateway like Kong) that routes specific URL paths to the new system while everything else continues to hit the old system. For database migrations, this often means a period of dual-writes: every write operation updates both the old and new databases, allowing you to verify data consistency before cutting over reads.

A concrete example: migrating a customer management module from a legacy system. Phase 1: set up the new database schema and a sync process that copies existing customer data. Phase 2: build the new customer management UI and API, but do not deploy it to users yet. Phase 3: deploy a feature flag that routes 5% of users to the new system while 95% stay on the old system. Phase 4: monitor error rates, data consistency, and user feedback. Phase 5: gradually increase the percentage over 2-4 weeks until 100% of users are on the new system. Phase 6: decommission the old customer management code and its database tables.

Each phase is independently reversible. If phase 3 reveals problems, you route 100% of traffic back to the old system, fix the issue, and try again. Compare this with a big bang migration where the first sign of trouble occurs with 100% of users affected and no easy rollback path.

## Data Migration: The Part Everyone Underestimates

Data migration is where migrations succeed or fail, and it is consistently the most underestimated part of the project. The technical challenge is not moving bytes from one database to another — pg_dump and pg_restore can do that in minutes. The challenge is transforming data that was modeled for one system into data that is valid and meaningful in another.

Common data migration problems:

Schema mismatches. The old system stores addresses as a single text field. The new system has structured address fields (street, city, state, ZIP). You need a parsing strategy that handles the inconsistencies in real-world address data — some entries have apartment numbers, some have P.O. boxes, some are just city and state.

Referential integrity. The old system has orphaned records — foreign keys pointing to rows that were hard-deleted. The new system has proper foreign key constraints. You need a strategy for orphans: skip them, create placeholder parent records, or relax constraints during migration and clean up afterward.

Data quality. The old system accumulated years of bad data: duplicate customer records, invalid email addresses, phone numbers in 15 different formats, dates stored as strings in locale-dependent formats. Migration is the opportunity (and the burden) to clean this up. Build validation rules into the migration pipeline and generate a report of records that fail validation for manual review.

Historical data. Not all historical data needs to migrate. If the old system has 10 years of transaction history, do you need all of it in the new system, or is 2 years sufficient with the rest archived? Moving less data reduces migration complexity and risk. Define a cutoff with stakeholders before you start.

The migration pipeline should be repeatable and idempotent. You will run it dozens of times during development — against test databases, against copies of production data, against subsets for specific testing — before the final production run. Build it as a script or a series of scripts, not as manual SQL operations. Every run should produce a summary report: records processed, records succeeded, records failed with reasons, and a list of warnings for edge cases that need review.


> See also: [How to Build a Booking and Scheduling System](/blog/how-to-build-a-booking-and-scheduling-system/)


## Cutover Planning and the Rollback Strategy

The cutover — the moment you switch users from the old system to the new system — deserves its own plan, separate from the migration plan. The cutover plan specifies: the exact sequence of operations, who is responsible for each step, what success looks like at each step, what the rollback criteria are, and how long the rollback window stays open.

For a typical cutover: freeze writes to the old system (or put it in read-only mode), run the final data migration delta (only the data that changed since the last full migration), verify data counts and checksums between old and new systems, update DNS or routing rules to point users to the new system, monitor error rates and key business metrics for the first hour, and either confirm the cutover or trigger rollback.

The rollback strategy must be tested before the real cutover. If your rollback plan is "restore the old database from a backup," you need to have actually tested restoring from backup and verified that the restored system works correctly. Untested rollback plans are not plans — they are hopes.

Define rollback criteria in advance with stakeholders. "We roll back if error rates exceed 5% for more than 15 minutes, or if any data integrity check fails, or if critical business process X cannot complete." Having these criteria agreed upon before the cutover prevents the panicked 2 AM debate about whether the issues are bad enough to justify rolling back.

## Communication and the Human Side of Migration

Tell users what is happening, when it is happening, and what they need to do. Send communications at least two weeks before any change that affects their workflow. Provide a timeline, a FAQ, and a point of contact for questions. If the new system has a different UI, provide training materials or walkthroughs in advance. If there will be downtime, schedule it for the lowest-impact window and communicate the exact times.

After the cutover, have a support plan for the first week that exceeds your normal capacity. Users will encounter unfamiliar screens, changed workflows, and minor issues that are not bugs but are different from what they are used to. A quick, empathetic response during this adjustment period determines whether users perceive the migration as an improvement or a disruption.

If you are staring down a migration and want to talk through the approach, [we have navigated this many times before](/contact.html).
