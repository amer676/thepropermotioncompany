# Managing Technical Debt During Rapid Growth

Technical debt is not inherently bad. Like financial debt, it is a tool. Taking on debt to ship a feature faster, capture a market window, or validate a hypothesis before investing in a polished implementation is a rational decision when made deliberately. The problem is that most technical debt is not taken on deliberately. It accumulates invisibly through rushed deadlines, incomplete refactoring, deferred testing, and the gradual erosion of code quality that happens when a team is moving fast and not looking back.

During rapid growth, this accumulation accelerates. The team is shipping features to keep up with demand, onboarding new engineers who do not have full context on the codebase, and making architectural decisions under time pressure that trade long-term maintainability for short-term velocity. Left unchecked, technical debt compounds until the team spends more time working around existing problems than building new capabilities. We have seen companies where 60-70% of engineering time goes to maintenance and bug fixes, leaving only 30-40% for new features. At that point, growth does not just slow. It stalls.

## Recognizing the Categories of Debt You Are Carrying

Not all technical debt is the same. Different categories require different remediation strategies.

**Deliberate, prudent debt** is debt you chose to take on with clear eyes. "We know this implementation does not scale past 10,000 concurrent users, but we have 500 today and we need to ship by Friday. We will revisit when we hit 5,000." This is healthy debt with a defined repayment plan.

**Deliberate, reckless debt** is cutting corners knowingly without a plan to fix it. "We will worry about security later" or "tests slow us down, skip them for now." This is the debt that causes production incidents, data breaches, and the kind of technical crises that dominate entire quarters.

**Inadvertent, prudent debt** is debt you discover after learning more. "We built the notification system as a synchronous process because we didn't anticipate 50,000 notifications per hour. Now we know, and we need to refactor it to be asynchronous." This is normal and expected in any growing system.

**Inadvertent, reckless debt** is debt created by lack of skill or awareness. Copy-pasted code across 40 files, database queries that scan entire tables instead of using indexes, authentication logic scattered through individual endpoints instead of centralized middleware. This debt grows fastest during rapid hiring when new engineers write code before understanding the codebase's patterns.

Map your current debt across these categories. The remediation approach differs: deliberate prudent debt just needs scheduled repayment. Reckless debt needs immediate attention. Inadvertent prudent debt needs refactoring cycles. Inadvertent reckless debt needs better onboarding, code review standards, and possibly technical mentorship.


> Related: [Privacy-First Software Development as Competitive Advantage](/blog/privacy-first-software-development-as-competitive-advantage/)


## Quantifying Debt So Leadership Takes It Seriously

"We have a lot of technical debt" is not a compelling argument to leadership. "Technical debt is adding 3 days to every feature we ship, which means we will miss the Q3 roadmap by 6 weeks unless we invest 4 weeks in remediation" is compelling. To get there, you need to measure.

**Feature development velocity.** Track how long it takes to ship features over time. If a feature that would have taken 3 days six months ago now takes 7 days because of workarounds, coupling, and regression testing, the difference is the tax you are paying on accumulated debt. Plot this trend on a graph and show it to your CTO or VP of Engineering.

**Bug rate per release.** If every release introduces more bugs than the previous one, debt is increasing. Track bugs filed within 7 days of each release. An upward trend is a leading indicator that code quality is degrading.

**Deployment frequency and failure rate.** Healthy teams deploy frequently (daily or more) with low failure rates (less than 5% of deployments require rollback). If deployment frequency is declining or failure rates are increasing, the deployment pipeline or the code it deploys has accumulated problems.

**Time spent on unplanned work.** Track the ratio of planned work (features, improvements) to unplanned work (bug fixes, incident response, emergency patches). A healthy ratio is 70/30 or better. Below 60/40, the team is in reactive mode and debt is controlling the roadmap.

**Developer experience surveys.** Ask your engineers quarterly: "On a scale of 1-10, how confident are you when deploying changes to the codebase?" and "What area of the codebase do you dread working in?" The areas that consistently score low are where debt is concentrated.

Present these metrics to leadership not as a technical concern but as a business risk. "Our feature delivery speed has decreased 40% in 6 months. At the current trajectory, we will ship 8 features next quarter instead of the 14 on the roadmap. Investing 3 weeks in targeted debt reduction will restore velocity to within 15% of our peak."

## The 20% Rule: Sustainable Debt Management

The most effective long-term strategy we have seen is dedicating a consistent portion of engineering capacity to debt reduction every sprint. We recommend 20%.

In a two-week sprint with a five-person team, that is approximately 80 hours of debt work per sprint (2 full engineer-days per week). This is not enough to tackle massive refactoring projects, but it is enough to make steady progress that prevents debt from compounding.

**How to allocate the 20%:**

- **5% on continuous improvement** within feature work. Every time an engineer touches a file to build a feature, they improve one thing: rename a confusing variable, extract a helper function, add a missing test, update an outdated comment. This is the "boy scout rule" (leave the code better than you found it) applied systematically.

- **10% on targeted refactoring.** Maintain a prioritized debt backlog. Each sprint, pull the highest-impact item and assign it to an engineer. A typical item might be: "Extract the notification logic from the order processing module into a dedicated service" or "Replace the hand-rolled CSV parser with a tested library" or "Add database indexes to the five slowest queries."

- **5% on tooling and automation.** Invest in tools that prevent new debt: linters that enforce code style, pre-commit hooks that run tests, CI pipelines that measure code coverage, dependency bots that flag outdated packages. Every hour spent on tooling saves multiple hours of future debt accumulation.


> See also: [The AI Technology Stack: Models, Frameworks, and Infrastructure Guide](/blog/the-ai-technology-stack-models-frameworks-and-infrastructure-guide/)


## Refactoring Strategies That Work During Active Development

The biggest challenge of debt reduction during rapid growth is that you cannot stop shipping features to fix the foundation. The codebase is a highway you are repaving while traffic flows.

**Strangler fig pattern.** Instead of rewriting a problematic module from scratch, build the replacement alongside it. Route new traffic to the new implementation. Gradually migrate existing callers from the old module to the new one. Once all traffic uses the new module, delete the old one. This approach carries near-zero risk because the old system remains functional throughout the migration.

We used this pattern to help a client replace a monolithic billing system with a microservice. The new billing service ran in parallel for 8 weeks, processing the same transactions as the old system. The team compared outputs daily to verify correctness. Once parity was confirmed, they switched traffic to the new service and decommissioned the old one. Zero downtime, zero data loss, zero customer impact.

**Feature flags for incremental rollout.** Wrap refactored code behind feature flags. Deploy the new implementation to production but enable it only for internal users or a small percentage of traffic. Monitor error rates and performance. If something goes wrong, disable the flag instantly. This gives you the ability to refactor aggressively with a safe rollback mechanism.

**Contract-first refactoring.** Before changing any internal implementation, define the interface (API contract, function signature, database schema) that the refactored code must satisfy. Write tests against that interface. Now refactor the implementation with confidence that the tests will catch any behavioral changes. This approach is slower initially but prevents the cascading breakage that makes teams afraid to refactor.

**Database migrations as a separate workstream.** Schema changes are the highest-risk type of refactoring. Separate them from application code changes. First, create the new schema alongside the old one. Then, dual-write to both schemas. Then, migrate reads to the new schema. Then, stop writing to the old schema. Then, drop the old schema. Each step is independently deployable and reversible.

## Preventing Debt Accumulation During Rapid Hiring

When your engineering team doubles in 6 months, the risk of debt accumulation multiplies. New engineers do not know the codebase's conventions, architectural boundaries, or the reasoning behind existing design decisions. They write code that works but does not fit.

**Onboarding documentation that covers "why" not just "how."** New engineers need to understand not just how to set up their development environment but why the codebase is structured the way it is. An Architecture Decision Records (ADR) practice, where every significant technical decision is documented with context and rationale, gives new engineers the background to make decisions consistent with the team's intentions.

**Mandatory code review by a tenured team member.** Every pull request from an engineer in their first 90 days should be reviewed by someone who has been on the team for at least 6 months. This is not gatekeeping. It is knowledge transfer. The reviewer explains conventions, suggests existing utilities the new engineer did not know about, and catches patterns that deviate from the team's standards before they land in the main branch.

**Shared component libraries and utilities.** If three engineers independently implement date formatting logic because they did not know a utility exists, you have three implementations to maintain. A well-organized, well-documented shared library prevents this duplication. Invest time in making internal libraries discoverable (good naming, README files, search-friendly documentation).

**Automated enforcement of standards.** Human code review catches design and logic issues. Automated tools catch style and convention issues. Configure ESLint, Prettier, or equivalent tools with your team's coding standards. Run them in CI so non-conforming code cannot merge. This eliminates an entire category of code review feedback and frees reviewers to focus on substantive concerns.

---

At The Proper Motion Company, we help growing engineering teams manage technical debt without sacrificing delivery speed. Whether you need a debt audit, a refactoring strategy, or temporary engineering capacity to execute a major migration, [talk to us about your situation](/contact.html).
