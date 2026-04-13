# Building Notification Systems: Push, Email, SMS, and In-App

Notifications are the circulatory system of modern applications. They carry time-sensitive information from the system to the user across multiple channels, and when they work well, they are invisible infrastructure — the user gets the right information at the right time through the right channel. When they work poorly, they are either a source of relentless noise that trains users to ignore everything, or a silent void where critical alerts disappear.

Building a notification system that scales across channels while respecting user preferences is a significant engineering undertaking. This post covers the architecture, the channel-specific considerations, and the preference and throttling systems that determine whether your notifications help or annoy.

## The Notification Pipeline Architecture

A well-designed notification system separates event generation from notification delivery through a pipeline with distinct stages.

**Stage 1: Event Emission.** Your application code emits domain events when something notification-worthy happens: an order ships, a comment is posted, a payment fails, a threshold is breached. The application should not decide how to notify or whom to notify — it simply records that an event occurred. This separation is critical because notification logic changes frequently (new channels, new preference rules, new notification types) and should not be tangled with business logic.

Events are written to a message queue (RabbitMQ, Amazon SQS, or Kafka for high-volume systems). Each event includes the event type, the relevant entity IDs, a timestamp, and any context data needed for message rendering (the order total, the commenter's name, the specific threshold that was breached).

**Stage 2: Routing.** A routing worker consumes events from the queue and determines who should be notified and through which channels. This is where subscription rules, user preferences, and organizational escalation policies are evaluated.

The routing logic answers several questions per event:
- Which users are subscribed to this event type? (A comment on a task notifies the task's assignee and watchers.)
- For each user, which channels are enabled for this event type? (User A wants email for comments; User B wants only in-app.)
- Are any throttling rules in effect? (Do not send more than one email per hour for comment notifications; batch them into a digest.)
- Are any quiet-hours rules in effect? (Do not send push notifications between 10 PM and 7 AM in the user's timezone.)

The output of routing is a set of delivery tasks, each specifying a recipient, a channel, and the event data. These tasks go into channel-specific delivery queues.

**Stage 3: Rendering.** Each channel has its own rendering pipeline. An email notification needs a subject line, HTML body, and plain-text fallback. A push notification needs a title, body (limited to roughly 178 characters on iOS), and an optional deep link. An SMS needs a plain-text body under 160 characters (or segmented into multiple messages). An in-app notification needs a structured data payload that the frontend renders.

Templates are per-channel, per-event-type, and often per-locale. A template engine (Handlebars, Liquid, or Jinja2) renders the event data into the channel-specific format. Templates should be editable by non-engineers — a product manager should be able to change email copy without a code deployment.

**Stage 4: Delivery.** Channel-specific workers consume from their respective queues and deliver the notification through the appropriate provider:
- **Email:** SMTP relay (Amazon SES, Postmark, SendGrid). Use a dedicated sending domain with properly configured SPF, DKIM, and DMARC records. Monitor bounce rates — a bounce rate above 2% degrades sender reputation and increases the likelihood of spam filtering.
- **Push (mobile):** Apple Push Notification Service (APNs) for iOS, Firebase Cloud Messaging (FCM) for Android. Both require device-specific tokens that must be stored and refreshed as users install, update, and uninstall your app.
- **Push (web):** The Web Push API with VAPID authentication. Browser support is broad (Chrome, Firefox, Edge, Safari 16+), but permission grant rates are low (typically 5-15%), so this channel supplements rather than replaces others.
- **SMS:** Twilio, Vonage, or Amazon SNS. SMS is expensive (roughly $0.0075 per segment in the US, more internationally) and should be reserved for high-priority, time-sensitive notifications. Include opt-out instructions ("Reply STOP to unsubscribe") to comply with TCPA regulations.
- **In-app:** Written directly to the notification store (a database table or dedicated service). The frontend polls or subscribes via WebSocket for real-time updates.

**Stage 5: Tracking.** Every delivery attempt is logged with its outcome: delivered, bounced, failed, opened (for email, via tracking pixel), clicked (via redirect link), dismissed (for in-app). This data feeds the analytics that inform notification strategy and the debugging tools that help when a user reports "I never received that email."


> Related: [Privacy-First Software Development as Competitive Advantage](/blog/privacy-first-software-development-as-competitive-advantage/)


## The User Preference System

A notification system without user preferences is a spam cannon. Users must be able to control what they receive and through which channels.

The preference model has three dimensions:

**Event category.** Group related event types into user-facing categories: "Task updates," "Billing alerts," "Security notifications," "Marketing." Users configure preferences at the category level, not the individual event-type level — presenting 50 individual event types in a settings page is overwhelming.

**Channel.** For each category, the user selects which channels they want: email, push, SMS, in-app. Some categories may have mandatory channels that cannot be disabled (security alerts must always send email) while others are fully configurable.

**Frequency.** For channels that support batching (primarily email), users choose between real-time delivery and digest delivery. A daily digest at 9 AM aggregates overnight activity into a single email. An hourly digest bundles bursts of activity (ten comments in quick succession) into a readable summary rather than ten separate emails.

Store preferences in a dedicated table with a compound key of (user_id, category, channel). Default preferences should be sensible — every new user should receive the most important notifications without having to configure anything. The default preferences should err on the side of "slightly too many notifications" rather than "user misses critical information."

## Throttling and Deduplication

Without throttling, a notification system will abuse its users. A Slack-style application where someone is mentioned in a busy channel could generate 100 notifications in an hour. A monitoring dashboard where a threshold is breached repeatedly could generate the same alert every 30 seconds.

**Per-user, per-category rate limiting** caps the number of notifications a user receives within a time window. A token-bucket algorithm per (user, category, channel) tuple is the standard implementation. The bucket refills at a configured rate (e.g., 5 email notifications per hour for the "comments" category), and notifications that arrive when the bucket is empty are either batched into the next digest or silently dropped (for low-priority categories).

**Deduplication** prevents the same notification from being sent twice. This happens more often than expected — a retry after a transient failure, a race condition between two event emitters, a database trigger that fires twice. Each delivery task should carry an idempotency key derived from the event ID and the recipient. The delivery worker checks this key against a deduplication cache (Redis with a TTL) before proceeding.

**Coalescing** groups multiple related notifications into a single message. "Alice, Bob, and 3 others commented on your task" is more useful than five separate notifications. The coalescing window (how long to wait for additional events before sending) is a tradeoff between timeliness and grouping. A 30-second window works for real-time channels; a 5-minute window works for email.


> See also: [How to Build a Booking and Scheduling System](/blog/how-to-build-a-booking-and-scheduling-system/)


## Debugging and Observability

When a user says "I did not get the notification," you need to trace the event through every stage of the pipeline to find where it was lost or delayed.

**Event audit log.** Every event, routing decision, rendering, delivery attempt, and delivery outcome is logged with a correlation ID that links them together. Given an event ID, you can reconstruct the full path: "Event emitted at 14:30:01 -> routed to User A (email, push) and User B (in-app) at 14:30:02 -> email rendered at 14:30:03 -> email delivered via SES at 14:30:04 -> SES reported delivery at 14:30:06."

**Delivery dashboard.** A real-time view of notification volume by channel, delivery success rate, and latency (time from event emission to delivery). Alert when success rates drop below thresholds (email delivery below 98%, push delivery below 95%).

**User-facing notification log.** Let users see their own notification history: what was sent, when, through which channel, and what the content was. This self-service tool eliminates the most common support ticket ("I did not get the email") by letting the user verify whether the notification was sent and to which email address.

**Provider status monitoring.** Email providers have outages. APNs has occasional delivery delays. Your monitoring should track provider response times and error rates independently, so you can distinguish "our system is broken" from "the provider is having issues."

## Scaling Considerations

At low volume (thousands of notifications per day), the notification pipeline can run as a set of background jobs in your main application. At high volume (millions per day), it becomes its own service with dedicated infrastructure.

**Queue partitioning.** At high volume, a single delivery queue becomes a bottleneck. Partition by channel (separate queues for email, push, SMS, in-app) and, within each channel, by priority (urgent notifications skip the queue). Critical notifications like two-factor authentication codes must have a dedicated fast path that is not affected by a burst of lower-priority notifications.

**Provider rate limits.** Every delivery provider has rate limits. SES allows 14 emails per second by default (more with a sending rate increase request). FCM allows 600,000 messages per minute. Your delivery workers must respect these limits using a global rate limiter, typically implemented as a distributed token bucket backed by Redis.

**Database write throughput.** In-app notifications generate a write for every user-event pair. A single event that notifies 10,000 users generates 10,000 database writes. Batch inserts (multi-row INSERT statements) and write-optimized tables (minimal indexes, append-only structure) handle this. For very high volumes, a dedicated notifications database (separate from the main application database) prevents notification writes from affecting application performance.

**Cleanup and archival.** Notifications older than 90 days are rarely accessed. Move them to cold storage (compressed, archived) and maintain only recent notifications in the hot database. The cleanup job should run during off-peak hours and delete in batches to avoid long-running transactions.

---

If your application needs a notification system that works across channels, respects user preferences, and scales without becoming a maintenance burden, [we should talk](/contact.html). We have built notification infrastructure that delivers millions of messages daily, and we can help you avoid the pitfalls we have already navigated.
