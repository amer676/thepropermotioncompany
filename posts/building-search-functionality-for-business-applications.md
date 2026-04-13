# Building Search Functionality for Business Applications

Search is the feature that users never praise when it works and always curse when it does not. In a business application --- an internal knowledge base, a customer portal, an e-commerce catalog, an administrative dashboard --- search is often the primary way users navigate. When it is fast and accurate, users find what they need in seconds. When it is slow, irrelevant, or absent, they file support tickets, call colleagues, or build personal spreadsheets to track what the application should have surfaced.

This guide covers the technical decisions behind building search that actually works: choosing the right engine, designing the index, handling relevance ranking, and scaling for real-world data volumes.

## When You Actually Need a Search Engine

Not every application needs a dedicated search engine. The decision depends on data volume, query complexity, and user expectations.

**Database queries are sufficient when:**
- The dataset is under 100,000 records
- Users search by exact or near-exact matches (order number, customer name, email address)
- Search is a secondary navigation method (most users browse or filter)
- Query latency under 200ms is achievable with proper indexing

A PostgreSQL `ILIKE` query with a GIN index on a `tsvector` column handles full-text search surprisingly well for datasets up to a few hundred thousand records. For a 50,000-record product catalog, PostgreSQL full-text search returns results in 10 to 50 milliseconds with proper indexing. Do not add infrastructure complexity you do not need.

**A dedicated search engine is necessary when:**
- The dataset exceeds 500,000 records or grows rapidly
- Users expect typo tolerance, synonym matching, or fuzzy matching ("recieve" should match "receive")
- Search needs to span multiple entity types (search across customers, orders, and products simultaneously)
- Faceted search (filtering by category, date range, price range alongside the text query) is required
- Relevance ranking needs to consider multiple signals (text match, recency, popularity, user context)
- Sub-100ms response time is required at scale

When you cross this threshold, the three primary options are Elasticsearch, Typesense, and Meilisearch. Each has distinct strengths.

## Choosing Your Search Engine

**Elasticsearch** is the incumbent. It handles virtually any search use case, from full-text search to log analytics to vector search. It scales horizontally to billions of documents. Its query DSL is extraordinarily powerful. The trade-off is operational complexity: Elasticsearch clusters require careful tuning of heap size, shard count, refresh intervals, and mapping configurations. Running Elasticsearch well requires dedicated operational expertise or a managed service like Elastic Cloud ($95+/month for production workloads).

Best for: Large datasets (10M+ records), complex query requirements, teams with existing Elasticsearch experience, applications that also need log analytics.

**Typesense** is purpose-built for application search. It is fast (sub-10ms queries on million-record datasets), operationally simple (single binary, no JVM, no cluster management for moderate scale), and comes with typo tolerance and ranking built in. It lacks some of Elasticsearch's advanced features (complex aggregations, scripted scoring) but covers 90 percent of application search needs with 10 percent of the operational burden.

Best for: Product catalogs, directory search, knowledge bases, teams that want search to "just work" without a dedicated search engineer. Open-source and self-hostable, or available as Typesense Cloud ($30+/month).

**Meilisearch** occupies a similar niche to Typesense, with an emphasis on developer experience. Its API is RESTful and intuitive, its default relevance is surprisingly good, and it handles typos and prefixes out of the box. It is slightly less mature than Typesense for production workloads but is improving rapidly.

Best for: Developer-facing products, documentation search, rapid prototyping. Open-source, with Meilisearch Cloud available.

For most business applications we build, Typesense is the default choice unless the client has specific requirements that push toward Elasticsearch.

## Designing Your Search Index

A search index is not a copy of your database. It is a purpose-built data structure optimized for the queries users will run. Designing it well requires thinking about what users search for, not what your database schema looks like.

**Choose searchable fields carefully.** Not every field should be searchable. In a customer database, users search by name, email, phone number, and company name. They do not search by internal ID, creation timestamp, or account status. Including non-searchable fields in the index increases index size and can introduce false-positive results.

**Add filterable attributes.** Filters are not search --- they are constraints applied alongside search. A user searching for "wireless headphones" and filtering by "price under $100" and "brand: Sony" is issuing a query with two filters. Your index needs these fields marked as filterable (not searchable), which uses a different storage structure optimized for range and equality comparisons.

**Configure field weights.** A match in the product title should rank higher than a match in the product description, which should rank higher than a match in customer reviews. Configure field weights to reflect this hierarchy. Typical weights for a product search:

- Product name: weight 10
- Brand: weight 8
- Category: weight 5
- Description: weight 3
- Tags/keywords: weight 4

**Denormalize for search.** If a customer record includes an associated company and recent orders, the search index should include the company name and order details as nested fields on the customer document. This allows a single search to return results like "John Smith at Acme Corp, Order #4521." In your primary database, this data lives in separate tables. In your search index, it belongs together.

**Handle synonyms explicitly.** Business domains have their own vocabularies. "PO" means "purchase order." "RMA" means "return merchandise authorization." "NET30" means "payment due in 30 days." Configure synonym lists so that searching for "PO" returns results containing "purchase order" and vice versa. Review and expand synonym lists quarterly based on search queries that returned zero results.

## Relevance Ranking: The Art and Science

Default relevance ranking (typically BM25 or a TF-IDF variant) works well for generic text search but poorly for business applications, because it considers only text similarity. Business search needs to factor in additional signals:

**Recency.** In a support ticket system, recent tickets should rank higher than tickets from three years ago, even if the older ticket is a better text match. Implement a time-decay function that reduces the score of older documents. A common approach: multiply the text relevance score by `1 / (1 + days_since_update * decay_factor)`, where decay_factor is tuned to your domain (0.01 for slow-moving content, 0.1 for fast-moving content).

**Popularity.** In an e-commerce catalog, a product with 500 purchases should rank higher than a product with 5 purchases, all else being equal. Include a popularity signal (sales count, view count, click count) as a ranking factor with a moderate weight --- enough to boost popular results but not enough to bury niche products.

**Personalization.** If you know the user's department, location, or role, use it to boost relevant results. A search for "policy" by an HR manager should surface HR policies before IT policies. Implement this as a query-time boost on documents tagged with the user's context.

**Business rules.** Sometimes you need to override algorithmic ranking. Promoted products, featured articles, or pinned announcements should appear at the top regardless of text relevance. Implement this as a separate "pinned results" layer that precedes the ranked results.

Test relevance changes using a judgment set: a list of 50 to 100 common queries with manually rated expected results. Run the judgment set against your search engine before and after ranking changes, computing NDCG (Normalized Discounted Cumulative Gain) or a simpler precision@10 metric. This prevents relevance regressions.

## Search UX Patterns That Improve Findability

The search engine is half the problem. The other half is how search is presented in the interface.

**Instant search (search-as-you-type).** Show results after every keystroke, with a debounce of 150 to 300 milliseconds to avoid overwhelming the server. This requires sub-100ms query latency from the search engine, which modern engines like Typesense handle comfortably. Instant search reduces the time to first result by 60 to 70 percent compared to submit-and-wait search.

**Highlighted matches.** Show exactly which words in the result matched the query, using bold or color highlighting. This helps users scan results quickly and builds trust in the search system.

**Faceted navigation.** After showing results, display filter options derived from the result set: categories, date ranges, statuses, authors. Each facet shows a count of matching results, so users know before clicking whether narrowing will help. Update facet counts in real-time as the user applies filters.

**Zero-result handling.** A blank screen with "No results found" is a dead end. Instead, offer: spelling correction suggestions, related search terms, recently popular queries in the same category, or a direct link to support. Every zero-result query is a signal that either your content has a gap or your search has a coverage gap --- track them.

**Recent and saved searches.** For internal business applications where users run the same queries repeatedly (a support agent searching for a customer, a procurement officer checking a vendor), save recent searches and allow bookmarking frequent ones. This turns search from a navigation tool into a workspace.

## Scaling Search in Production

As data volume and query volume grow, search performance requires ongoing attention:

- **Index size management.** Archive old records that are rarely searched. A support ticket system might keep the last 2 years in the primary search index and move older tickets to a cold archive index with slower response times.
- **Query performance monitoring.** Track p50, p95, and p99 query latency. Investigate any query that exceeds 500ms. Common causes: overly broad wildcard queries, unoptimized filter conditions, or insufficient hardware.
- **Index refresh strategy.** How quickly do new or updated records appear in search results? Real-time indexing (within 1 second) requires more resources. Near-real-time (within 1 to 5 minutes) is sufficient for most business applications and is dramatically cheaper.
- **Reindexing plan.** When you change the index schema (adding fields, changing analyzers), you need to rebuild the index from source data. For a million-record index, this takes minutes. For a hundred-million-record index, it can take hours. Have a zero-downtime reindexing strategy: build the new index alongside the old one, switch the alias when the new index is ready.

---

If your application's search experience is frustrating users or holding back productivity, [contact The Proper Motion Company](/contact.html). We build search systems that help users find exactly what they need, fast.
