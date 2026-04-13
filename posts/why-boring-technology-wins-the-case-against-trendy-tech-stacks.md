# Why Boring Technology Wins: The Case Against Trendy Tech Stacks

In 2015, Dan McKinley published an essay called "Choose Boring Technology" that became one of the most cited pieces of writing in software engineering. Nearly a decade later, the advice is more relevant than ever — and more consistently ignored. The allure of the new remains powerful. Every year brings a new framework, a new database, a new paradigm that promises to solve the problems created by last year's new framework, database, and paradigm. And every year, teams adopt these tools prematurely, discover their rough edges in production, and spend months working around limitations that would not have existed if they had chosen the proven alternative.

This is not an argument against innovation. It is an argument against unnecessary novelty in the foundation of systems that need to work reliably for years. The distinction matters.

## The Innovation Token Budget

McKinley's core insight is that every organization has a limited budget for adopting unfamiliar technology — he calls them "innovation tokens." Each new, unproven technology you introduce consumes a token. You get maybe three tokens per project. Spend them all on infrastructure choices (a novel database, an experimental framework, a cutting-edge deployment platform), and you have none left for the product innovation that actually differentiates your business.

Consider a concrete scenario. A startup building a logistics management platform decides to use:
- A reactive front-end framework released six months ago
- A distributed NewSQL database they read about in a blog post
- A service mesh for inter-service communication
- Kubernetes on bare metal for deployment

Each of these technologies may be excellent in isolation. Together, they represent four innovation tokens spent entirely on infrastructure. When the team encounters a bug in the reactive framework, they cannot Google the error message because the community is too small. When the database exhibits unexpected behavior under their specific write pattern, the company's three engineers are now database kernel debuggers instead of product developers. When the service mesh drops connections during deployments, they spend a week learning its configuration model.

A team that had chosen React (or Vue or Svelte — any framework with a large community), PostgreSQL, direct HTTP calls between services, and a managed deployment platform (Heroku, Railway, Fly.io) would have encountered none of these problems. Their infrastructure would be invisible. Their innovation tokens would be spent on the logistics domain — route optimization algorithms, carrier integration patterns, real-time tracking UX — the things their customers actually pay for.

## What Makes Technology "Boring"

Boring technology is not old technology. It is technology with a well-understood failure mode profile. The distinction is important.

PostgreSQL is boring. It is also actively developed, with a new major release every year, and it contains features (JSONB, full-text search, generated columns, logical replication) that were cutting-edge when introduced. But it has been in production at hundreds of thousands of organizations for decades. Its failure modes are cataloged. Its performance characteristics under various workloads are documented. When something goes wrong, Stack Overflow has the answer. When you need an expert, they are findable and affordable.

Redis is boring. Django and Rails are boring. React is boring. Nginx is boring. AWS RDS is boring. None of these technologies are outdated or lacking in capability. They are boring because they have been subjected to millions of hours of production use across diverse contexts, and the result is a rich ecosystem of documentation, tooling, talent, and known-issue workarounds.

Contrast this with a database that launched last year. It may be architecturally superior for your use case. But its documentation is sparse, its edge cases are undiscovered, its community is small, its third-party tooling ecosystem is nascent, and the engineers who know it well all work at the company that built it. When you hit a production issue at 2 AM, you are alone.

## The Hidden Costs of Novelty

The costs of choosing trendy technology are real but often invisible in planning because they manifest as slow-downs rather than line items.

**Hiring friction.** If your stack requires expertise in a niche framework, your candidate pool shrinks dramatically. A job posting requiring Rails or Django experience will attract hundreds of qualified candidates. A posting requiring experience with a framework that has 3,000 GitHub stars will attract a handful, and they will command a premium because scarcity drives salaries. Worse, every new hire will need weeks of onboarding on the unfamiliar tools — onboarding that would be unnecessary with mainstream alternatives.

**Debugging time multiplier.** In a well-known technology, most bugs fall into documented categories. In a novel technology, you are often the first person to encounter a specific interaction between your application pattern and the tool's behavior. You cannot distinguish between "I am using this wrong" and "this is a bug in the tool" without deep reading of source code. That debugging time comes directly out of your feature-development budget.

**Upgrade and migration risk.** Young technologies change rapidly. API-breaking changes between versions are common. A major version upgrade that would be a weekend task in a mature framework becomes a multi-week project when the framework's migration path is poorly documented or does not exist. Some teams freeze their dependency versions to avoid this, which trades upgrade pain for security vulnerability accumulation.

**Ecosystem gaps.** Mature technologies have rich ecosystems of libraries, plugins, and integrations. Need to add PDF generation to a Rails app? There are five well-maintained gems. Need to add it to an app built on a two-year-old framework? You may need to write the integration yourself, or use a library maintained by one person who might lose interest next month.

## When Novelty Is Justified

The case for boring technology is not absolute. There are situations where a newer, less proven tool is the correct choice:

**When the proven tool genuinely cannot do the job.** If you need to process 10 million events per second with sub-millisecond latency, PostgreSQL is not the right answer. If you are building a real-time collaborative editor, you need a CRDT library and a WebSocket infrastructure that most traditional frameworks do not provide out of the box. When you reach the actual limits of boring technology, innovation tokens are well-spent on the specific component that needs them.

**When the novel technology has a de-risking path.** If you can isolate the novel component behind a clean interface, its failure mode affects only that component, and you have a fallback plan (revert to the boring alternative if it does not work out), the risk is contained. Using a new vector database for your search feature while keeping your core data in PostgreSQL is a reasonable risk. Putting all your data in the new vector database is not.

**When the team has genuine expertise.** If your CTO spent three years on the core team of the novel technology, the calculus changes. The debugging time multiplier disappears. The team can distinguish bugs from misuse. But this expertise must be real — having completed the tool's tutorial does not count.

The common thread: novelty is justified when it solves a specific, identified problem that boring alternatives cannot address, not when it solves a theoretical future problem or satisfies a team's desire to work with something new.

## A Decision Framework for Technology Selection

When evaluating a technology choice, run it through these questions:

1. **Has this technology been in production at organizations similar to ours for at least two years?** If yes, it qualifies as boring. If no, it is an innovation token.

2. **Can we hire for it?** Search job boards for the technology name. Are there hundreds of practitioners, or dozens? If dozens, factor the hiring constraint into the total cost.

3. **What does the failure mode look like?** When (not if) the technology fails, what is our recovery path? For PostgreSQL, the recovery path is well-documented and practiced. For a database we have used for six months, the recovery path is "call the vendor and hope."

4. **What is the switching cost?** If we adopt this technology and it does not work out, how hard is it to switch to an alternative? A front-end framework that renders standard HTML is relatively easy to replace. A database with a proprietary query language and storage format is not.

5. **Are we spending an innovation token on infrastructure or on product?** Infrastructure tokens should be spent only when necessary. Product tokens — novel features, unique UX patterns, domain-specific algorithms — are where differentiation lives.

6. **What would our incident response look like?** Picture a production outage caused by this technology at 3 AM. Who do we call? What documentation exists? What community forums can we search? If the answer is "nobody, nothing, and nowhere," the technology is riskier than it appears.

## Making Boring Technology Interesting

There is a concern that choosing boring technology leads to boring products. This is precisely backward. The most innovative products are built on the most stable foundations. Instagram ran on Django and PostgreSQL. Shopify runs on Rails and MySQL. GitHub ran on Rails for years. Basecamp still runs on Rails. These are not boring products — they are products whose teams invested their creativity in the user experience and business logic rather than in fighting their infrastructure.

The engineer who builds an extraordinary user experience using React, PostgreSQL, and a straightforward server framework is doing more interesting work than the engineer who spends half their time debugging a novel framework's rendering pipeline. The first engineer is solving business problems. The second is solving infrastructure problems that were self-inflicted.

Boring technology frees you to be creative where creativity matters: at the product layer, where your users actually experience the result of your work.

---

If you are making technology decisions for a new project and want to avoid the innovation-token trap, [we would enjoy that conversation](/contact.html). We have strong opinions about technology choices, grounded in years of watching teams succeed with proven tools and struggle with premature novelty.
