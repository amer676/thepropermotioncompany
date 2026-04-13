# Building Audit Logs for Compliance and Security

Every business application eventually faces the same question: "Who did what, and when?" Whether it comes from an auditor reviewing your SOC 2 controls, a customer disputing a charge, or your own engineering team debugging a production incident, the answer lives in your audit logs. Yet most teams treat audit logging as an afterthought, bolting it on months after launch with inconsistent coverage and questionable reliability.

A well-designed audit log system does more than satisfy compliance checkboxes. It becomes a foundational layer of trust for your entire platform, giving operators visibility, customers confidence, and regulators the evidence trail they require.

## What Belongs in an Audit Log (and What Does Not)

The first design decision is scoping. Not every database write deserves an audit entry. Logging too much creates noise that makes genuine investigations harder and inflates storage costs. Logging too little leaves gaps that auditors will flag.

Focus on state-changing operations that affect business-critical resources: user account creation and deletion, permission changes, financial transactions, data exports, configuration modifications, and authentication events (successful logins, failed attempts, password resets). A practical rule of thumb is to ask whether a compliance officer or a customer would reasonably want to know this happened. If yes, log it.

Exclude high-frequency, low-impact reads like dashboard page views or autocomplete searches. These belong in observability systems like application performance monitoring (APM) tools, not in your compliance audit trail. Similarly, internal system-to-system calls that are purely mechanical (health checks, cache refreshes) typically do not need audit entries unless they modify user-facing data.

Each audit entry should capture a consistent set of fields:

- **Event timestamp** in UTC with millisecond precision
- **Actor identity** (user ID, service account, or API key identifier)
- **Action performed** (a stable, machine-readable verb like `user.role.updated`)
- **Target resource** (type and ID of the affected object)
- **Before and after state** (the specific fields that changed)
- **Request metadata** (IP address, user agent, session ID, request ID)
- **Outcome** (success or failure, with error codes if applicable)

Including the before-and-after diff is what separates a useful audit log from a glorified access log. When an auditor asks "What permissions did this user have before the change on March 12th?", you need the previous state, not just a record that something changed.


> Related: [The AI Technology Stack: Models, Frameworks, and Infrastructure Guide](/blog/the-ai-technology-stack-models-frameworks-and-infrastructure-guide/)


## Choosing an Immutability Strategy

Audit logs must be tamper-evident. If an attacker or a rogue insider can silently modify log entries, the entire system loses its evidentiary value. There are several approaches to achieving immutability, each with different tradeoffs.

**Append-only database tables** are the simplest starting point. Use a table with no UPDATE or DELETE permissions granted to the application's database role. The application can INSERT but never modify existing rows. This is enforced at the database permission level, not just application logic. On PostgreSQL, you can create a dedicated `audit` schema with a restricted role that has only INSERT and SELECT privileges.

**Write-once object storage** provides stronger guarantees. Services like Amazon S3 with Object Lock in compliance mode prevent deletion even by the root account for a configured retention period. Batch your audit entries into files (one per minute or per 10,000 events) and write them to a locked bucket. This gives you an off-database backup that is genuinely immutable at the infrastructure layer.

**Hash chaining** adds cryptographic tamper evidence. Each audit entry includes a hash of its own content combined with the hash of the previous entry, creating a chain similar to a blockchain. If any entry is altered or deleted, the chain breaks and the tampering is detectable. This is especially valuable for on-premises deployments where you cannot rely on cloud provider immutability features. Implementing this adds roughly 50-100 microseconds per entry, which is negligible for most workloads.

For most SaaS applications, the combination of append-only database tables for operational queries plus periodic exports to write-once object storage provides a strong balance of usability and compliance.

## Designing the Data Pipeline

Audit log ingestion needs to be reliable without becoming a bottleneck for your primary application. The worst outcome is a failed audit log write causing a user-facing transaction to fail. The second worst outcome is silently dropping log entries.

The recommended pattern is **asynchronous, at-least-once delivery**. When your application completes a state-changing operation, it publishes an audit event to a durable message queue (Amazon SQS, RabbitMQ, or a Kafka topic). A separate consumer process reads from the queue and writes to the audit log store. This decouples the write path so that temporary audit store outages do not block user operations.

Use transactional outbox if you need stronger guarantees. Write the audit event to an outbox table in the same database transaction as the business operation. A polling process or change data capture (CDC) pipeline then reads from the outbox and forwards events to the audit store. This ensures that if the business transaction commits, the audit event is guaranteed to be published eventually.

For most applications handling under 10,000 audit events per minute, a simple queue-based pipeline with a consumer writing to PostgreSQL is sufficient. At higher volumes, consider partitioning by tenant or resource type, and writing to a columnar store like ClickHouse or BigQuery for efficient querying.

Retention periods depend on your compliance requirements. SOC 2 typically expects at least one year. HIPAA requires six years. Financial regulations may demand seven years or longer. Design your storage tiers accordingly: hot storage in your primary database for the most recent 90 days, warm storage in a cheaper database or object storage for 90 days to two years, and cold storage in glacier-class object storage beyond that.


> See also: [SOC 2 Compliance for SaaS Development](/blog/soc-2-compliance-for-saas-development/)


## Building a Useful Query Interface

An audit log that exists but cannot be searched is almost as useless as no audit log at all. Auditors and support teams need to answer specific questions quickly:

- "Show me all changes to user account X in the last 30 days."
- "Who modified this configuration setting and when?"
- "List all failed login attempts from this IP address range."
- "What data exports were performed by employees in Q3?"

Build your query interface around the common access patterns. Index on actor ID, target resource (type + ID), action type, timestamp, and outcome. A composite index on `(target_resource_type, target_resource_id, created_at)` covers the most frequent query pattern.

Provide both a programmatic API and a UI for audit log access. The API enables automated compliance reporting and integration with SIEM (Security Information and Event Management) tools. The UI serves support agents and administrators who need to investigate specific incidents.

Implement filtering, pagination, and export capabilities. Auditors routinely request CSV or JSON exports of log entries for specific date ranges. Make this a first-class feature rather than something that requires a developer to run a database query.

Access to the audit log itself should be audited. Log who queries the audit system, when, and what filters they used. This meta-auditing is a common SOC 2 requirement and prevents the scenario where someone queries the audit log to identify evidence they want to cover up.

## Handling Multi-Tenant and Distributed Systems

In multi-tenant SaaS applications, audit log isolation is critical. Tenant A must never see Tenant B's audit entries, even through timing attacks or error messages. Enforce tenant isolation at the query layer by always including the tenant ID in every query predicate. Consider using PostgreSQL Row-Level Security (RLS) policies as a defense-in-depth measure.

For distributed systems with multiple services, standardize your audit event schema across all services. Publish a shared protobuf or JSON Schema definition that every service must conform to. Include a correlation ID that links related audit entries across services. When a single user action triggers changes in three microservices, the correlation ID lets you reconstruct the full picture.

Clock synchronization matters when you are correlating events across services. Use NTP with sub-millisecond accuracy, and always store timestamps in UTC. If you are operating across multiple regions, be explicit about which region processed the event.

Centralize your audit log storage even if your services are distributed. Running separate audit stores per service creates silos that are painful to query during investigations. Route all audit events through a central pipeline to a single store, tagged with the originating service.

## Testing and Validating Your Audit System

Audit logging is one of the few systems where you cannot afford to discover bugs during an actual audit. Build automated tests that verify:

1. **Coverage**: Every state-changing API endpoint produces an audit entry. Write integration tests that perform each operation and assert the corresponding audit event exists with the correct fields.

2. **Completeness**: The before-and-after state in each entry accurately reflects the actual database change. Compare the audit entry's diff against a direct database query.

3. **Immutability**: Attempt to UPDATE and DELETE audit entries using the application's database credentials and verify these operations are denied.

4. **Reliability**: Simulate audit store outages and verify that events are queued and delivered once the store recovers, with no data loss.

5. **Retention**: Verify that your archival and deletion pipelines correctly move data between storage tiers at the configured thresholds.

Run a quarterly self-audit where you select 20 random operations from your application logs and verify that each one has a corresponding, accurate audit entry. This process catches drift between your application code and audit instrumentation before an external auditor does.

Document your audit log schema, retention policies, and access controls in a runbook. When the auditor arrives, having clear documentation of how the system works, what it captures, and how integrity is ensured will accelerate the review dramatically.

---

Building a reliable audit log system is a meaningful investment, but it pays dividends across compliance, security, and operational confidence. If you are building a platform that handles sensitive data or operates in a regulated industry and need guidance on designing your audit infrastructure, [get in touch with our team](/contact.html). We help companies build compliant, production-grade systems that hold up under scrutiny.
