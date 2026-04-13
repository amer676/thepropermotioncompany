# How to Budget for Ongoing Software Maintenance

The launch is not the finish line. Every founder who has built custom software discovers this truth, sometimes painfully. The initial build gets the budget scrutiny, the timelines, the stakeholder reviews. But the software that runs your business on day 1,000 matters far more than the software you shipped on day 1, and keeping it healthy requires a maintenance budget that too many organizations treat as an afterthought. Understanding what maintenance actually involves, what it costs, and how to plan for it is the difference between software that appreciates as an asset and software that decays into a liability.

## What Software Maintenance Actually Includes

Maintenance is an umbrella term that covers at least five distinct categories of work, each with different cost profiles and urgency levels.

Corrective maintenance is fixing bugs. No matter how thorough the testing, production software encounters edge cases, unexpected user behavior, and environmental changes that surface defects. A well-built application might see two to five bug reports per month. Most are minor, but occasionally a critical issue requires immediate attention. Budget for 10 to 20 hours per month of corrective work as a baseline.

Adaptive maintenance is keeping the software compatible with its environment. Operating systems update. Browsers change behavior. Third-party APIs deprecate endpoints. Cloud providers retire services. SSL certificates expire. The Python or Node.js runtime your application depends on reaches end of life and stops receiving security patches. None of this is optional. Ignoring it does not save money; it defers cost while accumulating risk.

Perfective maintenance is improving the software based on user feedback and evolving requirements. New features, UX improvements, performance optimizations, and workflow adjustments fall here. This is the category most organizations want to spend on but often cannot because corrective and adaptive work consumes the budget.

Preventive maintenance is proactive work to avoid future problems: refactoring brittle code, improving test coverage, upgrading dependencies before they become incompatible, and optimizing database queries before they cause performance issues. This is the category most organizations skip because the benefits are invisible until neglect causes a crisis.

Security maintenance is patching vulnerabilities in your dependencies, updating authentication mechanisms, rotating credentials, and responding to security advisories. The average software project has dozens of direct dependencies and hundreds of transitive dependencies. Each is a potential attack vector that requires ongoing attention.


> Related: [How Much Does Custom Software Development Cost in 2024](/blog/how-much-does-custom-software-development-cost-in-2024/)


## The 15-20% Rule and Why It Exists

The industry standard for software maintenance budgets is 15 to 20 percent of the original development cost per year. If your application cost $300,000 to build, expect to spend $45,000 to $60,000 per year maintaining it. This number surprises many founders, but it reflects decades of empirical data across thousands of software projects.

Where does that money go? Roughly:

- 20% on corrective maintenance (bug fixes)
- 25% on adaptive maintenance (environment compatibility)
- 30% on perfective maintenance (new features and improvements)
- 15% on preventive maintenance (proactive quality work)
- 10% on security maintenance (vulnerability patching, audits)

These proportions shift based on the software's age and quality. A well-built application in its first two years skews toward perfective maintenance, spending most of the budget on new features because there are few bugs and the technology stack is current. An older application that was not maintained proactively skews toward corrective and adaptive work, spending most of the budget on keeping the lights on.

The 15-20% figure also assumes the application was well-built initially. Software with significant technical debt, poor test coverage, or outdated architectural patterns can cost 25 to 40 percent of the original build cost per year to maintain. This is one of the strongest arguments for investing in quality during the initial build: every dollar saved by cutting corners during development is repaid multiple times in maintenance costs.

## Infrastructure Costs That Scale with Usage

Beyond development effort, your software incurs ongoing infrastructure costs that scale with usage. These are often underestimated during initial budgeting.

Cloud hosting is the largest ongoing expense for most applications. A typical SaaS application serving a few thousand users might cost $500 to $2,000 per month on AWS, Google Cloud, or similar providers. As usage grows, costs grow. Database instances get larger. Storage accumulates. Data transfer fees add up. CDN bandwidth increases. A startup that budgets $500 per month for hosting at launch might be spending $5,000 per month two years later without any architectural changes, purely from usage growth.

Third-party service costs add up quietly. A transactional email service like SendGrid costs $15 per month at low volumes but $400 per month at 500,000 emails. An error monitoring tool like Sentry costs $26 per month for a small team but $80 per month for 100,000 events. A feature flagging service, an APM tool, a log management platform, each adds $50 to $300 per month. In aggregate, third-party services often cost as much as the core hosting infrastructure.

Domain registration, SSL certificates (if not using free Let's Encrypt certificates), and DNS hosting are small but recurring costs that should be tracked. More importantly, they need to be renewed, and letting a domain or certificate expire is a preventable outage.

Create a spreadsheet that lists every recurring cost: hosting, databases, CDN, email service, monitoring tools, analytics, third-party APIs, domain registration, and any other services your application depends on. Review it quarterly. Services you added during development but no longer use should be canceled. Services approaching pricing tier boundaries should be evaluated for alternatives.


> See also: [Why Software Estimation Is So Hard and How to Get Better at It](/blog/why-software-estimation-is-so-hard-and-how-to-get-better-at-it/)


## Dependency Management: The Hidden Time Sink

Modern software applications depend on hundreds of open-source packages. A typical Node.js project has 200 to 800 transitive dependencies. A Python project might have 50 to 200. Each dependency is maintained by someone else, evolving on its own schedule, and occasionally introducing breaking changes or security vulnerabilities.

Dependabot, Renovate, or similar tools automate the detection of outdated and vulnerable dependencies. But detection is the easy part. Evaluating whether an update is safe, testing it against your application, and deploying it requires human judgment and time.

The cost of dependency management scales with neglect. Updating a library that is one major version behind is usually straightforward. Updating a library that is three major versions behind can require rewriting significant portions of your application. We have seen organizations spend $50,000 or more on a single dependency upgrade that would have cost $2,000 if done incrementally.

The practical approach is to schedule dependency review and updates on a monthly cadence. Security patches should be applied within days of disclosure. Minor and patch version updates can be batched monthly. Major version upgrades should be planned and scheduled, typically quarterly, with adequate testing time.

## Planning for the Unplanned: Incident Response and Emergency Budget

Production incidents happen to every software system. Servers crash, databases corrupt, third-party services go down, and security breaches occur. Having a financial buffer for emergency response prevents these events from derailing your regular maintenance budget.

Set aside 10 to 15 percent of your annual maintenance budget as an incident reserve. If your annual maintenance budget is $50,000, keep $5,000 to $7,500 available for emergencies. In years with no major incidents, roll the reserve into preventive maintenance. In years with a significant incident, the reserve prevents you from borrowing against next quarter's feature development.

The incident reserve should also cover the cost of post-incident improvements. After a database outage, you might invest in automated backups and failover. After a security breach, you might hire a penetration testing firm. These costs are unpredictable in timing but inevitable over the software's lifetime.

Document your incident response process before you need it. Who gets notified when the application goes down? Who has access to production systems? What is the communication plan for affected users? What is the escalation path if the primary team cannot resolve the issue? Answering these questions during a crisis costs time and mistakes. Answering them in advance costs only a few hours of planning.

## Structuring the Maintenance Engagement

How you structure your ongoing maintenance relationship matters as much as how much you spend. There are three common models.

A retainer agreement reserves a fixed number of hours per month (typically 20 to 40 hours) at an agreed rate. Unused hours may or may not roll over depending on the agreement. This model provides predictable costs and guaranteed availability. It works well when the workload is relatively steady and the relationship is ongoing.

Time-and-materials billing charges for actual hours spent. This offers flexibility for variable workloads but provides less cost predictability. It works well when maintenance needs are sporadic or when the scope is uncertain.

A managed services model, where the development partner takes full responsibility for the application's health at a fixed monthly fee, is the most hands-off option. The partner handles monitoring, updates, bug fixes, and small improvements within the agreed scope. This works well for organizations without internal technical staff who want a single point of accountability.

Regardless of the model, establish clear expectations for response times (critical issues within 2 hours, standard issues within 1 business day), communication cadence (weekly or biweekly status updates), and scope boundaries (what counts as maintenance versus new development). These expectations prevent misalignment that leads to frustration on both sides.

---

If you have custom software that needs ongoing care, or if you are planning a build and want to understand the full lifecycle cost, [we would be glad to talk through it](/contact.html). Maintenance is not glamorous, but it is what keeps your software working for you instead of against you.
