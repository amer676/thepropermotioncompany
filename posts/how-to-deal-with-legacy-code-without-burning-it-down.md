# How to Deal with Legacy Code Without Burning It Down

Every engineer who inherits a codebase has the same initial impulse: burn it down and start over. The code is tangled, the patterns are outdated, the tests are sparse, the documentation is nonexistent, and the original developers are long gone. But the code works. Users depend on it. Revenue flows through it. And the history of software is littered with companies that destroyed themselves by rewriting systems that just needed better stewardship. Here are the strategies that actually work for improving inherited codebases while keeping the lights on.

## Establish a Baseline Before You Change Anything

The most dangerous thing you can do with a legacy system is start "improving" it before you understand its current behavior. The code may be ugly, but it encodes real business rules, edge case handling, and workarounds for upstream bugs. Changing it without a behavioral baseline means you won't know whether your improvement broke something until a user complains.

**Characterization tests** are your first tool. These aren't tests that verify correct behavior -- they're tests that capture current behavior, correct or not. Run the system, observe its outputs for various inputs, and write tests that assert those outputs. If the system returns a negative number for a specific edge case input, write a test that asserts the negative number. You're not endorsing the behavior; you're documenting it so that future changes can be evaluated against a known baseline.

Michael Feathers describes this approach extensively in "Working Effectively with Legacy Code," and it remains the gold standard. For a web application, characterization tests might be integration tests that hit actual endpoints and verify response bodies. For a data processing system, they might be tests that feed known inputs through the pipeline and snapshot the outputs. The format matters less than the coverage -- aim to characterize the critical paths first (the 20% of code that handles 80% of the traffic or revenue).

**Observability investment** comes next. If the system doesn't have structured logging, add it. If there's no error tracking (Sentry, Bugsnag, Datadog), set it up. If there's no performance monitoring, instrument the critical paths. You need to see what the system is actually doing in production before you can safely change it. This observability layer often reveals surprises: features that appear unused in the code are actually hit thousands of times daily, or a "rarely used" pathway is the one generating the most revenue.


> Related: [How to Build a Booking and Scheduling System](/blog/how-to-build-a-booking-and-scheduling-system/)


## The Seam Technique: Finding Safe Places to Make Changes

Legacy code resists change because everything is entangled. Changing one function requires changing three others, which requires updating a database query, which affects a report somewhere else. The key to working with entangled code is finding seams -- places where you can alter behavior without modifying the existing code.

A seam is a point in the program where you can substitute one behavior for another. Common seam types in legacy systems:

**Object seams:** If a class is instantiated directly throughout the codebase, introduce an interface and a factory. The factory returns the original implementation, but now you can substitute a test double or a new implementation at the factory level without changing every call site.

**Preprocessing seams:** Configuration flags that control behavior at startup. Add a feature flag that routes traffic to either the old code path or a new one. This lets you deploy the new code alongside the old code and switch between them without redeployment.

**Link seams:** In compiled languages, you can substitute dependencies at link time. In interpreted languages, you can monkey-patch or use dependency injection to swap implementations.

The practical workflow: identify the code you want to change, find the nearest seam that isolates it, write characterization tests against the current behavior through that seam, make your change, and verify the tests still pass (or fail in expected ways if you're intentionally changing behavior).

When no seam exists, you create one. This is the lowest-risk type of refactoring: extracting a method, introducing a parameter, or wrapping a dependency -- changes that alter the code structure without altering its behavior. These structural changes create the seams that enable the substantive changes.

## Incremental Refactoring: The Boy Scout Rule Applied Systematically

The Boy Scout Rule -- leave the code better than you found it -- is the single most effective strategy for improving legacy code over time. Every time you touch a file to fix a bug or add a feature, make one small structural improvement in that file. Rename a misleading variable. Extract a method from a 200-line function. Add a missing type annotation. Replace a magic number with a named constant.

These tiny improvements compound over weeks and months. The frequently-modified files improve fastest (which is exactly right, since those are the files where improvement has the most impact). Files that no one touches remain unchanged (which is also fine, since stable code doesn't need improvement).

To make this systematic rather than ad hoc, maintain a **technical debt register**. This is a living document that catalogs known problems: "The UserService class has 47 methods and should be split," "The billing calculation duplicates logic in three places," "The notification system uses deprecated APIs." Each item includes a severity rating (how much does this hurt day-to-day?), a scope estimate (how much work to fix?), and the affected files.

When planning sprints, allocate 15-20% of capacity to technical debt items from the register, prioritized by the intersection of severity and opportunity (is someone already working in that area of the code?). This sustained investment prevents debt from accumulating faster than you're paying it down, which is the failure mode of most legacy codebases: the team is always too busy shipping features to improve the foundation, so the foundation erodes until feature delivery itself becomes impossibly slow.


> See also: [How to Plan and Execute a Software Migration](/blog/how-to-plan-and-execute-a-software-migration/)


## Dependency Archaeology: Updating Without Breaking

Legacy systems often depend on outdated libraries with known security vulnerabilities, deprecated APIs, and missing features. Updating dependencies is necessary but risky -- a library update can change behavior in subtle ways that break the application.

**Dependency auditing** reveals the landscape. Run your language's audit tool (`npm audit`, `pip audit`, `bundle audit`) to identify vulnerabilities. List all dependencies with their current version, latest version, and changelog between the two. Categorize updates into: patch updates (low risk, usually safe), minor updates (moderate risk, may change behavior), and major updates (high risk, likely breaking changes).

**Update incrementally, one dependency at a time.** Don't batch updates. When something breaks, you need to know which update caused it. For each update: read the changelog thoroughly, run the full test suite, deploy to a staging environment, and run smoke tests against the staging deployment. For major version updates, create a dedicated branch and invest the time to address all breaking changes before merging.

**Dependency pinning** is essential in legacy systems. Pin exact versions in your lock file (package-lock.json, Gemfile.lock, poetry.lock). Never use floating version specifiers (^, ~) for critical dependencies. Each update should be an intentional, reviewed change -- not a surprise side effect of a fresh install.

For dependencies that are truly abandoned (no updates in 2+ years, no maintainer), you have three options: fork the library and maintain it yourself (expensive but gives you control), replace it with a maintained alternative (costly upfront but better long-term), or isolate it behind an adapter so the rest of your code doesn't depend on it directly (pragmatic middle ground that limits blast radius).

## Strangling the Monolith One Module at a Time

If the legacy system is a monolith that needs to evolve toward a more modular architecture, the strangler fig approach works at the module level. Identify a well-bounded module (billing, notifications, reporting), build its replacement as a separate service, route traffic to the new service, and eventually remove the old module from the monolith.

The key is choosing the right module to extract first. The ideal candidate has: clear boundaries (few inbound dependencies from other modules), high change velocity (the team modifies it frequently), and independent data (it doesn't share database tables with other modules in complex ways). Notification systems and reporting services often make good first extractions because they consume data from other modules but don't produce data that other modules depend on.

Before extracting, define the interface between the module and the rest of the monolith. What data does the module consume? What events does it emit? What API does it expose to the monolith? This interface becomes the contract between the new service and the legacy system. Build the interface as an explicit API within the monolith first, routing internal calls through it. This "modularize within the monolith" step verifies that the interface is correct before you take on the complexity of a network boundary.

The extraction itself follows: build the new service behind the defined interface, deploy it alongside the monolith, route traffic to the new service for the extracted module's functionality (using a feature flag or routing rule), run both in parallel until you're confident the new service is correct, then remove the old module code from the monolith.

Don't extract everything. Some modules are fine as part of a monolith. The goal is a "modular monolith" where each module has clear boundaries and can be extracted if needed -- not necessarily a microservices architecture where every module is a separate deployment.

---

If you've inherited a legacy codebase and need a strategy for improving it without disrupting the business, [let's talk](/contact.html). We help teams develop pragmatic modernization plans that deliver value incrementally while keeping production systems stable.
