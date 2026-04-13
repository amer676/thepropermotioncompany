# Build vs Buy: When to Build Internal Tools vs Subscribe to SaaS

Every growing company eventually faces the same question: should we subscribe to an off-the-shelf SaaS tool or build something custom? The answer is almost never obvious, and getting it wrong is expensive in both directions. Subscribing to a tool that does not fit your workflow wastes money on workarounds and manual processes. Building something custom when a mature SaaS product exists wastes engineering time that should be spent on your core product.

This post provides a concrete framework for making the build-vs-buy decision, with cost analysis models and criteria you can apply to your next internal tools decision.

## The True Cost of Buying SaaS

The sticker price of a SaaS subscription is only the beginning. The total cost of ownership includes several categories that teams consistently underestimate.

**Per-seat pricing at scale.** A tool that costs $15/user/month seems trivial at 10 users. At 200 users, it is $36,000/year. At 1,000 users, $180,000/year. SaaS pricing is designed to grow with your headcount, which means your costs scale linearly with team size regardless of whether the additional users extract proportional value. Audit your current SaaS stack: how many seats are actually active? Industry data from Zylo shows that 44% of SaaS licenses go unused or underutilized.

**Integration and workflow costs.** Most SaaS tools require integration with your existing systems. Connecting a CRM to your billing system, your project management tool to your deployment pipeline, or your support desk to your product analytics platform requires engineering time. Budget 2 to 6 weeks of integration work per major tool, plus ongoing maintenance when either your systems or the SaaS vendor's API changes. Some vendors charge extra for API access or premium integration tiers.

**Customization limitations.** Off-the-shelf tools serve the median customer. If your workflow diverges from the median, you end up with workarounds: spreadsheets that bridge gaps between tools, manual data entry to satisfy fields that do not map to your process, and tribal knowledge about which features to use and which to ignore. These workarounds have a real cost in team productivity, training time for new hires, and error rates. When the tool cannot accommodate a workflow change your business requires, you are stuck: migrate to a different tool or build the feature yourself.

**Vendor lock-in and data portability.** After 2 to 3 years on a platform, your data, workflows, and team habits are deeply embedded. Switching costs are enormous. Vendors know this, which is why they raise prices by 15% to 30% at renewal. The data portability story for most SaaS tools is weak: you can export a CSV, but not the relationships, automations, and configurations that represent years of setup. Factor in the cost of being locked into a vendor whose roadmap may diverge from your needs.

**Compliance and data residency.** For regulated industries (healthcare, finance, government contracting), every SaaS vendor must be evaluated for compliance. SOC 2 reports, BAA agreements for HIPAA, data residency certifications. Each vendor evaluation takes legal and security team time. And if a vendor fails an audit, you have an emergency migration on your hands.


> Related: [Building Internal Tools Your Team Will Actually Adopt](/blog/building-internal-tools-your-team-will-actually-adopt/)


## The True Cost of Building Custom

Building custom tools is not free either. Teams that choose to build frequently underestimate the ongoing cost.

**Initial development.** A simple internal CRUD tool (think: an admin dashboard for managing customer data) takes 4 to 8 weeks of engineering time. A more complex internal tool (workflow automation, reporting dashboard with custom analytics, multi-role access control) takes 10 to 20 weeks. At a fully-loaded engineering cost of $150,000 to $250,000/year per engineer, a 12-week project costs $43,000 to $72,000 in engineering time alone.

**Ongoing maintenance.** The initial build is typically 30% to 40% of the total cost over 3 years. Maintenance includes bug fixes, security updates, dependency updates, infrastructure costs, and feature requests from internal users. Budget 15% to 20% of the initial build effort per year for maintenance. A tool that costs $60,000 to build will cost an additional $27,000 to $36,000 over the following 3 years in maintenance alone.

**Opportunity cost.** Every engineer working on internal tools is not working on your product. This is the cost most teams undervalue. If your product team is capacity-constrained (and it almost always is), diverting engineering time to internal tools delays revenue-generating features. The opportunity cost depends on your context: for a pre-product-market-fit startup, it could be existential. For a profitable company with a well-staffed engineering team, it may be negligible.

**Infrastructure and operations.** Custom tools need hosting, monitoring, backups, and incident response. If you are already running infrastructure (most software companies are), the marginal cost is low. If internal tools are your first foray into running software, the infrastructure overhead is significant.

## The Decision Framework

Use the following criteria to evaluate each build-vs-buy decision systematically.

**Criterion 1: Workflow uniqueness.** Rate how unique your workflow is on a scale of 1 to 5. A 1 means your workflow is identical to standard industry practice (e.g., standard payroll processing). A 5 means your workflow is highly proprietary and central to your competitive advantage (e.g., a custom underwriting process in fintech). If your workflow scores a 1 or 2, buy. If it scores a 4 or 5, build. The 3 zone requires deeper analysis.

**Criterion 2: User count trajectory.** If the tool will serve fewer than 50 users and that number is stable, per-seat SaaS pricing is usually favorable. If you are growing toward hundreds of users, SaaS costs compound while custom tool costs are fixed. Calculate the 3-year total cost of ownership for both options based on your headcount projections.

**Criterion 3: Integration density.** Count the number of systems the tool needs to integrate with. If it is a standalone tool with 0 to 1 integrations, buy. If it needs deep, bidirectional integration with 3 or more internal systems, building is often easier than coercing a SaaS tool to work with your specific data models and APIs.

**Criterion 4: Rate of change.** If your requirements are stable (you know exactly what you need and it will not change much), buying is efficient because you avoid maintenance costs. If your requirements evolve rapidly (new fields, new workflows, new user roles every quarter), building gives you the flexibility to iterate without waiting on a vendor's product roadmap.

**Criterion 5: Data sensitivity.** If the tool handles PII, financial data, health records, or trade secrets, self-hosted custom tools reduce compliance surface area. Every SaaS vendor is a potential breach vector and a compliance liability. For highly sensitive data, the risk reduction of keeping it in-house may outweigh the higher build cost.


> See also: [Why Big Software Redesigns Almost Always Fail](/blog/why-big-software-redesigns-almost-always-fail/)


## Common Scenarios and Recommendations

Here are specific build-vs-buy recommendations for the most common internal tool categories.

**Customer support ticketing.** Buy. Zendesk, Intercom, and HelpScout have invested hundreds of millions of dollars in this problem. The workflow is well-understood. Unless you have a genuinely unique support model (and most companies that think they do, do not), a SaaS tool handles this better than anything you will build.

**Admin dashboards for your product.** Build. Nobody knows your product's data model like your team. Every SaaS admin tool requires mapping your schema to its abstractions, and the mapping is always lossy. Use a low-code framework like Retool, Appsmith, or Tooljet to build admin dashboards in days instead of weeks. These tools connect directly to your database and APIs and let non-engineers modify layouts and queries.

**Business intelligence and reporting.** Buy initially, build incrementally. Start with Metabase, Looker, or Mode for standard reporting. When stakeholders need custom visualizations, embedded analytics, or reports that combine data from sources the BI tool cannot access, build those specific reports as custom features.

**Workflow automation.** Hybrid. Use Zapier, Make, or n8n for simple automations (fewer than 5 steps, standard triggers, well-known apps). Build custom automation for complex multi-step workflows that involve your proprietary systems, require error handling logic specific to your business rules, or need to process thousands of events per hour (where per-task pricing makes SaaS prohibitively expensive).

**CRM.** Buy for sales teams under 50 people. Salesforce, HubSpot, and Pipedrive cover standard sales workflows well. Build (or heavily customize) for companies whose sales process is deeply intertwined with their product (usage-based pricing models, product-led growth funnels, marketplace businesses).

## Migration Strategy When Switching Directions

Sometimes you start with one approach and need to switch. This is normal and should be planned for.

**SaaS to custom.** When a SaaS tool is no longer serving your needs, plan a parallel migration. Build the custom replacement, migrate data in batches (start with historical data, then set up real-time sync for active data), run both systems in parallel for 2 to 4 weeks, and cut over only when the custom tool handles 100% of workflows. Budget 1.5x the normal build time for migration-inclusive projects due to data cleaning, edge case handling, and user retraining.

**Custom to SaaS.** When maintenance burden on a custom tool exceeds its value, migrating to SaaS saves engineering time. Export your data in a clean, well-documented format. Map custom fields and workflows to the SaaS tool's equivalents. Accept that some functionality will change; involve end users in the mapping decisions so they feel ownership rather than having a new tool imposed on them.

**Gradual extraction.** The most common pattern is starting with a SaaS tool and gradually extracting specific features into custom builds. You might use HubSpot for CRM but build a custom deal scoring model that enriches HubSpot data via the API. Or use Jira for project management but build a custom dashboard that pulls Jira data alongside deployment metrics and customer feedback into a unified view. This hybrid approach captures the best of both worlds.

**Documenting the decision.** For each build-vs-buy decision, write a brief decision record: the options considered, the criteria evaluated, the cost estimates, and the rationale for the choice. Review these records annually. Teams that document their decisions make better decisions over time because they can learn from past outcomes.

---

The build-vs-buy decision is not a one-time choice. It is an ongoing evaluation as your company grows, your workflows evolve, and the SaaS landscape changes. The framework above gives you a consistent way to make these decisions with confidence. If you are evaluating whether to build custom internal tools or trying to get more value from your current tool stack, [talk to our team](/contact.html) about your specific situation.
