# Event-Driven Architecture for Scalable Web Applications

Most web applications start life as request-response systems. A user clicks a button, the server processes the request, writes to a database, and returns a response. This works beautifully until it does not. The moment you need to send a confirmation email after an order, update an analytics dashboard, notify a warehouse system, and adjust inventory counts, all triggered by the same "place order" action, request-response architecture starts to buckle. Event-driven architecture decouples these concerns and lets your system scale each one independently.

## From Synchronous Chains to Asynchronous Events

In a synchronous request-response system, the order placement endpoint might look like this in pseudocode:

```
POST /orders
  validate order
  charge payment
  save order to database
  send confirmation email
  update inventory
  notify warehouse
  update analytics
  return response to user
```

Every step happens in sequence. If the email service takes 3 seconds to respond, the user waits 3 extra seconds. If the warehouse API is down, the entire order fails. And every new side effect, logging, partner notifications, loyalty point calculations, adds latency and failure modes to the critical path.

Event-driven architecture restructures this. The order endpoint does only what the user is waiting for:

```
POST /orders
  validate order
  charge payment
  save order to database
  publish "OrderPlaced" event
  return response to user
```

Everything else happens asynchronously. The email service, inventory service, warehouse integration, and analytics pipeline each subscribe to the "OrderPlaced" event and process it independently. If the email service is slow, the user does not wait. If the warehouse API is down, orders still succeed, and the warehouse notification retries until it delivers.

This is not just an architectural preference. It is a concrete improvement in reliability and user experience. An e-commerce company we worked with reduced their median order placement latency from 2.8 seconds to 340 milliseconds by moving five synchronous side effects to event handlers.


> Related: [Building White-Label SaaS Platforms for Multiple Brands](/blog/building-white-label-saas-platforms-for-multiple-brands/)


## Choosing an Event Backbone: Queues, Streams, and Brokers

The event backbone is the infrastructure that transports events from producers to consumers. The choice depends on your volume, durability requirements, and operational complexity tolerance.

**Message queues (RabbitMQ, Amazon SQS)** follow a point-to-point model. A producer sends a message to a queue, and exactly one consumer receives it. Messages are deleted after successful processing. This is ideal for task distribution: sending emails, processing image thumbnails, generating PDFs. RabbitMQ handles 20,000-50,000 messages per second on a single node and supports complex routing through exchanges and bindings. SQS is the managed alternative that eliminates operational overhead at the cost of higher per-message latency (typically 10-50 ms).

**Event streams (Apache Kafka, Amazon Kinesis, Redpanda)** follow a log-based model. Events are appended to an ordered, durable log. Multiple consumers can read the same events independently, each tracking their own position in the log. Events are retained for a configurable duration (days, weeks, or indefinitely). This is ideal when multiple systems need to react to the same event, when you need to replay events for debugging or reprocessing, or when event ordering matters. Kafka handles millions of messages per second with sub-10 ms latency. Redpanda offers Kafka API compatibility with lower operational complexity and no JVM dependency.

**Lightweight pub/sub (Redis Streams, NATS)** fills the middle ground. Redis Streams provides durable, ordered event storage with consumer groups, handling hundreds of thousands of messages per second with minimal infrastructure. NATS offers ultra-low-latency messaging (sub-millisecond) with optional persistence through JetStream. Both are excellent choices for applications that need event-driven architecture but do not yet need Kafka-scale infrastructure.

For most web applications starting with event-driven architecture, Redis Streams or a managed service like Amazon SQS plus SNS (for fan-out) provides the right balance of capability and simplicity. Migrate to Kafka when you are processing more than 100,000 events per second or need long-term event retention for analytics.

## Designing Events That Last

Events are the contracts between your services. Poorly designed events create coupling, breaking changes, and integration headaches. Well-designed events enable independent evolution.

**Use past-tense naming.** Events describe something that already happened: `OrderPlaced`, `UserRegistered`, `PaymentFailed`, `InventoryReserved`. Not `PlaceOrder` (that is a command) or `OrderUpdate` (too vague to be useful).

**Include enough context to be self-contained.** An event should contain all the data a consumer needs to process it without making additional API calls. An `OrderPlaced` event should include the order details, customer information, and line items, not just an order ID that forces every consumer to call back to the order service.

**Version your events.** Event schemas will evolve. Use a version field (`schema_version: 2`) and maintain backward compatibility. New fields should be additive. Consumers should ignore fields they do not recognize. When breaking changes are unavoidable, publish both the old and new event versions during a transition period, then deprecate the old version with advance notice.

**Use a schema registry.** Tools like Confluent Schema Registry (for Kafka) or AWS Glue Schema Registry validate event payloads against registered schemas, catching contract violations at publish time rather than in consumer error logs. For smaller systems, a shared JSON Schema definition in a repository that producers and consumers both reference achieves the same goal with less infrastructure.

A well-designed event payload:

```json
{
  "event_type": "OrderPlaced",
  "schema_version": 2,
  "event_id": "evt_a1b2c3d4",
  "timestamp": "2024-01-31T14:23:45.123Z",
  "source": "order-service",
  "data": {
    "order_id": "ord_x7y8z9",
    "customer_id": "cus_m4n5o6",
    "customer_email": "buyer@example.com",
    "total_amount_cents": 15999,
    "currency": "USD",
    "line_items": [
      {
        "product_id": "prod_j1k2l3",
        "quantity": 2,
        "unit_price_cents": 7999
      }
    ]
  }
}
```

Every event has a unique ID for idempotency, a timestamp for ordering, a source for tracing, and a self-contained data payload.


> See also: [Privacy-First Software Development as Competitive Advantage](/blog/privacy-first-software-development-as-competitive-advantage/)


## Handling Failures: Retries, Dead Letter Queues, and Idempotency

In event-driven systems, failures are not exceptions. They are expected states that your architecture must handle gracefully.

**Retry with exponential backoff.** When a consumer fails to process an event, retry with increasing delays: 1 second, 5 seconds, 30 seconds, 2 minutes, 10 minutes. This handles transient failures (network blips, temporary service unavailability) without overwhelming a recovering service. Most message brokers support configurable retry policies. SQS has visibility timeout extensions. RabbitMQ has dead letter exchanges with TTL-based requeuing. Kafka consumers can implement retry topics.

**Dead letter queues (DLQs) catch poison messages.** After a configured number of retry attempts (typically 3-5), move the event to a dead letter queue for manual investigation. A DLQ is a safety net that prevents a single malformed event from blocking all subsequent events in the queue. Monitor DLQ depth with alerts. A growing DLQ means a systematic problem, not a transient glitch.

**Idempotent consumers are non-negotiable.** Events can be delivered more than once due to retries, network issues, or broker behavior. Every consumer must produce the same result whether it processes an event once or five times. The standard pattern is to store the `event_id` of every processed event and check it before processing. If the event ID already exists, skip processing and acknowledge the message.

For database operations, idempotency often means using upserts instead of inserts:

```sql
INSERT INTO inventory_reservations (order_id, product_id, quantity, reserved_at)
VALUES ('ord_x7y8z9', 'prod_j1k2l3', 2, NOW())
ON CONFLICT (order_id, product_id) DO NOTHING;
```

This query is safe to execute multiple times. The first execution reserves inventory. Subsequent executions are no-ops.

## Saga Pattern for Distributed Transactions

When a business operation spans multiple services, traditional database transactions do not work. You cannot wrap a payment charge, inventory reservation, and shipping label creation in a single transaction because they involve different databases and external APIs. The saga pattern manages this by treating the operation as a sequence of events with compensating actions for failures.

**Choreography-based sagas** use events to coordinate. Each service reacts to events and publishes its own:

1. Order service publishes `OrderPlaced`.
2. Payment service processes payment, publishes `PaymentCharged`.
3. Inventory service reserves stock, publishes `InventoryReserved`.
4. Shipping service creates label, publishes `ShipmentCreated`.

If the inventory service cannot reserve stock, it publishes `InventoryReservationFailed`. The payment service subscribes to this and issues a refund, publishing `PaymentRefunded`. The order service marks the order as failed.

**Orchestration-based sagas** use a central coordinator. An order saga orchestrator sends commands to each service in sequence, tracks state, and handles failures:

1. Orchestrator sends `ChargePayment` command to payment service.
2. On success, sends `ReserveInventory` to inventory service.
3. On success, sends `CreateShipment` to shipping service.
4. On any failure, sends compensating commands to undo previous steps.

Choreography is simpler for sagas with 2-3 steps. Orchestration is clearer for complex sagas with many steps and conditional logic. Most production systems we build use orchestration because the explicit state machine is easier to debug, test, and monitor than tracing events across multiple service logs.

## Observability in Event-Driven Systems

Event-driven systems are harder to debug than synchronous ones. A request-response system has a single call stack you can trace. An event-driven system has a graph of loosely coupled reactions. Observability is not optional; it is a prerequisite.

**Correlation IDs.** Every event should carry a correlation ID that links it to the original user action. When an `OrderPlaced` event triggers `PaymentCharged`, `InventoryReserved`, and `ShipmentCreated` events, all four share the same correlation ID. This lets you reconstruct the full processing chain from any point.

**Distributed tracing.** OpenTelemetry propagates trace context across service boundaries, including through message brokers. When the order service publishes an event, the trace context is embedded in the event metadata. When the payment service consumes it, the trace continues seamlessly. Jaeger and Grafana Tempo visualize these cross-service traces.

**Consumer lag monitoring.** Track how far behind each consumer is from the latest event. In Kafka, this is the consumer group lag. In SQS, it is the approximate number of messages visible. A consumer falling behind means it cannot keep up with production rate, and you need to scale it horizontally or optimize its processing logic.

**Event flow visualization.** Document and visualize which services produce and consume which events. Tools like AsyncAPI provide a specification format for event-driven architectures, analogous to OpenAPI for REST APIs. This documentation becomes the system's architectural map.

Event-driven architecture is not a silver bullet. It adds complexity in exchange for scalability, resilience, and decoupling. The trade-off is worthwhile when your system has multiple consumers reacting to the same business events, when you need to scale components independently, or when synchronous processing creates unacceptable latency for users. Start with the simplest approach that works, and evolve toward event-driven patterns as your system's needs demand it.

---

Thinking about moving to an event-driven architecture? [Reach out to our team](/contact.html). We help companies design systems that scale gracefully under real-world load.
