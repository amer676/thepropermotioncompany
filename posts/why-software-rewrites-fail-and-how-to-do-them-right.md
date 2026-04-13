# Why Software Rewrites Fail and How to Do Them Right

Few decisions in software carry more risk than a full system rewrite. Joel Spolsky called it "the single worst strategic mistake that any software company can make." Netscape's rewrite of Navigator destroyed their market position. Basecamp's HEY email launch required years longer than anticipated. Yet legacy systems do eventually become untenable, and modernization becomes unavoidable. The question isn't whether to modernize -- it's how to do it without the catastrophic outcomes that make rewrites infamous.

## The Iceberg of Undocumented Behavior

The primary reason rewrites fail is that the existing system encodes far more business logic than anyone realizes. The codebase isn't just features visible in the UI -- it's years of accumulated edge case handling, workarounds for upstream bugs, implicit data validation, timezone adjustments for specific customers, and conditional logic that exists because a critical client complained in 2019.

This behavior is undocumented because it was never formally specified. It accreted over time through bug fixes, support tickets, and hallway conversations. When you build the new system from a specification document (or worse, from the product team's memory of how the system works), you're capturing maybe 60-70% of actual behavior. The remaining 30-40% surfaces as bugs in the new system -- bugs that aren't bugs at all, but missing functionality that users depended on without anyone labeling it as a "feature."

The only reliable way to catalog this behavior is to study the existing system systematically. Read the code, yes, but also: mine the commit history for bug fixes (each one represents a behavior that was added post-launch), read through years of support tickets to understand what users actually do with the system, and interview the longest-tenured users about their workflows. This discovery process typically takes 4-8 weeks for a mid-size application and is the most valuable investment you can make before writing any new code.

## The Second System Effect and Scope Inflation

Fred Brooks identified this pattern decades ago, and it remains devastatingly accurate. When a team rewrites a system they've maintained for years, they don't just replicate it -- they try to fix everything they ever hated about it. The new system becomes a vehicle for every architectural improvement, every feature request that was too risky to add to the old system, and every "if I were building this from scratch" fantasy.

The result is a project that's not a rewrite -- it's a rewrite plus a redesign plus a re-architecture plus a feature expansion. Scope balloons. Timelines extend. The team is simultaneously learning a new technology stack, reimagining the product, and trying to maintain feature parity. Something has to give, and it's usually the timeline, the quality, or both.

Discipline requires separating modernization from improvement. Phase 1 is a faithful reproduction of existing functionality on the new stack. No new features. No UX redesign. No "while we're at it" improvements. The goal is feature parity with the existing system, verified by running the same test scenarios against both systems and getting identical results. Phase 2, after the migration is complete and stable, introduces improvements. This sequencing is emotionally difficult -- the team wants to build the better version immediately -- but it's the only approach that keeps the project on track.

Set a hard rule: any improvement idea goes on a "Phase 2" list. Review the list weekly to acknowledge it, but do not pull items into Phase 1 under any circumstances. The Phase 2 list becomes a motivational tool -- the team can see all the improvements waiting for them once migration is complete.

## The Strangler Fig Pattern: Incremental Over Big Bang

The most successful modernization strategy isn't a rewrite at all -- it's the strangler fig pattern. Named after the tropical fig that gradually envelops and replaces its host tree, this approach migrates functionality piece by piece from the old system to the new one.

The mechanics work like this: place a routing layer (a reverse proxy, an API gateway, or a load balancer with URL-based routing) in front of both the old and new systems. Initially, 100% of traffic goes to the old system. When a specific feature is rebuilt in the new system, update the routing to send traffic for that feature to the new system while everything else continues hitting the old system. Over months (or years, for large systems), the new system takes over more and more routes until the old system serves nothing and can be decommissioned.

This approach has several advantages over big-bang rewrites. **Risk is contained**: if the new version of a feature has problems, you route traffic back to the old version immediately. **Value is delivered incrementally**: each migrated feature is a deliverable that stakeholders can evaluate. **The team learns as they go**: insights from migrating early features improve the approach for later ones. **The old system continues serving users**: there's no "launch day" where everything has to work perfectly.

The technical prerequisite is a clean routing boundary. For web applications, URL-based routing is the simplest: `/reports/*` goes to the new system, everything else goes to the old system. For API-based systems, route by endpoint. For monolithic backends, the routing might need to happen at the service or module level within the application.

Data is the hard part of strangler fig migration. If the new system uses a different database schema (which it usually does), you need a data synchronization strategy during the transition period. Common approaches: the new system reads from the old database (using read replicas or database views that map old schema to new), a change data capture (CDC) pipeline mirrors relevant data from old to new, or the old and new systems share a database during transition.

## Database Migration: The Hidden Complexity Center

Schema migration is where rewrite timelines go to die. The new system invariably has a different data model -- better normalized, differently structured, with new entities that didn't exist before. Migrating data from old schema to new is a multi-step process that requires surgical precision.

**Schema mapping** comes first. For every table and column in the old database, determine: does it map to the new schema? How? What transformations are needed? What data will be lost or restructured? Document these mappings exhaustively. Common transformation patterns include: splitting a single table into multiple entities (an "orders" table that conflates orders and invoices becomes separate "orders" and "invoices" tables), merging multiple tables into one (three different "settings" tables consolidate into a unified configuration store), changing data types (string-encoded dates become proper timestamps, comma-separated lists become join tables), and handling historical data that doesn't conform to new validation rules.

**Migration scripts** should be runnable, repeatable, and verifiable. Write them as code (not manual SQL), version-control them, and run them against a copy of production data in a staging environment. After each run, validate the output against expected counts, checksums, and sample records. Build automated validation that compares the old and new systems' outputs for the same inputs -- if you ask both systems for a customer's order history and get different results, the migration has a bug.

**Cutover timing** depends on your tolerance for downtime. A maintenance window approach takes the old system offline, runs the final migration, validates, and brings the new system online. For systems that can't tolerate downtime, use a dual-write pattern: during the transition, writes go to both old and new databases. The new system is the source of truth, and a reconciliation process ensures consistency. After a confidence period, cut over reads to the new system and decommission the old database.

## Managing the Parallel Operation Period

During any modernization -- whether big-bang or incremental -- there's a period where both systems coexist. This parallel operation is operationally expensive and organizationally confusing, and minimizing its duration should be a project priority.

**Team allocation** during parallel operation is a constant tension. The old system still needs bug fixes and critical updates. The new system needs all available engineering attention. Splitting the team between both systems reduces velocity on both. The best approach we've seen: designate a small "maintenance crew" (1-2 engineers) for the old system and protect the rest of the team's focus on the new system. The maintenance crew handles only critical issues -- no new features, no non-critical improvements.

**User communication** is often neglected but critical. Users need to understand the migration timeline, what changes they'll experience, and when. For B2B products, provide a migration guide for each customer: what changes, what stays the same, what they need to do (update integrations, retrain staff, adjust workflows). Offer a preview environment where power users can test the new system before cutover. Their feedback during preview will catch issues that internal testing misses.

**Rollback planning** is non-negotiable. For every migration step, define the rollback procedure. If the new reporting module has critical bugs after launch, can you route traffic back to the old reporting module? If the data migration has integrity issues, can you revert to the old database? Rollback procedures should be tested in staging before the production migration. The confidence to move forward comes from knowing you can move backward.

Set a hard deadline for decommissioning the old system. Without one, the parallel operation period extends indefinitely as low-priority features keep getting deferred. "We'll migrate that last module next quarter" becomes "next half" becomes "next year." Publicly commit to a decommission date, and let it create the urgency to finish.

---

If you're facing a legacy system that needs modernization and want to avoid the common failure modes, [let's plan the right approach together](/contact.html). We've guided teams through incremental migrations that deliver value continuously without the risk of a big-bang rewrite.
