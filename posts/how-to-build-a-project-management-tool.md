# How to Build a Project Management Tool

The project management software market is enormous — Jira, Asana, Monday, Linear, Notion, ClickUp, Basecamp, and dozens of others. And yet, teams continue to build custom project management tools. Not because they want to compete with Jira, but because their work does not fit Jira's assumptions. A construction company managing permits, inspections, and subcontractor schedules does not think in sprints. A law firm tracking matter deadlines, filings, and billable hours does not think in story points. A video production studio coordinating shoots, post-production, and client reviews does not think in kanban columns.

When the domain has enough specific structure that a generic tool requires more configuration than it saves, a custom project management tool becomes the right investment. This post covers the core systems you need to build, the data model decisions that determine flexibility, and the features that separate a usable tool from one that collects dust.

## The Data Model: Projects, Tasks, and the Things Between Them

Every project management tool starts with a deceptively simple question: what is a task? In a generic tool, a task is a flat record with a title, description, assignee, status, and due date. In a domain-specific tool, a task carries the structure of the domain itself.

For a construction project management tool, a "task" might be a permit application that has a submission date, a jurisdiction, an expected review period, a set of required attachments, and dependencies on other permits. For a law firm, a "task" might be a filing that has a court, a deadline type (statutory vs. court-ordered, with different extension rules), related documents, and associated billable time.

The data model should accommodate this domain structure without becoming rigid. A practical approach uses three layers:

**Core entities** are common across all use cases: Project, Task, User, Comment, Attachment, Activity. These have fixed schemas with well-defined relationships.

**Custom fields** extend core entities with domain-specific attributes. A custom field definition specifies a name, data type (text, number, date, single-select, multi-select, user reference), and which entity type it belongs to. Field values are stored in a separate table, linked to the entity by a foreign key. This EAV (Entity-Attribute-Value) pattern is flexible but requires careful indexing — a GIN index on a JSONB column in PostgreSQL is more practical than a traditional EAV table for most applications.

**Workflow definitions** govern how tasks move through states. Rather than hardcoding a status enum (To Do, In Progress, Done), define workflows as state machines: a set of states, a set of transitions between states, and guards on each transition (which roles can trigger it, what fields must be populated). A construction tool might have: Draft -> Submitted -> Under Review -> Approved / Revision Required. A legal tool might have: Drafted -> Internal Review -> Filed -> Acknowledged -> Closed. The workflow engine evaluates transition guards and records the full state-change history for audit purposes.

## Dependencies, Scheduling, and the Critical Path

For many domains, the relationships between tasks matter more than the tasks themselves. A permit cannot be submitted until the engineering drawings are complete. Electrical rough-in cannot start until framing passes inspection. Post-production cannot begin until all footage is shot.

Task dependencies come in four types (from project management theory):
- **Finish-to-Start (FS):** Task B cannot start until Task A finishes. The most common type.
- **Start-to-Start (SS):** Task B cannot start until Task A starts.
- **Finish-to-Finish (FF):** Task B cannot finish until Task A finishes.
- **Start-to-Finish (SF):** Task B cannot finish until Task A starts. Rare in practice.

The dependency graph enables two critical features:

**Automatic scheduling.** Given task durations and dependencies, the system can compute the earliest possible start date for each task. When a task slips (the actual duration exceeds the estimated duration), all downstream tasks are automatically rescheduled. This forward-scheduling algorithm is a topological sort of the dependency graph combined with date arithmetic.

**Critical path identification.** The critical path is the longest chain of dependent tasks through the project. Any delay on a critical-path task delays the entire project. Highlighting the critical path on a Gantt chart (or a timeline view appropriate to the domain) focuses attention on the tasks that actually determine delivery date.

Implementing the Gantt chart itself is a significant frontend effort. Libraries like DHTMLX Gantt, Bryntum, or Frappe Gantt provide the rendering, but the interaction design — dragging to resize tasks, drawing dependency arrows, zooming between day/week/month views — requires thoughtful customization to feel natural in your specific domain.

## Real-Time Collaboration and Activity Streams

Project management is inherently collaborative. Multiple people update the same project, often simultaneously. The system must handle this gracefully.

**Optimistic UI updates** let users see their changes immediately without waiting for a server round trip. The client applies the change locally, sends it to the server, and reconciles if the server rejects it. For most project management operations (updating a status, adding a comment, changing an assignee), conflicts are rare and resolution is straightforward: last-write-wins per field.

**Real-time updates** via WebSocket connections (or Server-Sent Events for simpler architectures) push changes from one user to all other users viewing the same project. When a team member marks a task as complete, other users' task boards update within seconds. The implementation is a pub/sub pattern: each project is a channel, connected clients subscribe to the channel, and any mutation publishes an update event.

**Activity streams** record every change as a structured event: "Sarah changed the status of 'Foundation Pour' from 'Scheduled' to 'Completed' at 2:14 PM." The activity stream serves three purposes: it provides a chronological narrative of project progress, it enables undo (by replaying events in reverse), and it satisfies audit requirements for regulated industries.

The activity stream should be filterable: show only status changes, show only comments, show changes by a specific team member, show changes to a specific task. For long-running projects, the activity stream can accumulate thousands of entries; pagination and efficient time-range queries (a BRIN index on the timestamp column in PostgreSQL) keep performance manageable.

## Notifications and Escalation

A project management tool generates a firehose of events. The notification system's job is to filter that firehose down to the information each user actually needs.

**Subscription-based notifications:** Users are automatically subscribed to tasks they are assigned to, tasks they created, and tasks they have commented on. They can manually subscribe to additional tasks or projects. Each event is evaluated against each user's subscriptions to determine who should be notified.

**Notification channels:** In-app notifications (a bell icon with an unread count), email digests (aggregated notifications sent hourly or daily rather than per-event), and push notifications (for mobile users who need time-sensitive alerts). Users should control which channels they receive and for which event types.

**Escalation rules** handle the critical case: a task is overdue and no one is acting on it. Escalation is a chain: 24 hours overdue, notify the assignee. 48 hours overdue, notify the assignee's manager. 72 hours overdue, notify the project owner. Each step in the chain fires only if the task remains in the triggering state (not updated, not reassigned). Escalation rules are implemented as scheduled jobs that query for tasks matching the trigger criteria.

**Digest intelligence:** A daily digest email that simply lists all 47 changes from the previous day is not useful. A digest that groups changes by project, highlights overdue items, and surfaces tasks that need the user's action is genuinely valuable. The digest template should be structured around "things you need to act on" rather than "things that happened."

## Reporting and Visibility

Every stakeholder needs a different view of project status.

**For team members:** A personal dashboard showing their assigned tasks sorted by due date, grouped by project. Tasks overdue are highlighted. Tasks due this week are prominent. Tasks due later are present but de-emphasized.

**For project managers:** A project-level dashboard showing overall progress (percentage of tasks completed, weighted by estimated effort), the current critical path, a burndown or burnup chart (depending on the methodology), and a risk register — tasks that are approaching their due date with no recent activity.

**For executives:** A portfolio view showing all active projects, their health status (on track, at risk, off track — computed from schedule variance and the ratio of overdue to total tasks), and resource allocation (how many hours of each team member are committed across projects).

**Custom reports** should be buildable without developer intervention. A report builder that lets users select dimensions (project, assignee, status, custom fields), measures (count, sum of estimated hours, average days in status), filters, and grouping levels covers most ad-hoc reporting needs. The implementation is a dynamic SQL query builder with parameterized filters — carefully sanitized to prevent injection.

Export to CSV, Excel, and PDF ensures reports can be shared with stakeholders who do not have access to the tool.

---

If your team's work does not fit the assumptions of off-the-shelf project management tools, [let us discuss](/contact.html) what a custom solution built around your actual workflow would look like. We have built project management systems for industries from construction to legal to creative production, and the common thread is always the same: the tool should adapt to the work, not the other way around.
