# Fleet Telematics Platform Development

A fleet of 200 vehicles generates approximately 17 million GPS data points per day. Each data point carries a coordinate pair, a timestamp, a speed reading, a heading, and diagnostic codes from the vehicle's OBD-II port. Most of this data is uninteresting: a truck moving at highway speed along its planned route. But buried in that stream are the signals that matter — an unauthorized stop, a harsh braking event, an engine fault code, a driver who has exceeded their hours-of-service limit, a deviation from the geofenced corridor. The entire value proposition of a fleet telematics platform is extracting those signals from the noise, in real time, and turning them into decisions.

This post covers the architecture, data engineering, and feature design of a custom fleet telematics platform — the kind of system that turns raw vehicle data into operational intelligence.

## Data Ingestion: Getting Telemetry From Vehicle to Cloud

The data pipeline begins with hardware. GPS trackers and telematics devices installed in vehicles (from vendors like CalAmp, Queclink, Teltonika, or custom hardware built on cellular-connected microcontrollers) report positions and diagnostic data over cellular networks. The communication protocols vary: some devices use proprietary binary protocols over TCP, others use MQTT, and newer devices support HTTP/REST with JSON payloads.

The ingestion layer must handle:

**Protocol diversity.** Unless you standardize on a single hardware vendor (which limits your flexibility and creates vendor lock-in), your platform needs protocol adapters — lightweight services that accept device-specific formats, parse them, and emit a normalized telemetry event. Each adapter runs as a separate service (or a separate handler within a gateway service), so adding support for a new device type does not affect existing integrations.

**Connection volume.** A fleet of 10,000 vehicles, each reporting every 10 seconds, generates 1,000 messages per second. The ingestion endpoint must handle this sustained throughput with headroom for bursts (vehicle startup in the morning creates a spike as devices that were offline reconnect and replay buffered data). A TCP server built with an event-loop framework (Node.js, Go, or Rust) handles this efficiently. For HTTP-based devices, a load-balanced cluster of stateless API servers behind an Application Load Balancer.

**Data quality and deduplication.** GPS signals are noisy. A stationary vehicle's reported position can drift by 10-30 meters due to atmospheric interference, multipath reflection, and receiver quality. Devices sometimes replay data after a connectivity gap, resulting in duplicate events. The ingestion layer applies basic sanity checks: reject coordinates outside the operational region, deduplicate by (device_id, timestamp) pair, and flag positions that imply physically impossible speeds (greater than 200 km/h for a truck).

**Buffering for downstream reliability.** Raw telemetry events are written to a message broker (Apache Kafka is the standard choice for this scale and use case) immediately after ingestion. Kafka provides durable, ordered, replayable storage of the event stream, decoupling ingestion from processing. If the processing layer goes down, events accumulate in Kafka and are processed when the service recovers. No data is lost.

## Real-Time Processing and Event Detection

The raw telemetry stream is consumed by a stream-processing layer that transforms positions into actionable events. Apache Flink or Kafka Streams are the natural choices for stateful stream processing at this scale.

**Trip detection.** A trip starts when a vehicle begins moving (speed exceeds a threshold, typically 5 km/h, for a sustained duration) and ends when it stops (speed drops below the threshold for a configurable period, typically 3-5 minutes). The trip processor maintains per-vehicle state: current trip ID, trip start time, trip start location, odometer at trip start. Each position during a trip is associated with the trip ID. When the trip ends, a trip-summary event is emitted with distance, duration, average speed, maximum speed, idle time, and start/end addresses (resolved via reverse geocoding).

**Geofence monitoring.** Geofences are polygons or circles defined on a map — customer sites, warehouses, restricted zones, city limits. The stream processor maintains a spatial index of active geofences and evaluates each vehicle position against the index. When a vehicle enters or exits a geofence, an event is emitted. The computational challenge is that a fleet with 500 geofences and 10,000 vehicles generates 1,000 point-in-polygon evaluations per second. An R-tree spatial index (available in PostGIS, or as an in-memory data structure in the stream processor) keeps evaluation time constant regardless of geofence count.

**Driver behavior analysis.** Harsh braking (deceleration exceeding a threshold, typically 8.8 km/h per second), harsh acceleration, harsh cornering (lateral acceleration exceeding a threshold), and speeding (exceeding the posted speed limit for the road segment, which requires a road-speed database like HERE or TomTom) are detected from the telemetry stream. Each event includes the severity, location, and timestamp. Aggregated over time, these events produce a driver safety score — a composite metric that fleet managers use for coaching and incentive programs.

**Hours-of-service compliance.** For regulated fleets (commercial trucking in the US under FMCSA regulations), the platform must track driving time, on-duty time, and rest periods per driver. The ELD (Electronic Logging Device) mandate requires that this tracking be automated from vehicle movement data. The rules are complex: an 11-hour driving limit within a 14-hour on-duty window, a mandatory 30-minute break after 8 hours of driving, a 70-hour limit over 8 consecutive days with a 34-hour restart provision. The stream processor evaluates these rules continuously and alerts both the driver and the dispatcher when a violation is approaching.

## Storage Architecture: Hot, Warm, and Cold

Telematics data has a steep access-frequency curve. Today's data is queried constantly (real-time map, current vehicle status). Last week's data is queried frequently (trip reports, driver scorecards). Last year's data is queried rarely (annual compliance reports, litigation support). The storage architecture should match.

**Hot storage (real-time, last 24 hours):** Redis or a similar in-memory store holds the latest position, status, and active-trip data for every vehicle. This is the data that powers the live map and the dispatch dashboard. Access pattern: key-value lookups by vehicle ID. Latency requirement: under 10 milliseconds.

**Warm storage (recent, last 90 days):** TimescaleDB (PostgreSQL with time-series extensions) or ClickHouse stores detailed telemetry data — every position, every event, every trip. Access patterns include time-range queries ("show me all positions for vehicle 42 on March 15"), aggregation queries ("average daily mileage by vehicle for the last month"), and geospatial queries ("which vehicles were within 5 km of this address between 2 PM and 4 PM?"). TimescaleDB's hypertable partitioning and ClickHouse's columnar compression both handle the query patterns and data volume efficiently.

**Cold storage (archive, beyond 90 days):** Parquet files on object storage (S3, Google Cloud Storage). The data is compressed, partitioned by date and fleet, and queryable via Athena, BigQuery, or Spark for ad-hoc analysis. Retention requirements vary by regulation: FMCSA requires ELD records for six months, and some insurance programs require telematics data retention for the policy period plus a claims window.

## The Dispatch and Operations Dashboard

The primary interface for fleet managers is a real-time dashboard that combines map visualization with tabular data and alerts.

**Live map.** Every vehicle's current position, rendered on a map with color-coded icons indicating status: moving (green), stopped with engine on/idling (yellow), stopped with engine off (gray), alert condition (red). Clicking a vehicle shows its current trip, recent breadcrumb trail, driver assignment, and vehicle details. For fleets above 500 vehicles, the map must use marker clustering at low zoom levels to remain usable — rendering 5,000 individual markers simultaneously degrades browser performance.

**Vehicle list with real-time status.** A sortable, filterable table showing every vehicle: current location (address), speed, driver, status, last update time. Vehicles that have not reported in the last 5 minutes are flagged — a stale position may indicate a device malfunction or a connectivity issue.

**Alert feed.** A chronological list of events requiring attention: geofence violations, speeding events, HOS warnings, maintenance alerts (triggered by engine fault codes or mileage-based schedules), and device health alerts. Each alert should be actionable: a geofence violation links to the vehicle's location on the map, an HOS warning links to the driver's current log, a maintenance alert links to the vehicle's service history.

**Route replay.** Selecting a vehicle and a time range renders the vehicle's path on the map with a playback control. Speed, heading, and event markers (stops, alerts) are displayed along the route. This feature is used for investigating incidents, verifying service delivery (did the driver visit the customer site?), and resolving disputes.

## Reporting and Analytics

Beyond real-time operations, the platform must produce the reports that drive fleet management decisions.

**Utilization reports.** Hours driven, miles driven, idle time, and utilization rate (hours in motion / total available hours) per vehicle and per fleet. Low-utilization vehicles are candidates for reallocation or retirement. High-idle-time vehicles suggest route optimization opportunities.

**Fuel analysis.** Fuel consumption derived from OBD-II data (if available) or estimated from distance and vehicle type. Cost per mile, cost per trip, and trend analysis identify vehicles with degrading fuel efficiency (potential maintenance issues) and drivers whose driving behavior increases fuel consumption.

**Safety scorecards.** Per-driver scores computed from harsh-event frequency, speeding frequency, and HOS compliance. Trend charts showing improvement or degradation over time. Peer comparison (anonymized) to provide context. These scorecards drive driver coaching programs and, for fleets with behavior-based insurance, directly affect premium costs.

**Maintenance scheduling.** Mileage-based and time-based maintenance triggers (oil change every 10,000 miles or 6 months, tire rotation every 7,500 miles) cross-referenced with actual mileage data from the telematics stream. The platform generates upcoming-maintenance lists and sends reminders to fleet managers in advance of due dates.

---

If you operate a fleet and need a telematics platform that fits your specific operational requirements — whether that is regulatory compliance, dispatch optimization, or driver safety — [contact our team](/contact.html). We build these systems from the device layer to the dashboard, and we understand that the value is not in the data itself but in the decisions it enables.
