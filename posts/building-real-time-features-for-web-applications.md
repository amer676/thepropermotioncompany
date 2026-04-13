# Building Real-Time Features for Web Applications

Users no longer tolerate stale data. When someone sends a message, they expect it to appear instantly. When a teammate edits a document, those changes should be visible immediately. When a stock price moves, dashboards should reflect it within milliseconds. Real-time features have shifted from a luxury to a baseline expectation, and the engineering decisions you make when implementing them determine whether your application feels alive or sluggish.

## Choosing the Right Transport: WebSockets, SSE, and Long Polling

The first architectural decision is how the server pushes data to the client. Each transport mechanism has distinct trade-offs that matter in production.

**WebSockets** establish a persistent, bidirectional TCP connection between client and server. Once the initial HTTP handshake upgrades to a WebSocket connection, both sides can send messages at any time without the overhead of new HTTP requests. This makes WebSockets ideal for use cases where both the client and server need to send data frequently: chat applications, collaborative editors, multiplayer games, and live trading platforms.

The trade-offs are real. WebSocket connections consume server memory (roughly 2-10 KB per connection depending on your stack), require sticky sessions or a pub/sub layer when running behind a load balancer, and complicate horizontal scaling. A Node.js server can typically handle 50,000-100,000 concurrent WebSocket connections before memory pressure becomes an issue. A Go server with goroutines can push past 1 million.

**Server-Sent Events (SSE)** use a standard HTTP connection that stays open while the server streams events to the client. The connection is unidirectional: server to client only. The client uses the `EventSource` API, which handles reconnection automatically with configurable retry intervals and last-event-ID tracking. SSE is the right choice when the server is the primary data source and the client mostly receives updates: live dashboards, notification feeds, activity streams, and real-time analytics.

SSE has significant advantages over WebSockets for these use cases. It works over standard HTTP/2 connections, which means it benefits from multiplexing without additional configuration. It passes through corporate firewalls and proxies that sometimes block WebSocket upgrades. And it is dramatically simpler to implement. A basic SSE endpoint in Express.js is about 15 lines of code.

**Long polling** is the fallback. The client sends a request, the server holds it open until there is new data or a timeout occurs, then the client immediately sends another request. It works everywhere, including behind the most restrictive firewalls, but it introduces latency (typically 100-500 ms per message round trip) and generates significantly more HTTP overhead than persistent connections. Use long polling only when WebSockets and SSE are blocked by infrastructure you cannot control.


> Related: [The AI Technology Stack: Models, Frameworks, and Infrastructure Guide](/blog/the-ai-technology-stack-models-frameworks-and-infrastructure-guide/)


## Scaling Real-Time With Pub/Sub Architecture

The moment you have more than one server instance, you need a message distribution layer. A message sent to WebSocket connections on server A needs to reach clients connected to server B.

**Redis Pub/Sub** is the most common starting point. Each server subscribes to relevant channels, and when an event occurs, it is published to Redis, which fans it out to all subscribers. Redis handles this efficiently: a single Redis instance can sustain 500,000+ messages per second. The limitation is that Redis Pub/Sub is fire-and-forget. If a subscriber is disconnected when a message is published, that message is lost.

For applications that cannot afford message loss, **Redis Streams** or a dedicated message broker provides durability. Redis Streams maintain an append-only log that consumers can read from any point, including catching up on messages they missed. NATS JetStream offers similar capabilities with lower operational overhead. Apache Kafka is the heavyweight option for applications processing millions of events per second, but its operational complexity is rarely justified below that scale.

A practical architecture for a real-time notification system serving 100,000 concurrent users:

1. Application servers publish events to Redis Streams when state changes occur.
2. A dedicated real-time service subscribes to Redis Streams and maintains WebSocket or SSE connections to clients.
3. Each client connection is authenticated and subscribes to channels based on user permissions (their own notifications, team channels, etc.).
4. When the real-time service receives an event from Redis, it routes it to the appropriate connected clients.
5. Clients that reconnect after a disconnection provide their last-received event ID, and the service replays missed events from the stream.

This separation of concerns keeps your application servers stateless while the real-time service handles the stateful connections.

## Optimistic UI and Conflict Resolution

Real-time features create a UX problem: if the user has to wait for a server round trip before seeing the result of their action, the interface feels slow even if the actual latency is under 100 ms. Optimistic UI solves this by immediately reflecting the user's action in the interface and reconciling with the server response afterward.

In a chat application, when a user sends a message, the client immediately renders it in the conversation with a "sending" indicator. The message is simultaneously sent to the server. When the server confirms receipt and broadcasts the message to other participants, the client updates the indicator to "sent." If the send fails, the client shows an error state with a retry option.

For collaborative editing, conflict resolution becomes the central challenge. Two users editing the same paragraph simultaneously will produce conflicting states. The two dominant approaches are:

**Operational Transformation (OT)**, used by Google Docs, represents each edit as an operation (insert character at position 5, delete characters 3-7) and transforms concurrent operations so they can be applied in any order and produce the same result. OT is mathematically proven to converge, but the transformation functions are complex and notoriously difficult to implement correctly. Google has published papers describing bugs in their OT implementation that took years to surface.

**Conflict-free Replicated Data Types (CRDTs)** take a different approach. Each change is encoded in a data structure that is mathematically guaranteed to merge without conflicts. Libraries like Yjs and Automerge implement CRDTs for text editing, providing real-time collaboration with less implementation complexity than OT. Yjs can handle documents with 100,000+ operations with sub-millisecond merge times.

For most applications that are not building a full collaborative text editor, a simpler approach works: **last-write-wins with field-level granularity.** If two users edit different fields of the same record simultaneously, both changes are applied. If they edit the same field, the later write wins, and the earlier user is notified that their change was overwritten. This handles 95% of real-world collaboration scenarios with minimal complexity.


> See also: [Building White-Label SaaS Platforms for Multiple Brands](/blog/building-white-label-saas-platforms-for-multiple-brands/)


## Presence and Awareness Indicators

Presence, showing who is online, who is viewing a document, who is typing, goes beyond a feature checkbox. It fundamentally changes how people interact with your application. Figma's cursors, Google Docs' colored caretakers, and Slack's typing indicators all create a sense of shared space that transforms a tool from a utility into a workspace.

Implementing presence efficiently requires careful attention to update frequency. Broadcasting cursor positions at 60 fps to all participants in a document would overwhelm both the server and the network. Practical implementations throttle presence updates to 5-10 times per second and interpolate positions on the receiving client for smooth visual movement.

A lightweight presence system architecture:

- Each client sends a heartbeat every 15-30 seconds to indicate it is still active.
- Transient presence data (cursor positions, typing status) is published directly to a pub/sub channel, bypassing the database entirely.
- The server maintains an in-memory map of active users per resource (document, channel, workspace), backed by Redis with TTL-based expiration.
- When a client connects to a resource, it receives the current presence state and then subscribes to the presence channel for updates.
- When a heartbeat is missed for 60 seconds, the user is marked as offline and a departure event is broadcast.

Keep presence data out of your primary database. It is high-frequency, low-value-per-event data that would generate unsustainable write loads if persisted traditionally. Redis or an in-memory store with periodic snapshots is the right tier.

## Performance Monitoring and Graceful Degradation

Real-time systems need monitoring that conventional request-response applications do not. Key metrics to track:

- **Connection count** per server instance, with alerts when approaching capacity limits.
- **Message delivery latency** from publication to client receipt. Measure at the 50th, 95th, and 99th percentiles. P50 under 50 ms and P99 under 500 ms are reasonable targets for most applications.
- **Reconnection rate.** A spike in reconnections indicates network instability, server issues, or deployment problems.
- **Message backlog size** in your pub/sub system. A growing backlog means consumers are falling behind producers.
- **Fan-out ratio.** How many clients receive each published message. This determines your bandwidth requirements and scaling needs.

Build graceful degradation into the system from the start. When the real-time service is overloaded, clients should fall back to polling at a configurable interval (every 5-10 seconds) rather than losing updates entirely. When a WebSocket connection fails to establish, fall back to SSE. When SSE is blocked, fall back to long polling. This cascade should be transparent to the user.

The `reconnecting-websocket` library for JavaScript handles automatic reconnection with exponential backoff. For SSE, the browser's built-in `EventSource` handles reconnection natively. Build your client-side abstraction layer so the transport mechanism is an implementation detail that can change without affecting application logic.

Real-time features, when done well, make applications feel responsive and alive. When done poorly, they create flickering, out-of-order updates, and phantom presence indicators that erode trust. The investment in architecture, conflict resolution, and monitoring infrastructure pays for itself in user experience that keeps people engaged and productive.

---

Building a product that needs real-time capabilities? [Let us help you get the architecture right](/contact.html) so it scales with your user base.
