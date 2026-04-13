# How to Write Software Requirements That Actually Work

The gap between what a stakeholder imagines and what an engineering team builds is almost always a requirements problem. Not a talent problem, not a process problem, not a technology problem. Requirements.

A study by the Project Management Institute found that 47 percent of failed projects cite inaccurate requirements as a primary cause. The Standish Group's CHAOS report shows that requirements-related issues (incomplete, changing, or unclear requirements) are involved in over 60 percent of project overruns. These numbers have barely changed in two decades because most organizations treat requirements gathering as a formality rather than a discipline.

This guide provides a practical framework for writing software requirements that lead to successful outcomes, based on patterns we have seen work across dozens of projects.

## The Difference Between Good and Bad Requirements

A bad requirement describes what the author wants to feel. A good requirement describes what the system must do in terms that can be verified.

Consider these examples:

**Bad:** "The system should be fast." This is untestable. Fast compared to what? Under what conditions? For which operations?

**Good:** "The search API returns results within 200 milliseconds for 95 percent of queries when the index contains up to 1 million records, measured at the application boundary excluding network latency."

**Bad:** "The interface should be user-friendly." This is subjective. One person's "user-friendly" is another person's "oversimplified."

**Good:** "A new user with no prior training completes the account setup flow (entering company name, inviting one team member, and creating their first project) within 4 minutes. Validated via usability testing with 5 participants."

**Bad:** "The system should handle high traffic." High is not a number.

**Good:** "The system sustains 10,000 concurrent WebSocket connections with message delivery latency under 50 milliseconds at the 99th percentile."

The pattern is consistent: good requirements include a subject (what component or actor), a verb (what action), a measurable condition (how much, how fast, how many), and a context (under what circumstances).

## Functional Requirements: The What and the When

Functional requirements describe what the system does in response to inputs and conditions. They are the core of any requirements document and the primary basis for development and testing.

Structure functional requirements using this template:

**[ID] [Component] shall [action] when [condition], resulting in [observable outcome].**

Examples:

- FR-101: The notification service shall send an email to the project owner when a team member uploads a file larger than 100 MB, within 60 seconds of upload completion.
- FR-102: The billing module shall calculate prorated charges when a user upgrades their plan mid-billing-cycle, using the number of remaining days divided by total days in the billing period, rounded to the nearest cent.
- FR-103: The authentication system shall lock a user account after 5 consecutive failed login attempts within a 15-minute window. The account unlocks automatically after 30 minutes or manually via admin action.

Each functional requirement should be:

**Atomic.** One requirement per statement. "The system shall send a notification and update the dashboard" is two requirements.

**Traceable.** Each requirement has a unique identifier (FR-101, FR-102) that can be referenced in design documents, test cases, and bug reports.

**Testable.** For every requirement, you should be able to write a test that returns pass or fail. If you cannot, the requirement is too vague.

**Necessary.** Every requirement should trace back to a business objective. If you cannot explain why a requirement exists, it probably should not.

Aim for 20 to 50 functional requirements for a typical feature and 100 to 300 for an entire product MVP. If you have fewer than 20, you are probably missing edge cases. If you have more than 300, you are probably over-specifying implementation details.

## Non-Functional Requirements: The Quality Attributes That Get Ignored

Non-functional requirements (NFRs) define how the system performs its functions. They cover performance, security, reliability, scalability, maintainability, and compliance. Teams routinely skip NFRs during requirements gathering and then discover them during development (as surprises) or after launch (as incidents).

**Performance requirements** specify response times and throughput:
- "API endpoints return responses within 500 milliseconds at the 95th percentile under a load of 1,000 requests per second."
- "The report generation service completes a 90-day financial report within 30 seconds for datasets up to 500,000 transactions."

**Reliability requirements** specify uptime and recovery:
- "The system maintains 99.9 percent uptime measured monthly, excluding scheduled maintenance windows announced 48 hours in advance."
- "In the event of a primary database failure, the system fails over to the replica within 60 seconds with zero data loss for committed transactions."

**Security requirements** specify access control and data protection:
- "All data in transit uses TLS 1.2 or higher. All data at rest uses AES-256 encryption."
- "User sessions expire after 30 minutes of inactivity. Session tokens are invalidated server-side upon logout."
- "The system logs all administrative actions (user creation, role changes, data exports) with timestamp, actor, and action details, retained for 12 months."

**Scalability requirements** specify growth expectations:
- "The system supports 50,000 registered users with 5,000 daily active users at launch, scaling to 500,000 registered users within 18 months without architectural changes."

**Compliance requirements** specify regulatory constraints:
- "The system complies with GDPR Article 17 (right to erasure). Upon a verified deletion request, all personal data is permanently deleted from primary storage within 30 days and from backups within 90 days."

For each NFR category, define at least one requirement. The act of writing these down forces conversations about expectations that would otherwise surface as crises.

## Requirements Gathering Techniques That Surface What Stakeholders Actually Need

Stakeholders rarely know what they need at the level of specificity that developers require. They know their pain points, their goals, and their constraints. It is the analyst's job to translate those into precise requirements.

**Contextual inquiry** means observing users performing their actual work. Sit with a customer support agent for two hours and watch them navigate between six browser tabs, copy data from one system to paste into another, and maintain a personal spreadsheet to track information the official tools do not surface. You will learn more from this observation than from ten stakeholder interviews.

**Event storming** gathers stakeholders, developers, and designers in a room (or virtual board) to map out business events on sticky notes. Each event is something that happens in the domain: "Customer places order," "Payment fails," "Inventory reserved." By mapping the sequence of events, triggers, and actors, the team builds a shared understanding of the domain that directly translates to requirements. A typical event storming session for a medium-complexity feature takes 2 to 3 hours and produces 50 to 100 domain events.

**Scenario walkthroughs** present stakeholders with concrete scenarios and ask "what should happen?" rather than abstract questions about features. Instead of asking "What should the reporting feature do?", walk through: "It is Monday morning. A regional manager opens the dashboard. They need to see last week's sales by store, compare it to the same week last year, and identify which stores missed their target. Walk me through exactly what they do and what they see." This technique surfaces 3 to 5 times more detailed requirements than open-ended interviews.

**Competitive analysis** examines how similar products handle the same problem. This is not about copying features; it is about identifying requirements that your stakeholders take for granted because they have seen them elsewhere. If every competitor has bulk export to CSV, your stakeholders expect it even if they never mention it.

## Managing Requirements Changes Without Losing Control

Requirements will change. Markets shift, stakeholders learn more about their needs, and technical discoveries reveal new constraints. The goal is not to prevent change but to manage it so that changes are deliberate, visible, and their impact is understood.

**Establish a change control process.** Any requirement change after the requirements are baselined requires: a written description of the change, a business justification, an impact assessment from the engineering lead (covering scope, timeline, and dependencies), and explicit approval from the product owner.

**Version your requirements document.** Every approved change increments the version number. Maintain a changelog that records what changed, when, why, and who approved it. This is not bureaucracy; it is the only way to answer the question "why does the system work this way?" six months later.

**Classify requirements by stability.** Some requirements are stable from day one (regulatory compliance, core business logic). Others are exploratory and likely to change (UI layout, notification preferences). Mark unstable requirements explicitly and design the system to accommodate changes in those areas. This classification directly informs architectural decisions: stable requirements can be hardcoded, while unstable requirements need configuration layers or plugin architectures.

**Use time-boxed discovery periods.** Before committing to a full requirements document, spend 1 to 2 weeks in a discovery phase where requirements are explicitly provisional. Stakeholder interviews, prototyping, and technical spikes happen during this period. At the end, baseline the requirements and shift to the formal change control process.

## From Requirements to Successful Delivery

Requirements are not an end in themselves. They are the foundation for every downstream activity: architecture, design, development, testing, and acceptance. A requirements document that sits in a shared drive and is never referenced after the kickoff meeting has failed regardless of how well-written it is.

Make requirements a living part of your delivery process. Reference requirement IDs in user stories and task descriptions. Write test cases that map directly to requirement IDs, creating traceability from requirement to test to defect. During sprint reviews, demonstrate features against their original requirements. During retrospectives, identify which requirements were unclear and improve the process.

The teams that consistently deliver software on time and on budget are not the ones with the best developers or the latest tools. They are the ones that invest in understanding what they are building before they start building it.

---

If your organization struggles with requirements that lead to misaligned deliveries or scope creep, [we would like to hear from you](/contact.html). The Proper Motion Company helps teams establish requirements practices that set projects up for success from day one.
