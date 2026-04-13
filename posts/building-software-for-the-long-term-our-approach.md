# Building Software for the Long Term: Our Approach

Most custom software does not fail at launch. It fails at year three, when the original developers have moved on, the business has shifted, and the codebase has accumulated enough shortcuts that every change feels like defusing a bomb. The median lifespan of a custom business application is about six years before a major rewrite. We think that number should be fifteen.

Building software that endures is not about picking the trendiest framework or writing the cleverest code. It is about making hundreds of small decisions that favor clarity over cleverness, adaptability over optimization, and maintainability over speed-to-market. Here is how we think about longevity at The Proper Motion Company.

## Choosing Boring Technology Deliberately

Dan McKinley's "Choose Boring Technology" essay resonates with us because we have lived the consequences of the alternative. Every novel technology you introduce carries an innovation token -- a finite budget of complexity your team can absorb. Spend those tokens on your core differentiator, not on your database driver.

For most business applications, this means PostgreSQL over the newest distributed database, server-rendered HTML over a single-page application framework (unless interactivity genuinely demands it), and well-understood deployment targets like containerized services over bleeding-edge serverless architectures.

This is not conservatism for its own sake. It is a calculated bet on the future. PostgreSQL has been in active development since 1996. Its documentation is exhaustive. Its community is enormous. When your team needs to debug a query plan at 2 AM, they will find the answer. The same cannot be said for a database that launched eighteen months ago with a Discord server as its primary support channel.

We do adopt newer tools when they offer a genuine, measurable advantage for the specific problem at hand. TypeScript over JavaScript is a trade we make on virtually every project because the type system catches entire categories of bugs at compile time. But we adopt it because of its concrete benefits, not because it is new.


> Related: [Why the Traditional Software Agency Model Is Broken](/blog/why-the-traditional-software-agency-model-is-broken/)


## Investing in the Dependency Graph

The architecture of a long-lived system is defined not by its components but by the boundaries between them. We spend significant time at the start of every project mapping out domain boundaries and defining explicit contracts between modules.

Concretely, this means:

**Vertical slicing over horizontal layering.** Instead of organizing code by technical concern (controllers, services, repositories), we organize by business domain (orders, billing, notifications). Each domain owns its data, its business logic, and its API surface. When the billing rules change, you touch the billing module. You do not grep across fourteen service files hoping you found every reference.

**Explicit dependency direction.** Dependencies point inward toward the domain logic, never outward toward infrastructure. Your order processing logic should not import your PostgreSQL client directly. It should depend on an interface that a PostgreSQL adapter happens to implement. When you need to swap databases, add caching, or write tests, you swap the adapter, not the business logic.

**Event-driven communication between domains.** When an order is placed, the order module publishes an event. The notification module subscribes to it and sends a confirmation email. The analytics module subscribes to it and updates dashboards. Neither the notification module nor the analytics module needs to know about the other's existence. Adding a new reaction to an order placement requires zero changes to the order module.

These patterns cost more upfront -- perhaps 15-20% more development time in the first two months. But they pay for themselves before the end of the first year, and they compound after that.

## Writing Code for the Reader, Not the Writer

Code is read ten times more often than it is written. We optimize ruthlessly for readability, even when it means writing more lines.

Variable names are full words: `remainingInventoryCount`, not `remInvCnt`. Functions do one thing and their name says what that thing is: `calculateShippingCostForOrder`, not `process`. Modules are small enough that you can hold the entire file in your head -- typically under 200 lines.

We avoid abstractions until we have seen the same pattern three times. Premature abstraction -- building a generic `DataProcessor<T>` when you have only ever processed invoices -- creates code that is harder to understand and harder to change than the duplication it was meant to eliminate. When we do abstract, we favor composition over inheritance, because inheritance hierarchies are the single most common source of "I cannot change this without breaking everything" paralysis in aging codebases.

Comments explain why, never what. If the code needs a comment explaining what it does, the code should be rewritten to be self-explanatory. But a comment explaining why a particular business rule exists -- "Canadian tax law requires HST to be calculated on the pre-discount amount, not the final amount, per CRA ruling 2019-0742" -- is invaluable to the developer who encounters it two years from now.


> See also: [What We Learned Building Software for 50 Plus Companies](/blog/what-we-learned-building-software-for-50-plus-companies/)


## Testing as a Long-Term Investment

We maintain a testing pyramid: many unit tests (fast, isolated, covering business logic), fewer integration tests (verifying that modules work together through their contracts), and a handful of end-to-end tests (confirming critical user journeys through the actual UI).

The ratio we aim for is roughly 70% unit, 20% integration, 10% end-to-end. This balance keeps the test suite fast enough to run on every commit (under 90 seconds for unit tests, under five minutes for the full suite) while still catching the integration bugs that unit tests miss.

More importantly, we write tests that describe behavior, not implementation. A test named `test_order_total_includes_tax_for_canadian_customers` will remain valid through a dozen refactors. A test named `test_calculateTax_calls_TaxService_with_correct_params` will break the moment you change the internal implementation, even if the behavior is identical.

We also treat test infrastructure as production code. Test factories, shared fixtures, and helper functions get the same code review rigor as application code. A flaky test suite -- one where failures are ignored because "that test is just flaky" -- is worse than no tests at all, because it trains the team to ignore failures.

## Documentation That Lives With the Code

We have seen too many projects where the documentation lives in a Confluence wiki that was last updated eight months ago. Our documentation lives in the repository, versioned alongside the code it describes.

Every project gets an architecture decision record (ADR) directory. When we make a significant technical choice -- choosing PostgreSQL over MongoDB, adopting a particular authentication strategy, deciding to use server-side rendering -- we write a short document explaining the context, the decision, the alternatives considered, and the consequences. These records are invaluable during onboarding and during future architectural discussions. They prevent the team from relitigating settled decisions and from repeating past mistakes.

API contracts are documented using OpenAPI specifications that are generated from the code (or vice versa, depending on the project). The specification is the source of truth, and CI fails if the implementation drifts from the spec.

Runbooks for operational procedures -- how to deploy, how to roll back, how to investigate a production incident -- live in a `docs/runbooks` directory and are tested quarterly. Documentation that has never been followed is documentation that does not work.

## Planning for Handoff From Day One

We build every system as if we will hand it off to a different team next month. Because eventually, we will. The client may hire an internal team. They may switch vendors. Key developers may leave. The software needs to survive all of these transitions.

This means no tribal knowledge. Every configuration value is in environment variables, documented in a `.env.example` file. Every deployment step is automated in a CI/CD pipeline. Every non-obvious business rule is captured in code comments or ADRs.

It also means the local development environment can be set up with a single command. We use Docker Compose or similar tooling to ensure that `make setup` provisions the database, seeds test data, and starts the application. If a new developer cannot go from `git clone` to a running application in under fifteen minutes, something is wrong.

The software we build is not ours. It belongs to the people who will maintain it long after our engagement ends. Every decision we make reflects that reality.

## Embracing Incremental Improvement Over Heroic Rewrites

Long-lived software evolves continuously. It is never "done." The temptation to declare a system finished and move on to the next project is strong, but it leads to the same decay pattern every time: six months of neglect, followed by a crisis, followed by a heroic rewrite that starts the cycle again.

We build maintenance and improvement into the ongoing rhythm of every project. Each sprint includes a budget for technical health work -- typically 15-20% of the team's capacity. This is not optional and it is not negotiable with product stakeholders. It is the cost of keeping the software healthy, the same way regular oil changes are the cost of keeping a car running.

This budget covers dependency updates (keeping libraries current to avoid the security and compatibility debt that accumulates when you skip three major versions), test coverage improvements for areas of the code that have proven fragile, performance monitoring and optimization based on real production data, and documentation updates when business rules change.

The alternative -- deferring all maintenance until it becomes a crisis -- is dramatically more expensive. A dependency update that would take two hours if done monthly can take two weeks if deferred for three years, because the breaking changes across multiple major versions cascade through the application.

We have seen this pattern too many times to accept it. Consistent, small investments in software health produce systems that last. Deferred maintenance produces systems that collapse. The math is not close.

---

If you are planning a software project that needs to last, we would like to help you lay the right foundation. [Reach out to us](/contact.html) to start a conversation about your long-term goals.
