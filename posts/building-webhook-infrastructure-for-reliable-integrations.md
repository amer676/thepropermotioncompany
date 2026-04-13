# Building Webhook Infrastructure for Reliable Integrations

Webhooks are deceptively simple. An HTTP POST request to a URL when something happens — what could go wrong? In practice, quite a lot. The receiving server is down. The payload is malformed. The same event fires twice. The endpoint takes ten seconds to respond, and now your outbound queue is backed up. A webhook that works on a demo is trivial; a webhook infrastructure that remains reliable when processing millions of events per day across hundreds of consumer endpoints is a genuine engineering challenge.

This post covers both sides of the webhook equation: building infrastructure to send webhooks reliably, and building infrastructure to receive them safely. Whether you are adding webhook capabilities to your SaaS product or integrating with third-party systems that push data to you, the patterns here apply.

## Anatomy of a Reliable Outbound Webhook System

Sending webhooks is a publisher-subscriber problem with a twist: your subscribers are HTTP endpoints you do not control, running on infrastructure you cannot observe, with reliability characteristics you cannot predict. Your system must be resilient to all of their failure modes.

The core architecture has four components:

**Event generation** happens in your application layer. When a domain event occurs (an order is placed, a user updates their profile, a payment fails), the application emits an event record. This record should be written to a durable store — an events table in your primary database or a message queue — in the same transaction as the state change that produced it. This transactional outbox pattern ensures that you never lose an event, even if your webhook-delivery process crashes immediately after the state change.

**Event fan-out** matches events to subscriptions. Each webhook consumer registers for specific event types (e.g., "order.created," "payment.failed"). The fan-out process reads new events from the outbox, looks up matching subscriptions, and creates a delivery task for each event-subscription pair. These delivery tasks go into a job queue — Sidekiq, Bull, Celery, or a managed service like Amazon SQS.

**Delivery execution** dequeues a task, serializes the event payload to JSON, signs it with the subscription's secret key (HMAC-SHA256 is the standard), and sends the HTTP POST. The response is recorded: status code, response time, and any response body.

**Retry and failure handling** is where most webhook implementations fall apart. A robust retry strategy uses exponential backoff with jitter: first retry after 30 seconds, then 2 minutes, then 8 minutes, then 30 minutes, up to a maximum interval of 24 hours. The jitter (adding a random offset to each retry interval) prevents thundering-herd problems when a consumer recovers from an outage and suddenly receives hundreds of retried deliveries simultaneously.

After a configurable number of consecutive failures (typically 5-10), the subscription should be marked as "disabled" and the account owner notified. Continuing to hammer a dead endpoint wastes resources and can trigger abuse-detection systems on the consumer's hosting provider.


> Related: [How to Build a Booking and Scheduling System](/blog/how-to-build-a-booking-and-scheduling-system/)


## Payload Design and Versioning

The webhook payload is your API's public contract with consumers. Changing it carelessly breaks integrations silently — the consumer's endpoint returns 200 but processes the data incorrectly because a field moved or changed type.

Practical payload design principles:

**Include a type field and a version field.** Every payload should contain `"type": "order.created"` and `"api_version": "2025-01-15"`. The version is a date-based API version, not a semver. Consumers register for a specific API version, and your fan-out process transforms the internal event representation into the versioned payload format for each subscription.

**Use fat payloads, not just IDs.** A payload that contains only `{"order_id": "abc123"}` forces the consumer to make an API call back to you to get the actual data. This creates a tight coupling, increases latency, and means your API must handle a spike of read requests every time you emit a batch of webhooks. Include the full resource state in the payload. The payload should be self-contained.

**Use an envelope structure.** Wrap the resource data in a standard envelope:

```json
{
  "id": "evt_abc123",
  "type": "order.created",
  "api_version": "2025-01-15",
  "created_at": "2025-05-24T14:30:00Z",
  "data": {
    "order": { ... }
  }
}
```

The envelope fields are stable across all event types; the `data` field varies by type. This lets consumers route events to the correct handler without parsing the inner data structure.

**Ensure idempotency.** Include a unique event ID (`evt_abc123`) in every payload. Consumers should use this ID to deduplicate events. On your side, the same event-subscription pair should always produce the same event ID, so retries are naturally idempotent from the consumer's perspective.

## Securing Webhook Delivery

Webhooks are inbound HTTP requests to your consumer's perspective, which means they face the same security concerns as any public endpoint: spoofing, replay attacks, and data tampering.

**Signature verification** is non-negotiable. When creating a subscription, generate a random secret key (at least 32 bytes, base64-encoded). On every delivery, compute `HMAC-SHA256(secret, raw_request_body)` and include the result in a header (e.g., `X-Webhook-Signature`). The consumer computes the same HMAC using their copy of the secret and compares. If they do not match, the request is rejected.

**Timestamp headers** prevent replay attacks. Include a `X-Webhook-Timestamp` header with the Unix timestamp of the delivery attempt. The consumer verifies that the timestamp is within an acceptable window (typically 5 minutes). The HMAC should be computed over the concatenation of the timestamp and the body, so an attacker cannot replay an old request with a new timestamp.

**Secret rotation** should be supported without downtime. Allow subscriptions to have two active secrets simultaneously — the current and the previous. During rotation, sign payloads with the new secret and include a secondary signature with the old secret. Consumers can verify against either. After a grace period, the old secret is revoked.

**IP allowlisting** is an additional layer some consumers require. Publish a stable set of IP addresses from which your webhooks originate. If you deploy to a cloud provider, use NAT gateways or a dedicated egress proxy to ensure outbound webhook traffic comes from a predictable IP range.


> See also: [Privacy-First Software Development as Competitive Advantage](/blog/privacy-first-software-development-as-competitive-advantage/)


## Building a Reliable Inbound Webhook Receiver

When you are on the receiving end — consuming webhooks from Stripe, GitHub, Shopify, or any third-party — a different set of concerns applies.

**Respond immediately, process asynchronously.** Your webhook endpoint should validate the signature, write the raw payload to a durable queue, and return HTTP 200 within 500 milliseconds. All actual processing happens asynchronously from the queue. This decouples your processing speed from the sender's timeout expectations and prevents webhook retries caused by slow processing.

**Handle duplicates.** Webhook senders retry on failure, and network conditions can cause the same delivery to arrive twice even when both succeed. Use the event ID from the payload as an idempotency key. Before processing, check if you have already processed an event with that ID. A simple approach is an `idempotency_keys` table with a unique index on the event ID and a TTL-based cleanup job.

**Validate rigorously.** Verify the HMAC signature before doing anything else. Parse the payload against an expected schema. Log and alert on unexpected event types or schema violations — they often indicate that the sender has rolled out a breaking change.

**Monitor and alert on gaps.** Webhook delivery is best-effort from the sender's perspective. If you normally receive 100 `payment.succeeded` events per hour and suddenly receive zero, something is wrong — but you will not know unless you monitor for absence. A simple heartbeat check queries your events table: "Have I received any events of type X in the last N minutes?" If not, alert.

## Operational Concerns at Scale

As webhook volume grows, several operational challenges surface:

**Queue depth monitoring.** If your delivery queue grows faster than you can drain it, delivery latency increases. Monitor queue depth and set alerts at thresholds that correspond to your SLA. If you promise delivery within 5 minutes, alert when queue depth implies a 3-minute wait.

**Consumer-specific rate limiting.** Some consumers cannot handle burst traffic. Allow subscriptions to configure a maximum delivery rate (e.g., 10 requests per second). The delivery worker respects this limit using a token-bucket algorithm per subscription.

**Dead-letter queues.** After exhausting all retries, failed deliveries should land in a dead-letter queue rather than disappearing. Provide a dashboard where consumers can inspect failed deliveries, understand why they failed, and manually replay them after fixing their endpoint.

**Observability.** Log every delivery attempt with the event ID, subscription ID, HTTP status code, response time, and any error message. Expose these logs to consumers via a dashboard or API. When an integration breaks, the first question is always "are you sending the webhooks?" — having the answer readily available shortens debugging cycles dramatically.

**Load testing.** Before launching, simulate consumer failure modes: slow responses (10+ second delay), intermittent 500 errors, connection resets, DNS failures. Verify that your retry logic, circuit breakers, and queue management behave correctly under each scenario.

## Common Pitfalls and How to Avoid Them

A few patterns we see repeatedly in webhook implementations that have gone wrong:

Sending webhooks synchronously in the request path. The user action that triggers the event should not be blocked by webhook delivery. If a consumer's endpoint is slow, your user's experience degrades. Always emit events asynchronously.

Not preserving event ordering. If you send `order.created` and `order.updated` for the same order, the consumer may receive them out of order, especially under retry conditions. Include a sequence number or timestamp that consumers can use to detect and resolve ordering conflicts. For most use cases, last-write-wins based on timestamp is sufficient.

Exposing internal data models. Your webhook payload should be a stable, versioned public API — not a raw dump of your database row. Internal fields change frequently; webhook payloads should change rarely and deliberately.

Ignoring the consumer's perspective. The best webhook infrastructure includes developer documentation with copy-paste examples in multiple languages, a test mode that sends example payloads to a consumer-specified URL, and a webhook log viewer that makes debugging integration issues self-service.

---

If you are building a product that needs webhook capabilities — or struggling to make an existing webhook integration reliable — [let us know](/contact.html). We have built webhook infrastructure that handles millions of daily deliveries and would be happy to share what we have learned.
