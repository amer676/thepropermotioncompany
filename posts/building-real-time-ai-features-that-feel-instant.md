# Building Real-Time AI Features That Feel Instant

Users have been trained by autocomplete, instant search, and real-time collaboration tools to expect sub-second responses from software. Then they encounter an AI feature that takes 3 to 8 seconds to return a result, and the experience feels broken. The challenge for product teams is not whether to add AI features, it is how to make those features feel as responsive as everything else in the interface.

The good news: with the right architecture, you can make AI features that respond in perceived milliseconds, even when the underlying model takes seconds to generate a complete response. This post covers the specific engineering patterns that make it work.

## Streaming Responses and Progressive Rendering

The single most impactful technique for AI responsiveness is streaming. Instead of waiting for the complete response before showing anything, display tokens as they arrive.

**Server-Sent Events (SSE) for streaming.** Most LLM providers return streaming responses as SSE streams. Your backend proxies this stream to the client, forwarding each token or chunk as it arrives. The client renders incrementally. With SSE, the time-to-first-token becomes the perceived latency, which is typically 200 to 500ms rather than the 2 to 6 seconds for a complete response.

Implementation pattern for a Node.js backend:

```javascript
app.post('/api/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    messages: req.body.messages,
    max_tokens: 1024,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      res.write(`data: ${JSON.stringify(event.delta)}\n\n`);
    }
  }
  res.end();
});
```

**Progressive rendering patterns.** For structured outputs (not just text), render incrementally as data becomes available. If the AI is generating a report with sections, render each section header and content as it completes rather than waiting for the full report. If it is generating a table, render rows as they stream in. Use skeleton loading states for sections that have not started yet, with the current section actively streaming.

**Typewriter vs. chunk rendering.** The typewriter effect (rendering one character at a time) feels natural for chat interfaces but is too slow for structured content. For non-chat AI features, render in chunks: buffer tokens until you have a complete word or sentence, then render the whole chunk. This feels faster while remaining readable. A 50ms debounce on incoming tokens works well for chunk-based rendering.

**Handling structured output during streaming.** When the AI returns JSON, you cannot parse it until it is complete. Two solutions: use a streaming JSON parser like jsonrepair that handles partial JSON gracefully, or request the model to output in a streamable format where individual items are separated by newlines (JSON Lines), allowing you to parse and render each item as it arrives.

## Intelligent Caching and Pre-computation

Not every AI request needs to hit the model. Strategic caching reduces both latency and cost.

**Semantic caching.** Traditional exact-match caching has limited hit rates for AI features because inputs vary widely. Semantic caching embeds the input, searches a vector store for similar past queries, and returns the cached result if similarity exceeds a threshold (typically cosine similarity above 0.95). For customer support bots, semantic caching can achieve 20% to 35% hit rates on common questions, returning results in under 50ms instead of 2+ seconds.

Implementation: embed each query using a fast embedding model (voyage-3-lite, or text-embedding-3-small from OpenAI), store the embedding alongside the query-response pair in a vector database (Pinecone, Qdrant, or pgvector), and check for near-matches before forwarding to the LLM. Set a TTL on cached entries (24 to 72 hours for dynamic content, longer for stable knowledge bases).

**Pre-computation for predictable patterns.** If your AI feature has a bounded input space, pre-generate results during off-peak hours. Examples: product description generation for an e-commerce catalog (the product set is known), weekly report summaries (the data is available before the user requests it), and email subject line suggestions based on template categories. Store pre-computed results in Redis or a fast key-value store for sub-10ms retrieval.

**Tiered caching.** Layer your caches: check an in-memory LRU cache first (sub-1ms), then a Redis cache (1 to 5ms), then the semantic cache with vector search (10 to 50ms), and finally fall through to the LLM (500ms to 5s). Each layer catches different patterns. The in-memory cache handles repeated identical requests within a session. Redis handles popular queries across sessions. The semantic cache handles paraphrased variants of common queries.

## Optimistic UI Patterns for AI Interactions

Optimistic UI is a standard pattern for traditional CRUD operations, but it requires adaptation for AI features where the output is unpredictable.

**Immediate acknowledgment.** The instant a user triggers an AI action, show a response. This response does not need to be the AI output; it needs to signal that processing has begun. For a chat interface, show the assistant's avatar with a typing indicator within 100ms of the user sending a message. For a "summarize this document" button, immediately show a summary skeleton with animated placeholders. The user's perception of speed is anchored to this first visual change, not to the AI's actual response time.

**Predictive placeholders.** For features where the output structure is known (such as "generate 3 subject line options"), render the output structure immediately: three empty cards with loading states. As each option streams in, populate its card. This makes the feature feel 40% to 60% faster than showing a single loading spinner followed by all three options appearing at once, based on user perception studies.

**Background processing with notifications.** For AI tasks that genuinely take 10 or more seconds (document analysis, image generation, complex reasoning chains), do not block the user. Accept the request, return immediately with a task ID, and process in the background. Notify the user via an in-app notification, a subtle toast, or a badge indicator when the result is ready. This pattern works well for features like "analyze this contract" or "generate a marketing plan" where users can do other work while waiting.

**Cancellation and interruption.** Always provide a way to cancel an in-progress AI request. For streaming responses, implement an abort controller that terminates the stream. For background tasks, support cancellation via the task ID. Users who cannot cancel a slow request feel trapped, which destroys trust in the feature.

## Edge Inference and Model Selection

Where you run the model and which model you choose directly determine latency.

**Small models for low-latency tasks.** Not every AI feature needs a frontier model. For classification, sentiment analysis, entity extraction, and simple completions, smaller models respond in 100 to 300ms compared to 1 to 3 seconds for large models. Claude Haiku processes simple classification tasks in approximately 200ms. GPT-4o-mini similarly handles lightweight tasks with low latency. Use large models only for tasks that genuinely require complex reasoning.

**Model routing by task complexity.** Build a router that evaluates the incoming request and selects the appropriate model. Simple heuristics work: if the input is under 100 tokens and the task is classification, use the small model; if the input exceeds 2,000 tokens or requires multi-step reasoning, use the large model. More sophisticated routers use a lightweight classifier trained on your own task distribution. We have seen teams reduce median latency by 60% with model routing while maintaining the same quality on 95% of requests.

**Edge-deployed models.** For latency-critical features where the task is simple enough, run a small model at the edge. ONNX Runtime or TensorFlow Lite models can run classification or extraction tasks in 10 to 50ms on a Cloudflare Worker or Lambda@Edge function. This eliminates the network round-trip to a centralized model server. Good candidates: content moderation checks, language detection, and simple intent classification.

**Geographic model deployment.** If your users are globally distributed and you self-host models, deploy inference servers in multiple regions. A user in Tokyo making a request to a model server in Virginia adds 150 to 200ms of network latency each way. Deploying in ap-northeast-1 (or an equivalent) eliminates that overhead. For API-based providers, choose the closest available region for your provider's inference endpoints.

## Measuring and Optimizing Perceived Performance

Perceived performance is not the same as actual performance. Humans perceive speed through specific psychological mechanisms that you can leverage.

**Time-to-first-token (TTFT).** This is your primary latency metric. Measure it from the moment the user initiates the request to the moment the first content token renders on screen. Not the first SSE event received, but the first pixel change the user sees. Target under 500ms for conversational features and under 1 second for analytical features.

**Tokens-per-second throughput.** Once streaming begins, the rendering speed affects perceived quality. Below 15 tokens per second, users perceive the output as slow and may abandon. Above 30 tokens per second, it feels natural. Most hosted LLM APIs deliver 40 to 80 tokens per second for streaming, which is comfortably in the natural range. If your rendering pipeline introduces delays (complex Markdown rendering, syntax highlighting), optimize the render path to keep up with the token arrival rate.

**Interaction-to-completion time.** For non-streaming features, measure total time from user action to complete result display. Set budgets: under 1 second feels instant, 1 to 3 seconds feels responsive, 3 to 10 seconds requires a progress indicator, over 10 seconds should be moved to background processing.

**Progress indicators that reduce perceived wait time.** Research consistently shows that determinate progress bars (showing percentage complete) make waits feel 10% to 20% shorter than indeterminate spinners. For multi-step AI workflows, show the current step: "Analyzing document... Extracting key points... Generating summary..." Even if the steps are somewhat artificial, they make the wait feel shorter and more trustworthy.

**A/B test your latency optimizations.** Measure the impact of each optimization on user engagement metrics, not just on latency numbers. We have seen cases where reducing latency from 2 seconds to 500ms increased feature usage by 34%, and cases where it made no measurable difference because the feature was used in a low-urgency context. Let the data guide your optimization priority.

---

Making AI feel instant is an engineering challenge, not a model capability limitation. The patterns described here, streaming, caching, optimistic UI, smart model selection, and perceptual optimization, work together to create AI features that feel like a natural part of your application rather than a bolted-on afterthought. If you are building AI-powered features and want them to feel as fast as the rest of your product, [let us talk about your architecture](/contact.html).
