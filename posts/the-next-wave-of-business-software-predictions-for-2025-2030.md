# The Next Wave of Business Software: Predictions for 2025-2030

Business software is entering a period of disruption that rivals the SaaS wave of the 2010s. The convergence of AI capabilities, changing workforce expectations, infrastructure commoditization, and a backlash against bloated enterprise tooling is creating openings for a new generation of products. Here are the shifts we see reshaping how businesses buy, build, and use software over the next five years -- based on patterns we're already observing in the projects crossing our desk.

## Vertical AI Agents Will Replace Horizontal SaaS Features

The first wave of AI in business software was horizontal: add a chatbot to your help desk, add text generation to your CMS, add summarization to your meeting tool. These features are useful but shallow -- they bolt AI onto existing workflows without fundamentally changing them.

The next wave is vertical AI agents that own entire business processes end-to-end. An AI agent that handles accounts receivable doesn't just generate reminder emails -- it monitors invoice aging, identifies at-risk accounts, adjusts communication tone based on payment history, escalates to human collectors based on configurable rules, and reconciles payments when they arrive. It replaces a workflow that currently spans an ERP, an email tool, a spreadsheet tracker, and a human operator's judgment.

We're already seeing early versions of this in specific verticals. Companies like Ramp (finance), Harvey (legal), and Abridge (medical documentation) are building AI that doesn't augment existing software -- it replaces multi-tool workflows with a single intelligent system. By 2028, we expect every major business function (procurement, HR operations, compliance, customer onboarding) to have at least one viable AI-agent product competing with traditional SaaS suites.

The architectural implication for companies building software: design your systems with agent interaction in mind. APIs need to support the workflows that agents execute, not just the screens that humans click. Event streams need to expose business state changes that agents can react to. Authorization models need to accommodate non-human actors with constrained permissions.

## The Unbundling of Enterprise Suites Into Composable Modules

Large enterprise suites (Salesforce, SAP, Oracle, Microsoft Dynamics) grew through acquisition and feature accretion. The result is products that do everything adequately and nothing exceptionally. A mid-size company buys Salesforce for CRM and ends up paying for marketing automation, customer service, analytics, and app development capabilities they don't use.

The composable alternative is gaining traction: pick best-of-breed tools for each function and connect them through APIs and integration platforms. The missing piece has historically been integration complexity -- wiring ten tools together is expensive and fragile. But integration infrastructure has matured dramatically. Platforms like Merge, Nango, and Paragon make it possible to build pre-built integrations into your product that connect to hundreds of other tools. iPaaS solutions like Tray.io and Workato let operations teams build custom integrations without engineering involvement.

Over the next five years, we predict that companies under 500 employees will increasingly reject enterprise suites in favor of composable stacks. The economics favor it: instead of $150/user/month for a suite where you use 30% of features, spend $60/user/month on three focused tools that each excel at their function. The total cost is lower, the user experience is better, and switching any individual component is feasible.

For software builders, this means designing products with integration as a core capability, not an afterthought. Your product's API quality, webhook coverage, and pre-built integrations are as important as its UI. The products that win in a composable ecosystem are the ones that play well with others.

## Internal Tools Will Be Generated, Not Coded

The internal tools market -- admin panels, dashboards, operational interfaces, data entry forms -- is being transformed by code generation and low-code platforms. Tools like Retool, Airplane, and Superblocks already let teams build internal interfaces by connecting to databases and APIs visually. AI-powered generation is the next step: describe the tool you need in natural language, and the platform generates it.

This isn't speculative. GitHub Copilot and Claude are already generating functional CRUD interfaces from schema definitions and natural language descriptions. The quality isn't production-grade yet, but it's improving on a quarterly basis. By 2027, we expect that 60-70% of internal tools at mid-size companies will be generated rather than custom-coded.

The implication for custom software studios (including us) is a shift upstream. The value moves from building the tools to designing the data architecture, business logic, and integration layer that the tools sit on top of. A well-designed database schema with clean APIs becomes more valuable because it's the foundation that generated tools connect to. Poorly designed data layers produce poor generated tools regardless of how good the generation technology becomes.

For companies, the advice is pragmatic: invest in your data infrastructure now. Clean up your database schemas, build proper APIs around your core data, and document your business logic. When generated tools can build your admin panel in an afternoon, the bottleneck will be having a data layer worth building on.

## Edge Computing Brings Business Logic Closer to Users

The dominant deployment model for business software -- centralized cloud servers in a single region -- is giving way to edge computing that distributes application logic globally. Cloudflare Workers, Vercel Edge Functions, and Deno Deploy run your code in 200+ locations worldwide, with sub-50ms response times regardless of user location.

For business software serving global teams, this eliminates the latency penalty that remote offices experience. A team in Singapore using a US-hosted application adds 200-300ms of network latency to every interaction. On an edge platform, the same interaction resolves at a nearby node in 20-30ms. Over the course of a workday, that latency reduction translates to meaningful productivity gains for operations-intensive roles.

Edge computing also enables new architectural patterns. **Edge-side personalization** -- customizing the application interface based on user role, locale, or organizational context -- can happen at the network edge without round-tripping to an origin server. **Edge-side authorization** can enforce access control at the CDN layer, reducing load on application servers and improving security by rejecting unauthorized requests before they reach your backend.

The limitation is data. Edge computing works well for compute that can run against cached or local data. Business applications that need transactional database access still need to reach a central or regional database. Distributed databases like CockroachDB, PlanetScale, and Neon are addressing this by offering multi-region read replicas with low-latency reads, but writes still need to coordinate across regions. For read-heavy business applications (dashboards, reports, reference tools), edge deployment is already viable. For write-heavy applications (data entry, transaction processing), it's a hybrid: edge for reads, central for writes.

## Privacy and Data Sovereignty Become Product Requirements

Regulatory pressure on data handling is accelerating, not plateauing. Beyond GDPR, we're seeing comprehensive privacy legislation in India (DPDPA), Brazil (LGPD), Saudi Arabia (PDPL), and an expanding patchwork of US state laws. The practical effect: any business software that handles personal data needs to account for where that data is stored and processed.

By 2028, we predict that data residency options will be a standard checkbox feature for any B2B SaaS product selling internationally. "Where is my data stored?" will have a clear answer, and "in the nearest available region" will be the expected default. Multi-region deployment with tenant-level data routing will move from an enterprise premium to a baseline capability.

This creates both a challenge and an opportunity for software builders. The challenge is infrastructure complexity: managing database replicas across regions, routing tenant data to the correct region, ensuring backup and disaster recovery respect residency rules. The opportunity is differentiation: products that solve data residency elegantly will win deals that region-locked competitors can't compete for.

The broader trend is that privacy is shifting from a compliance concern to a purchasing criterion. Procurement teams are asking for data processing agreements, subprocessor lists, and privacy impact assessments as standard parts of the vendor evaluation process. Software that treats privacy as a core architectural principle (minimal data collection, transparent processing, built-in deletion) will have a structural advantage in enterprise sales.

## The Return of Owned Infrastructure

After a decade of cloud-first thinking, a counter-movement is emerging. Companies are repatriating workloads from hyperscale cloud providers to owned or dedicated infrastructure. Basecamp's widely publicized move away from AWS, saving millions in annual costs, is the most visible example, but the pattern extends to companies of all sizes.

The driver is cost transparency. Cloud pricing -- with its per-request, per-GB, per-compute-second models -- makes it difficult to predict costs, and bills consistently surprise upward as usage grows. Dedicated servers from Hetzner, OVH, or bare-metal providers offer predictable monthly costs at a fraction of the per-unit price. A dedicated server with 128 GB RAM and 2 TB SSD costs $100-200/month. The equivalent cloud instance is $500-1,000/month.

We don't predict a wholesale abandonment of cloud infrastructure. Managed services (databases, queues, object storage, monitoring) remain compelling, and the operational overhead of managing your own hardware is real. But a hybrid approach -- application servers on dedicated hardware, managed databases on cloud platforms, edge CDN for static assets -- is becoming the cost-optimal architecture for many business applications.

For software builders, the implication is designing applications that are infrastructure-agnostic. Containerization (Docker), orchestration (Kubernetes or lighter alternatives like Kamal), and infrastructure-as-code (Terraform, Pulumi) let you move between hosting environments without rewriting your deployment pipeline. The applications we build today should deploy equally well to a $50/month Hetzner box and a Vercel Pro account.

---

If you're planning a software product and want to build on architectural foundations that will serve you through 2030, [let's have a conversation](/contact.html). We help teams make technology bets that age well.
