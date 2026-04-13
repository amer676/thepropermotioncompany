# Sustainability in Software: Building Products That Last Decades

Most software dies young. The average custom application is rewritten or replaced within five to seven years, not because the business problem it solved disappeared, but because the codebase became too expensive to maintain, too brittle to extend, or too tangled for anyone besides the original author to understand. That is an enormous waste of investment, institutional knowledge, and user trust.

At The Proper Motion Company, we think about software the way structural engineers think about bridges: the goal is not just to handle today's traffic, but to remain safe, functional, and adaptable for decades. This article lays out the principles and practices that separate throwaway code from genuinely sustainable software.

## Why Most Software Becomes Disposable

The root cause is almost never a single bad decision. It is the accumulation of hundreds of small shortcuts taken under deadline pressure. A database query gets embedded directly in a UI component. A critical business rule lives in a comment instead of a test. Configuration values are hard-coded because "we'll fix it later."

Each shortcut individually costs almost nothing. Collectively, they create what Ward Cunningham famously called "technical debt" --- a metaphor that understates the problem, because unlike financial debt, technical debt compounds in ways that are invisible until they become catastrophic.

Consider the numbers. A 2022 study by Stripe estimated that developers worldwide spend 42 percent of their time dealing with technical debt and maintenance. For a team of ten engineers at an average fully-loaded cost of $200,000 per year, that is $840,000 annually spent not on new features or customer value, but on fighting the codebase itself.

Sustainable software is not about writing perfect code. It is about making deliberate choices that keep the cost of change low over time.


> Related: [How to Plan and Execute a Software Migration](/blog/how-to-plan-and-execute-a-software-migration/)


## Choosing Boring Technology on Purpose

One of the most counterintuitive principles of sustainable software is that the best technology choice is usually the most boring one. PostgreSQL over the newest graph database. Server-rendered HTML over a client-side framework that appeared six months ago. REST over whatever protocol is trending on Hacker News this week.

This is not an argument against innovation. It is an argument for being intentional about where you innovate. Dan McKinley's "Choose Boring Technology" essay introduced the concept of innovation tokens: every organization has a limited budget for novel technology, and each new, unproven tool spends one of those tokens. Spend them on problems that are genuinely unique to your business, not on solved problems like user authentication or relational data storage.

Boring technology has several concrete advantages for longevity:

- **Larger hiring pools.** Finding a Rails developer in 2030 will be straightforward. Finding someone fluent in a niche framework that peaked in 2024 will not.
- **Battle-tested edge cases.** PostgreSQL has been in production since 1996. Its failure modes are well-documented. A database released last year has failure modes that nobody has discovered yet.
- **Stable ecosystems.** Mature tools have mature libraries, well-maintained documentation, and active security patching. Newer tools often have one-person maintainers who burn out.

At a practical level, this means we default to technologies with at least a five-year production track record and active maintenance by either a large community or a stable commercial entity.

## Designing for Change With Clean Boundaries

No one can predict what a business will need in ten years. The goal is not to build for every possible future --- that leads to over-engineering, which is its own form of unsustainability. The goal is to make the system easy to change when the future arrives.

The single most effective technique is enforcing clean boundaries between components. In practice, this means:

**Separate business logic from infrastructure.** Your rules for calculating shipping costs should not know whether they run inside an AWS Lambda or a Docker container on bare metal. When business logic is isolated, you can change the hosting environment without rewriting the application.

**Define explicit interfaces between services.** Whether you use microservices, a modular monolith, or something in between, every component should interact with others through a well-defined contract. When Service A calls Service B, it should depend on an interface, not an implementation. This means you can replace Service B's internals without Service A noticing.

**Isolate third-party dependencies.** Wrap external APIs in an adapter layer. When Stripe changes their payment API (and they will), you update one adapter file instead of grep-replacing across 47 files. We have seen projects where a single third-party API change required three weeks of work because the SDK was called directly from dozens of places.

The upfront cost of these boundaries is modest --- typically an extra day or two per major component. The payoff is measured in years of easier maintenance.


> See also: [Building Software for the Long Term: Our Approach](/blog/building-software-for-the-long-term-our-approach/)


## Testing as a Sustainability Strategy

Tests are not just a quality tool. They are the single best investment in long-term software sustainability, because they turn implicit knowledge into executable documentation.

Consider what happens when a developer joins a project three years after the original team built it. Without tests, every change is a gamble. The developer modifies a function, deploys, and discovers in production that the function had an undocumented side effect that another module depended on. With a comprehensive test suite, the developer makes the same change, runs the tests, and gets immediate feedback: "This broke the monthly invoice calculation because it expects tax to be computed before discount."

Our testing strategy for sustainable software prioritizes:

1. **Integration tests over unit tests.** A unit test confirms that a function produces the right output for a given input. An integration test confirms that the system behaves correctly when real components interact. For long-lived software, the interactions between components are where the most dangerous bugs hide. We aim for roughly 70 percent integration tests and 30 percent unit tests by count.

2. **Contract tests for APIs.** When your application exposes an API that other systems consume, contract tests verify that you never accidentally break the agreement. Tools like Pact formalize this: you define what the consumer expects, and the provider's test suite verifies it continuously.

3. **Smoke tests for deployments.** A ten-second check that hits the five most critical endpoints after every deployment. This catches configuration errors, missing environment variables, and infrastructure problems that no amount of unit testing can detect.

4. **Mutation testing for confidence.** Standard code coverage tells you which lines were executed during tests. Mutation testing tells you whether the tests would actually catch a bug. Tools like Stryker (JavaScript) or mutmut (Python) systematically introduce small bugs and verify that at least one test fails. We target an 80 percent mutation score on core business logic.

## Documentation That Ages Gracefully

Code comments rot. They start accurate and become misleading as the code around them changes. Long-form documentation in wikis fares even worse --- it is forgotten, unfindable, or contradicted by three other wiki pages.

Sustainable documentation follows three rules:

**Keep it close to the code.** Architecture Decision Records (ADRs) live in the repository, in a `/docs/decisions` directory, versioned alongside the code they describe. Each ADR answers four questions: What was the context? What did we decide? Why? What are the consequences? When a future developer asks "why is this built this way," the answer is one `git log` away.

**Automate what you can.** API documentation generated from OpenAPI specs stays current because it is derived from the code itself. Database schema diagrams generated from migration files reflect reality, not a Confluence page from 2021.

**Write runbooks, not manuals.** Instead of exhaustive documentation that nobody reads, write short, specific runbooks for common operations: "How to add a new payment provider," "How to rotate database credentials," "How to investigate a failed batch job." These are the documents that people actually reach for under pressure, and they are the ones most worth keeping up to date.

A well-maintained ADR log and a set of operational runbooks take less time to maintain than a comprehensive wiki and provide dramatically more value per word.

## Operational Sustainability: Keeping the Lights On Affordably

A system that costs $50,000 per month to host will eventually be replaced, no matter how elegant the code. Operational sustainability means designing for reasonable ongoing costs from day one.

**Right-size your infrastructure.** We have audited projects where a startup was paying $12,000 per month for Kubernetes clusters serving 200 requests per minute --- traffic that a single $40/month virtual machine could handle comfortably. Start simple. A managed database, an application server, and a CDN will carry most applications through their first million users.

**Monitor costs as a first-class metric.** Set up billing alerts at 50 percent, 75 percent, and 90 percent of your expected monthly spend. Review cloud bills monthly with the same rigor you review error rates. We tag every cloud resource with a project and environment label so cost attribution is unambiguous.

**Plan for zero-downtime deployments.** Blue-green deployments or rolling updates ensure that shipping new code never requires a maintenance window. This is not just about uptime --- it is about making deployments routine instead of stressful. Teams that deploy painlessly deploy more often, which means smaller changes, which means fewer bugs, which means less maintenance.

**Automate dependency updates.** Tools like Dependabot or Renovate open pull requests when a library publishes a security patch or minor update. Reviewing a small version bump weekly is sustainable. Discovering that you are 14 major versions behind on a critical library is not.

## The Compound Returns of Sustainable Engineering

Building sustainable software is not charity work. It is a business strategy with measurable returns. A codebase that is easy to change lets you respond to market shifts in days instead of months. A system with clean boundaries lets you replace one component without rewriting the whole application. A well-tested product gives your team the confidence to ship quickly without fear.

The businesses that thrive over decades are the ones that treat their software as a long-term asset, not a disposable prototype. The upfront investment in sustainability is modest. The compounding returns are enormous.

---

If you are building software you want to last, we would like to help. [Get in touch](/contact.html) to talk about how The Proper Motion Company can design and build a system that serves your business for years to come.
