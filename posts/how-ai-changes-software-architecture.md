# How AI Changes Software Architecture

Adding AI to a software product isn't like adding a search bar or a payment integration. AI introduces fundamentally different architectural constraints: non-deterministic outputs, high-latency inference, expensive compute, evolving model capabilities, and failure modes that look nothing like traditional bugs. The architectural patterns that emerge when AI is a core feature are distinct from what most engineering teams are accustomed to, and getting them wrong leads to products that are expensive, unreliable, and impossible to iterate on.

## The Inference Layer as a First-Class Architectural Boundary

In traditional software, you call a function and get a predictable result. With AI, you call a model and get a probabilistic result that might be brilliant, might be mediocre, and might be confidently wrong. This fundamental difference demands that AI inference be treated as its own architectural layer with clear boundaries, contracts, and failure handling.

Design your inference layer as a service with a well-defined API. Inputs go in (prompt, parameters, context), structured outputs come out (generated text, classification result, embedding vector). The rest of your application should not know or care whether the underlying model is GPT-4, Claude, Llama, or a fine-tuned model running on your own infrastructure. This abstraction isn't academic -- model providers have outages, pricing changes, capability shifts, and deprecation schedules. Teams that hard-wire a specific model's API throughout their application spend months on migration when they need to switch.

The inference layer should handle: model selection and routing (choosing the right model for the task), prompt construction (assembling the full prompt from templates and context), response parsing (extracting structured data from model output), retry logic (with exponential backoff and model fallback), and cost tracking (logging token usage per request). Each of these is a non-trivial subsystem.

**Model routing** is particularly important. Not every request needs the most capable (and expensive) model. A classification task might run perfectly well on a smaller model at 1/20th the cost. A complex reasoning task needs the frontier model. Build routing logic that selects models based on task type, required quality, latency budget, and cost constraints. Some teams implement a "cascade" pattern: try the cheaper model first, evaluate the confidence of its output, and escalate to a more capable model only when confidence is below a threshold.


> Related: [The AI Technology Stack: Models, Frameworks, and Infrastructure Guide](/blog/the-ai-technology-stack-models-frameworks-and-infrastructure-guide/)


## Prompt Engineering as Software Engineering

Prompts are code. They have inputs, logic, and outputs. They need version control, testing, and monitoring. Yet most teams manage prompts as ad hoc strings embedded in application code, with no systematic approach to iteration or quality assurance.

Separate prompts from application code. Store them in a dedicated prompt registry -- this can be as simple as a directory of versioned template files or as sophisticated as a prompt management platform. Each prompt template should have: a version identifier, input variable definitions, expected output schema, evaluation criteria, and test cases.

**Prompt composition** is an emerging architectural pattern. Complex AI features rarely work with a single prompt. Instead, you chain multiple prompts together, where the output of one becomes the input to the next. An AI-powered contract review tool might use: Prompt 1 to extract key clauses, Prompt 2 to identify risk factors in each clause, and Prompt 3 to generate a summary with recommendations. Each prompt is optimized independently, tested independently, and can use a different model.

This chaining pattern creates a **directed acyclic graph (DAG) of inference calls**. Some steps can run in parallel (extracting clauses from different sections), some are sequential (you can't summarize until extraction is complete). Orchestrating this DAG efficiently -- parallelizing where possible, handling partial failures, and managing intermediate state -- is a real engineering problem. Tools like LangChain, LlamaIndex, and custom orchestrators address this, but be cautious about over-abstracting. Many teams find that a simple async/await pipeline with explicit error handling is more maintainable than a framework.

## Context Management and the RAG Architecture

Large language models have limited context windows, and even the largest windows are expensive to fill. Most AI features require external knowledge that doesn't live in the model's training data: your product's documentation, the user's historical data, domain-specific reference material. Retrieval-Augmented Generation (RAG) is the dominant pattern for bridging this gap.

A production RAG system has three components: an **ingestion pipeline** that processes documents into searchable chunks, a **retrieval engine** that finds relevant chunks given a query, and a **generation layer** that synthesizes retrieved context into a response.

The ingestion pipeline is where most quality problems originate. Chunking strategy matters enormously. Splitting a legal document into 512-token chunks with no overlap will produce chunks that break mid-sentence, lose paragraph context, and fragment related concepts. Use semantic chunking: split on paragraph boundaries, maintain section hierarchy, and include overlap between chunks. For structured data (tables, forms), preserve the structure in the chunk metadata rather than flattening it to text.

**Embedding model selection** affects retrieval quality directly. OpenAI's text-embedding-3-large, Cohere's embed-v3, and open-source alternatives like BGE or E5 produce meaningfully different retrieval results for different content types. Benchmark multiple embedding models against your actual document corpus before committing. Store embeddings in a vector database (Pinecone, Weaviate, pgvector in PostgreSQL) and pair vector similarity search with keyword search (BM25) for hybrid retrieval. Hybrid retrieval consistently outperforms either approach alone.

**Context window management** is an optimization problem. You have a limited token budget (say, 128K tokens for a frontier model), and you need to allocate it between: the system prompt, retrieved context, conversation history, and the user's current query. Build a context budget allocator that dynamically adjusts how much space each component gets based on the task. A first-time query with no conversation history can devote more tokens to retrieved context. A deep conversational exchange needs more history tokens and fewer retrieval tokens.


> See also: [AI for Human Resources: Recruiting, Onboarding, and Workforce Analytics](/blog/ai-for-human-resources-recruiting-onboarding-and-workforce-analytics/)


## Evaluation, Guardrails, and the Trust Problem

The hardest part of AI architecture is knowing whether the system is working well. Traditional software has clear correctness criteria -- the function returns the right number, the page renders correctly, the email gets sent. AI outputs exist on a spectrum of quality, and that spectrum shifts with every prompt change, model update, and dataset modification.

Build an **evaluation pipeline** that runs continuously, not just during development. Define evaluation datasets -- sets of inputs with known-good outputs -- for every AI feature. Run these evaluations automatically on every prompt change, model version change, and on a regular schedule (daily at minimum). Track evaluation scores over time. A regression in evaluation scores after a model provider update tells you something changed before users complain.

**Guardrails** are the runtime complement to evaluation. They catch bad outputs before they reach users. Common guardrail patterns include: format validation (does the output match the expected JSON schema?), toxicity filtering (does the output contain inappropriate content?), factual grounding checks (can the output's claims be traced back to provided context?), and confidence thresholds (does the model express appropriate uncertainty?).

Implement guardrails as middleware in your inference layer. Every model response passes through the guardrail chain before reaching the application. Failed guardrails trigger fallback behavior: a retry with a modified prompt, a graceful degradation to a non-AI feature, or a human-in-the-loop escalation. Log every guardrail trigger for analysis.

**Human-in-the-loop (HITL)** isn't a failure state -- it's an architectural pattern. For high-stakes decisions (medical recommendations, financial advice, legal analysis), design the system so AI generates a draft that a human reviews and approves. The architecture needs to support: queueing items for review, tracking review status, capturing human feedback, and using that feedback to improve the system over time.

## Cost Architecture and Token Economics

AI inference is expensive in ways that traditional compute is not. A single GPT-4 request can cost $0.01-0.10 depending on input/output length. At scale, AI inference easily becomes your largest line item after personnel.

Build **cost tracking** into your inference layer from day one. Log token usage (input tokens and output tokens separately, since they're priced differently) for every request, tagged with the feature, user, and tenant. This data feeds into: cost dashboards for engineering, usage-based billing for customers, and optimization prioritization.

**Caching** is your most powerful cost optimization tool. Many AI applications generate identical or near-identical requests. An FAQ bot answering the same question for the thousandth time doesn't need a fresh inference call. Implement semantic caching: hash the input (or use embedding similarity), and return cached results for inputs that closely match previous requests. A well-implemented cache can reduce inference costs by 40-70% for applications with repetitive query patterns.

**Streaming responses** are both a UX pattern and an architectural decision. Streaming the model's output token-by-token to the user reduces perceived latency dramatically -- the user sees the response forming in real time rather than waiting 5-15 seconds for a complete response. This requires WebSocket or Server-Sent Events connections, changes your error handling (what happens when the stream fails mid-response?), and affects caching (you need the complete response before you can cache it).

Design your pricing model around AI costs from the start. If your product's core value is AI-generated, your pricing needs to account for per-request inference costs. Usage-based pricing (charge per generation, per analysis, per query) aligns costs with revenue. Flat-rate pricing requires careful modeling of expected usage per customer tier and generous margins to absorb heavy users.

---

If you're building an AI-powered product and need to get the architectural foundations right, [we should talk](/contact.html). We help teams design inference pipelines, RAG systems, and evaluation frameworks that scale without spiraling costs.
