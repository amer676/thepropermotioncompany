# Why Every Software Project Needs a Technical Writer

Documentation is the most consistently underinvested area of software development. Teams will spend months building a feature and zero days documenting how it works, why it was built that way, or how to operate it. Then someone leaves, a new engineer joins, and the team spends weeks reverse-engineering their own system. The cost of poor documentation isn't visible on any dashboard, but it compounds silently until it becomes the dominant drag on engineering velocity. Technical writing -- done by someone whose actual job is making complex systems understandable -- is the fix.

## The Knowledge Bus Factor and Its Real Dollar Cost

The "bus factor" of a software system is the number of team members who, if they suddenly left, would cause critical knowledge loss. For most teams, this number is dangerously low -- often one or two people per system. When those people leave (and they will -- average tenure for software engineers is 2-3 years), the knowledge they carried walks out with them.

Quantifying this cost is revealing. When a key engineer leaves an undocumented system, the replacement engineer typically spends 3-6 months reaching productive velocity. During that ramp-up period, they're operating at roughly 30-50% of their potential output. For an engineer costing $180,000/year fully loaded, that's $45,000-$90,000 of lost productivity per departure, per key system. If your organization experiences 20-30% annual engineering turnover (which is common), you're absorbing this cost on a rolling basis.

Technical documentation directly reduces this ramp-up time. Teams with well-documented systems report new engineer productivity timelines of 4-8 weeks instead of 3-6 months. The documentation doesn't replace mentorship, but it eliminates the lowest-value parts of knowledge transfer -- "where is the config file?", "why does this service exist?", "how do we deploy to staging?" -- leaving mentorship time for the high-value stuff.

A technical writer captures knowledge proactively and systematically, rather than relying on engineers to document their own work (which they won't do consistently, because it's not what they were hired for, and it doesn't feel productive in the moment). The writer interviews engineers, reads the code, and produces documentation that would survive the departure of any individual team member.


> Related: [Agile Software Development Explained for Business Leaders](/blog/agile-software-development-explained-for-business-leaders/)


## Architecture Decision Records: Capturing the "Why"

Code tells you what the system does. Comments sometimes tell you how. Almost nothing tells you why -- why this approach was chosen over alternatives, what tradeoffs were considered, what constraints existed at the time, what we tried that didn't work.

Architecture Decision Records (ADRs) are short documents that capture each significant technical decision: the context, the decision, the alternatives considered, and the consequences. A technical writer maintains the ADR practice by: attending design discussions, drafting ADRs from the conversation, getting engineer review, and maintaining the ADR index.

A practical ADR format:

**Title:** Use PostgreSQL for the event store instead of DynamoDB
**Date:** 2025-03-15
**Status:** Accepted
**Context:** We need a durable event store for the audit logging system. Expected write volume is 500 events/second initially, growing to 5,000/second over two years. We considered PostgreSQL with partitioned tables, DynamoDB, and Apache Kafka.
**Decision:** PostgreSQL with monthly table partitioning.
**Reasoning:** Our team has deep PostgreSQL expertise. DynamoDB would introduce a new operational dependency. Kafka is overkill for our write volume. PostgreSQL partitioning handles our projected scale with room to spare, and the query flexibility of SQL makes audit retrieval straightforward.
**Consequences:** We accept the risk that if write volume exceeds projections by 10x, we'll need to migrate to a dedicated event store. We'll set up monitoring alerts at 80% of our projected capacity.

Six months later, when a new engineer asks "why aren't we using DynamoDB for events?", the answer is documented. The decision doesn't need to be re-litigated. More importantly, the context that informed the decision is preserved -- if that context changes (write volume does exceed projections by 10x), the team knows exactly when and why to revisit the decision.

## Runbooks: The Difference Between a 10-Minute Fix and a 3-Hour Outage

When production systems break at 2 AM, the person responding is often not the person who built the system. They're an on-call engineer or a junior team member who drew the short straw. Without runbooks, their response is: wake up the person who built it, wait for them to get online, and relay instructions in real time. With runbooks, they follow a documented procedure that captures the expert's knowledge in a form anyone can execute.

A runbook for a common incident should include: **symptoms** (what alerts fire, what users report), **diagnosis steps** (what to check, in what order, using what commands), **resolution steps** (exact commands or procedures, with expected outputs), **escalation criteria** (when to wake someone else up), and **post-incident tasks** (what to check after resolution, what to communicate to affected users).

Technical writers transform tribal knowledge into runbooks through a systematic process. They shadow on-call rotations, debrief after incidents, and document the implicit procedures that experienced engineers follow intuitively. The first draft is reviewed by the engineer who handled the incident. The runbook is then tested by having a different engineer follow it during the next occurrence of the same incident type.

The ROI of runbooks is measurable. Track mean time to resolution (MTTR) for incidents before and after runbook creation. We've seen teams reduce MTTR by 50-70% for documented incident types. For a business where downtime costs $10,000-100,000 per hour (depending on the application), the runbook investment pays for itself after a single faster resolution.


> See also: [Why Software Rewrites Fail and How to Do Them Right](/blog/why-software-rewrites-fail-and-how-to-do-them-right/)


## API Documentation That Developers Actually Use

If your product has an API, your API documentation is a product in itself. It's the interface between your system and every developer who integrates with it. Poorly documented APIs generate support tickets, bad integrations, and customer churn.

Engineers can generate reference documentation from code annotations and OpenAPI specs, but that's the minimum viable documentation -- the equivalent of publishing a dictionary and calling it a language course. Useful API documentation includes: conceptual guides that explain the domain model ("how invoices, payments, and credits relate to each other"), tutorials that walk through common workflows ("how to create a subscription and handle payment failures"), troubleshooting guides for common integration issues, and migration guides when the API evolves.

A technical writer produces these materials by approaching the API as an outsider -- which is exactly what integrating developers are. They go through the onboarding experience, note every point of confusion, and either fix the confusion (by suggesting API improvements) or document it (by explaining the non-obvious behavior). The fresh-eyes perspective of a non-engineer writing about engineering systems is paradoxically what makes the documentation useful to engineers.

Keep API documentation versioned alongside the API itself. Every pull request that changes API behavior should include a documentation update, and the technical writer reviews these changes for clarity and completeness. An automated check in your CI pipeline can verify that OpenAPI spec changes have corresponding documentation updates.

## Internal Documentation: Making Your Team Faster

Beyond external-facing documentation, internal docs make your engineering team more productive. The categories that deliver the most value:

**Development environment setup guides** eliminate the two-day ordeal that new engineers face when joining a project. The guide should produce a working local environment by following the steps literally, with no implicit knowledge required. Test the guide by having a non-engineer follow it. If they get stuck, the guide has a gap.

**Code architecture guides** explain the high-level structure of the codebase: what each major module does, how they interact, what patterns are used, and where to find things. This is the document you wish someone had written before you inherited the codebase. It should include a diagram of the system's major components and their relationships, updated whenever the architecture changes meaningfully.

**Process documentation** covers how the team works: how to propose a technical change, how to do a code review, how to deploy to production, how to handle a security vulnerability, how to rotate secrets. These processes exist in every team but are usually transmitted orally. Writing them down ensures consistency and reduces the burden on senior engineers who otherwise answer the same process questions repeatedly.

**Glossary of domain terms** is surprisingly valuable for business applications. When the codebase uses "order," "transaction," "purchase," and "sale" to mean overlapping but different things, a glossary that defines each term precisely prevents a class of bugs caused by conceptual confusion.

## When to Hire and What to Look For

A dedicated technical writer becomes cost-effective when your engineering team reaches 8-12 people, or when you ship a product with an external API. Below that size, assign documentation ownership to a specific engineer and allocate explicit time for it (20% of one engineer's time is a reasonable starting investment).

When hiring a technical writer for a software team, look for: ability to read code (they don't need to write production code, but they need to understand function signatures, data flows, and architecture diagrams), interviewing skill (the primary input to documentation is conversations with engineers), structured thinking (the ability to organize complex information into navigable, layered documents), and tool familiarity (Markdown, Git, docs-as-code workflows, diagramming tools).

The technical writer should sit with the engineering team, not in a separate documentation department. They should attend sprint planning, join architecture discussions, and have access to the codebase and deployment tools. Documentation that's written from the outside looking in is always less accurate than documentation written from the inside.

Measure the writer's impact: reduction in onboarding time for new engineers, reduction in repeated questions in Slack (track the questions that get answered by linking to docs), reduction in incident resolution time for documented scenarios, and reduction in support tickets for documented API behaviors. These metrics justify the investment and guide the writer's priorities.

---

If your team is feeling the pain of missing documentation -- slow onboarding, repeated questions, fragile knowledge concentration -- [let's discuss how to fix it](/contact.html). We help teams establish documentation practices that scale with the organization and prevent knowledge loss.
