# Year in Review: Projects, Lessons, and What Is Next

Every year we take stock of what we built, what we learned, and what we got wrong. This is not a marketing exercise — it is how we get better at the work. The Proper Motion Company turned four this year, and the nature of the projects we take on has shifted noticeably since we started. Longer engagements, more complex systems, higher stakes. That shift has forced changes in how we operate, and some of those changes came from making mistakes first.

Here is an honest look at the past year.

## The Shape of the Work in 2025

We shipped 11 projects across the year. The smallest was a 3-week internal tool build for an operations team that had been running their workflow in spreadsheets. The largest was a 9-month platform rebuild for a healthcare logistics company that had outgrown their initial Rails monolith. The median project length was about 14 weeks, which is up from 8 weeks two years ago.

The domain mix was wider than any previous year: two healthcare projects, two fintech-adjacent platforms (one payment processing, one lending workflow), a franchise management system, a real estate transaction platform, two internal tool builds, a mobile app for field service workers, and two SaaS products where we were brought in as the technical co-founder.

Three projects involved AI features — not as the core product, but as capability layers added to existing workflows. Document classification for an insurance intake process, predictive scheduling for a field service operation, and a natural language query interface for a business intelligence dashboard. In each case, the AI component was maybe 15% of the total engineering effort, but it was the feature that got the most attention in demos. That ratio — small engineering effort, outsized perceived value — is worth paying attention to.


> Related: [What We Learned Building Our Own Company Website](/blog/what-we-learned-building-our-own-company-website/)


## A Project That Went Sideways and What We Changed

Our biggest stumble was a project that started in February and should have been done by June. It was a customer portal for a B2B company — their clients needed to submit requests, track status, manage invoices, and communicate with their account team. Straightforward scope, or so we thought.

The problem was requirements discovery. We did our standard kickoff process — stakeholder interviews, workflow mapping, priority ranking — and started building. By week 6, we had a working prototype that matched everything we had documented. The client loved it in demo. Then they showed it to their actual customers, and the feedback was essentially: "This solves the wrong problems."

It turned out that the internal team's perception of what their customers needed was significantly different from what customers actually needed. The internal team prioritized invoice management and request tracking. Customers mostly wanted faster response times on urgent issues and the ability to escalate without picking up the phone. The existing system was not slow because it lacked a portal — it was slow because the internal triage process had too many handoffs.

We ended up rebuilding most of the UI around a communication-first model with an escalation workflow that bypassed the standard triage queue for time-sensitive issues. The project delivered in August, two months late.

What we changed: we now require direct access to end users before we finalize scope on any project where the client's team is not the primary user. We build a throwaway prototype in the first two weeks and put it in front of real users before committing to a full build plan. The cost of those two weeks is trivial compared to the cost of rebuilding after week 6.

## The Infrastructure Decisions We Kept Making

Across 11 projects, some patterns repeated enough to be worth noting.

PostgreSQL was the database on every project. Not because we are dogmatic about it, but because it handles the widest range of requirements with the least operational complexity. Full-text search, JSON columns, row-level security, excellent performance, and a massive ecosystem of tooling. We used Supabase as the hosting layer on four projects (particularly where real-time subscriptions or built-in auth were valuable) and plain AWS RDS on the rest.

Next.js was the frontend framework on 8 of 11 projects. The two exceptions were projects with existing codebases in other frameworks, and one mobile-first project where we used React Native. Next.js App Router has matured significantly — server components and server actions have simplified data fetching patterns that used to require a separate API layer.

For deployment, Vercel handled the Next.js projects and Railway or Render handled the backend services. We stopped using AWS directly for application hosting on new projects. The operational overhead of managing ECS or EKS does not make sense for teams under 10 engineers, and every client we work with falls into that category.

Tailwind CSS on every project. We experimented with Panda CSS on one project early in the year and switched back. Tailwind's ecosystem — particularly the component libraries and the utility-first approach — makes it the fastest path to a professional-looking interface. Combined with shadcn/ui components, we can build production-quality UIs about 40% faster than we could two years ago.


> See also: [What Proper Motion Means: The Philosophy Behind Our Name](/blog/what-proper-motion-means-the-philosophy-behind-our-name/)


## What AI Changed About How We Build

This was the year AI tools went from interesting to indispensable in our daily work. Not in the way most people talk about it — we are not generating entire applications with prompts. The impact was more subtle and more practical.

Claude and Cursor became part of every developer's workflow for code generation, refactoring, and especially for writing tests. Test coverage across our projects went up measurably — not because we suddenly became more disciplined about testing, but because the friction of writing tests dropped so dramatically that it became easier to write them than to skip them. When you can describe a function's expected behavior in plain English and get a complete test suite in 30 seconds, the economics of testing flip.

We also used AI extensively for code review and documentation. Having a model review a pull request for potential bugs, security issues, and consistency with project conventions catches things that human reviewers miss, particularly on larger PRs where attention fades.

The area where AI did not help much was system design. Deciding how to structure a database schema, where to draw service boundaries, or how to handle a complex business workflow still requires human judgment informed by domain knowledge and experience. The models can suggest patterns, but they cannot evaluate tradeoffs in the context of a specific team's capabilities, a specific client's constraints, and a specific market's requirements.

## Client Relationships and How We Scoped Engagements

We changed our engagement model this year. Previously, we scoped projects with a fixed price and a defined set of deliverables. That works when requirements are clear and unlikely to change, which describes about 30% of software projects. For the other 70%, fixed-price creates bad incentives on both sides: we are incentivized to limit scope, and the client is incentivized to expand it.

We moved most engagements to a weekly cadence model: we commit to a weekly capacity (usually 30-40 hours per developer), the client sets priorities at the start of each week, and we deliver working software at the end of each week. Billing is time-based with full transparency — the client sees exactly how many hours went to each feature or task.

The result was better relationships, faster delivery, and fewer disputes. When a client can reprioritize mid-sprint based on what they learned from last week's release, the product evolves faster than it does under a fixed scope. The tradeoff is less predictability on total project cost, which we mitigate with a rough estimate at kickoff and a monthly review of spend-to-value.

We also formalized our "exit readiness" practice. Every engagement produces documentation, runbooks, and knowledge transfer sessions sufficient for the client's team (or another vendor) to take over maintenance and development. We do not want to be a dependency — we want to be a catalyst.

## What Is Ahead for 2026

Three trends are shaping the projects we are seeing in our pipeline.

First, AI-native products. Not "add AI to an existing product" but products where the core value proposition is AI-powered from day one. We are seeing more founders who want to build AI-first companies and need a technical partner who understands both the ML infrastructure (model selection, fine-tuning, inference optimization, evaluation) and the product engineering (UX for probabilistic outputs, feedback loops, graceful degradation when the model is wrong).

Second, migration and modernization. There is a wave of applications built in 2018-2021 that are hitting scaling or maintenance walls. Rails apps that need to handle 10x the traffic. React apps built before hooks that are painful to extend. Microservice architectures that turned out to be premature. We expect to spend a meaningful chunk of 2026 helping teams get out from under technical debt they accumulated during the "move fast" years.

Third, compliance-driven rebuilds. Healthcare, fintech, and insurance companies are facing tighter regulatory requirements (SOC 2, HIPAA, state-level data privacy laws) that their existing systems were not designed to meet. Retrofitting compliance into an application that was not built for it is often harder than rebuilding the relevant components with compliance baked in from the architecture level.

We are heading into the year with a strong pipeline, a better process than we have ever had, and — most importantly — a clearer understanding of what we are good at and where we should say no.

If any of these themes resonate with what you are building or planning, [we would enjoy the conversation](/contact.html).
