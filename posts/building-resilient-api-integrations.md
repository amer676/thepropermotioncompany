# Building Resilient API Integrations

Every modern application depends on external APIs. Payment processors, identity verification services, email providers, shipping carriers, CRM platforms, analytics tools. A typical SaaS application integrates with 10 to 20 third-party services, and each one is a potential point of failure that your users will blame on you, not on your vendor.

The difference between an integration that works in demo conditions and one that survives production is resilience engineering. Resilient integrations handle failures gracefully, recover automatically, and degrade in ways that preserve the user experience. This article covers the specific patterns, configurations, and architectural decisions that make integrations production-grade.

## Failure Modes You Must Design For

Third-party APIs fail in ways that are more varied and insidious than internal service failures. Understanding the specific failure modes is the first step to handling them.

Timeout failures are the most common. The API accepts your request but does not respond within a reasonable window. This can happen because of network congestion, provider-side load, or a request that triggers an expensive operation on their end. The danger is not the timeout itself but what your system does during the wait. If you are holding a database transaction open while waiting for an external API response, a slow provider can exhaust your connection pool and cascade into a full system outage.

Partial failures occur when an API returns a 200 status code but the response body is incomplete, malformed, or contains an error in a nested field. A payment API might return HTTP 200 with `{"status": "error", "message": "insufficient funds"}`. If you only check the HTTP status code, you will treat this as a success. Validate the response body against expected schemas, not just status codes.

Rate limiting failures happen when you exceed the provider's throughput limits. Most APIs return HTTP 429 with a `Retry-After` header, but some return 503 or even 200 with an error payload. Rate limits are often poorly documented, and actual limits may differ from published ones, especially on shared-tenant plans.

Behavioral changes are the most dangerous because they are silent. The API continues responding successfully, but the semantics of the response change. A field that used to contain a string now contains an array. A date format shifts from ISO 8601 to Unix timestamps. An endpoint that used to return all results now paginates. These changes break your parsing logic without triggering error handlers.

Infrastructure-level failures include DNS resolution failures, TLS certificate expiration, IP address changes, and provider-side region outages. These are rare but catastrophic when they happen.


> Related: [The AI Technology Stack: Models, Frameworks, and Infrastructure Guide](/blog/the-ai-technology-stack-models-frameworks-and-infrastructure-guide/)


## Circuit Breakers and Retry Strategies

The circuit breaker pattern prevents a failing integration from consuming resources indefinitely. When failures exceed a threshold, the circuit "opens" and subsequent requests fail immediately without calling the external API. After a cooldown period, the circuit moves to "half-open" and allows a single test request through. If it succeeds, the circuit closes and normal traffic resumes.

Configure circuit breakers with three parameters: the failure threshold (typically 5 to 10 failures within a 60-second window), the cooldown period (30 to 120 seconds), and the success threshold for closing (typically 2 to 3 consecutive successes in half-open state). These values should be tuned per integration based on the provider's reliability profile and the cost of false opens.

Retry strategies must be paired with circuit breakers. Use exponential backoff with jitter: the first retry after 200ms, the second after 400ms plus random jitter of 0-200ms, the third after 800ms plus jitter, up to a maximum of three to five retries. The jitter prevents the thundering herd problem, where many clients that timed out simultaneously all retry at the same moment and overwhelm the recovering service.

Critically, only retry idempotent operations. A GET request is always safe to retry. A POST request that creates a resource is not, unless the API supports idempotency keys. If the API supports them (Stripe's `Idempotency-Key` header is the gold standard), always include one. If not, you need to verify whether the original request succeeded before retrying. Blindly retrying a payment charge can result in double-charging a customer.

Here is a concrete retry configuration we use as a starting point:

```
Max retries: 3
Initial delay: 200ms
Backoff multiplier: 2
Max delay: 5000ms
Jitter: random 0-50% of calculated delay
Retryable status codes: 408, 429, 500, 502, 503, 504
Non-retryable: 400, 401, 403, 404, 409, 422
```

## Timeout Configuration and Connection Management

Default HTTP client timeouts are almost always wrong for production use. Most HTTP libraries default to 30 seconds or infinite timeouts, both of which are inappropriate for API integrations.

Configure three separate timeouts. The connection timeout (how long to wait for a TCP connection to establish) should be 3 to 5 seconds. If you cannot connect in 5 seconds, the endpoint is likely unreachable. The read timeout (how long to wait for the first byte of the response) should be set based on the API's expected response time, typically 5 to 15 seconds for most APIs, up to 30 seconds for known-slow operations like report generation. The total timeout (maximum time for the entire request-response cycle including redirects) should be the outer bound, typically 30 to 60 seconds.

Connection pooling is essential for high-throughput integrations. Creating a new TCP connection and TLS handshake for every request adds 100 to 300ms of overhead. Maintain a pool of persistent connections to each external host. Configure the pool size based on your expected concurrency: if you make up to 50 concurrent requests to Stripe, set the pool to 50 connections with a maximum of 75. Set idle connection timeouts to 90 seconds to avoid using stale connections that the remote end has closed.

DNS caching introduces a subtle failure mode. If a provider rotates IP addresses (common with cloud-hosted APIs behind load balancers), stale DNS cache entries can cause all requests to hit a decommissioned IP. Set DNS TTL in your HTTP client to respect the provider's DNS TTL rather than caching indefinitely. Most cloud providers use 60-second DNS TTLs.


> See also: [Building White-Label SaaS Platforms for Multiple Brands](/blog/building-white-label-saas-platforms-for-multiple-brands/)


## Graceful Degradation and Fallback Strategies

When an integration fails, the user experience should degrade gracefully rather than break entirely. The right degradation strategy depends on how critical the integration is to the user's immediate workflow.

For non-critical integrations, use asynchronous processing with queued retries. If your analytics service is down, queue the event and process it later. If your email provider is unreachable, add the message to a send queue with exponential backoff retries. The user's primary workflow (placing an order, submitting a form) should not block on these secondary systems.

For critical integrations, implement fallback paths. If your primary payment processor is down, route transactions to a secondary processor. If your identity verification service is unavailable, switch to a manual review queue rather than rejecting all new signups. These fallbacks should be configured in advance and tested regularly, not built in a panic during an outage.

Cached responses provide another fallback option. If a pricing API that updates daily is unreachable, serve the last known good response with a staleness indicator. If a geolocation API is down, fall back to the last cached result for that IP address. Set explicit staleness limits: a cached price from 2 hours ago is probably fine; a cached price from 2 weeks ago is not.

Feature flags tied to integration health enable dynamic degradation. When the circuit breaker for your recommendation engine opens, automatically disable the "recommended for you" section in the UI rather than showing an error. When the circuit closes, the section reappears. This keeps the user experience clean without requiring manual intervention.

## Observability and Alerting

You cannot fix what you cannot see. Every external API call should produce structured telemetry that lets you detect, diagnose, and resolve integration issues quickly.

Log every external API call with: timestamp, target URL (redacting sensitive path parameters), HTTP method, request duration in milliseconds, response status code, response body size, and a correlation ID that ties the call back to the originating user request. Store these logs in a queryable system (Elasticsearch, Datadog, or your preferred observability platform) with at least 30 days of retention.

Build dashboards that track four key metrics per integration: request volume (calls per minute), error rate (4xx and 5xx responses as a percentage of total), latency distribution (p50, p95, p99), and circuit breaker state (open, half-open, closed). These four metrics give you a complete picture of each integration's health at a glance.

Set alerts at two thresholds. Warning alerts trigger when error rates exceed 5% or p99 latency exceeds 2x the normal baseline. These go to a monitoring channel for awareness. Critical alerts trigger when error rates exceed 20%, the circuit breaker opens, or latency exceeds 5x baseline. These page the on-call engineer.

Synthetic monitoring complements real-traffic monitoring. Schedule lightweight health check calls to each external API every 60 seconds from multiple regions. These synthetic checks detect outages before they affect real users and provide a clean signal that is not muddied by request-specific failures.

## Contract Testing and Version Management

APIs change, and those changes break integrations. Contract testing is your defense against silent breaking changes.

Write contract tests that validate the structure and semantics of API responses against your expectations. A contract test for a user API endpoint might assert that the response contains a `user` object with string fields `id`, `email`, and `name`, and that `email` matches a valid email pattern. Run these tests on a schedule (daily or hourly) against the provider's sandbox or production API.

When contract tests fail, you have early warning of a breaking change, often days or weeks before it would have caused a production incident. This gives you time to update your integration code, test the fix, and deploy before users are affected.

Pin API versions explicitly. Use version headers (`Accept: application/vnd.api+json; version=2`), versioned URLs (`/v2/users`), or whatever mechanism the provider offers. Never use the "latest" or default version, because an unversioned endpoint can change under you without notice.

Maintain a vendor dependency registry that tracks, for each integration: the API version you are using, the latest available version, the deprecation timeline for your version, and the changelog URL. Review this registry monthly. Proactively upgrading before a version is deprecated is far cheaper than emergency-fixing a broken integration after the provider sunsets an old version.

---

Resilient API integrations are not built by accident. They require deliberate architecture, careful configuration, and ongoing operational attention. If you are dealing with flaky integrations or planning a system that depends on external services, [reach out to our team](/contact.html) to discuss how we can help you build integrations that survive real-world conditions.
