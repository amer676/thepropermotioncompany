# The Commoditization of Code: What AI Means for Custom Software

In 2023, GitHub reported that Copilot was generating 46 percent of the code in files where it was active. By mid-2024, that number crossed 55 percent. AI-assisted code generation is not a novelty anymore -- it is a production tool used by millions of developers daily. The question this raises for anyone who builds or buys custom software is straightforward: if code is getting cheaper to produce, what does that do to the value of custom software?

The short answer is that code was never the expensive part. The expensive parts -- understanding a problem deeply enough to solve it correctly, designing systems that remain maintainable as requirements evolve, and operating software reliably in production -- have not been commoditized. If anything, faster code generation amplifies the importance of everything that surrounds the code itself.

## The Parts of Software That AI Actually Commoditizes

To understand where the value is shifting, we need to be specific about what AI code generation does well and what it does not.

AI excels at producing boilerplate code. CRUD endpoints, data model definitions, form validation logic, unit tests for straightforward functions, API client wrappers, database migration files -- these are patterns with well-established conventions and thousands of examples in training data. A developer using Copilot or Claude can generate a complete REST API for a data model in minutes instead of hours. This is genuine productivity improvement, and it compresses the cost of code that follows common patterns by 40-60 percent.

AI is also effective at translation tasks: converting a React component from class-based to functional, porting a Python script to TypeScript, transforming a SQL query from one dialect to another. These tasks required human attention before, and now they often do not.

What this means in practice: the portion of a custom software project that involves writing standard, pattern-following code -- which typically accounts for 30-40 percent of total development effort -- is getting dramatically cheaper. A feature that took a developer two weeks might take one week with AI assistance, not because the developer is coding twice as fast but because they spend less time on the mechanical parts and more time on the parts that require judgment.


> Related: [The Future of AI in Software Development: What Businesses Should Know](/blog/the-future-of-ai-in-software-development-what-businesses-should-know/)


## The Parts That Remain Stubbornly Expensive

Here is what AI code generation does not do well, and likely will not do well for the foreseeable future.

**Requirements discovery**: The hardest part of most software projects is figuring out what to build. A healthcare company that needs a patient intake system does not hand you a specification -- they hand you a set of conflicting workflows, regulatory constraints, edge cases they have not thought of yet, and unstated assumptions about how the system should behave. Extracting, reconciling, and prioritizing these requirements is a human process that requires domain knowledge, active listening, and the ability to ask questions people did not know they needed to answer. AI cannot attend a stakeholder interview and notice that the CFO and the operations director have fundamentally different visions for the product.

**System design and architecture**: Deciding how to structure a system -- where to draw service boundaries, how to model the data, what the failure modes are, how the system will evolve over the next three years -- requires context that AI tools do not have access to. An architect choosing between a monolithic and distributed architecture is weighing team size, expected traffic patterns, deployment constraints, organizational structure, budget, and a dozen other factors specific to this project and this organization. AI can generate code for either architecture, but it cannot tell you which one is right for your situation.

**Integration with reality**: Software does not exist in a vacuum. It integrates with payment processors that have quirky APIs, legacy databases with undocumented schemas, third-party services that rate-limit in unexpected ways, and organizational processes that predate the internet. Navigating these integration challenges requires investigation, experimentation, and creative problem-solving that is deeply specific to each project's context.

**Operational excellence**: Writing code that works in a test environment and running software reliably in production are different disciplines. Monitoring, alerting, incident response, performance tuning, security patching, backup verification, and capacity planning are all operational concerns that AI-generated code does not address. A microservice that AI helped you write in an afternoon still needs to be deployed, monitored, and maintained by humans who understand its failure modes.

## What This Means for the Cost of Custom Software

The commoditization of code changes the cost structure of custom software, but not in the way most people assume. It does not make custom software radically cheaper across the board. Instead, it shifts the cost from implementation to three other areas.

**Discovery and design become a larger share of the budget**: If coding takes 40 percent less time but requirements gathering, system design, and UX design take the same amount of time as always, those phases become a proportionally larger part of the project. A project that was previously 30 percent design and 70 percent implementation might become 40 percent design and 60 percent implementation. Smart teams recognize this and invest more in the upfront phases, which actually improves outcomes because the most expensive bugs are the ones caused by building the wrong thing.

**Quality assurance becomes more critical**: AI-generated code introduces subtle bugs at a rate that varies by complexity. For boilerplate code, AI output is reliable. For complex business logic, it often looks correct but handles edge cases incorrectly. This means that code review, testing, and QA need to be more thorough, not less. The developer's role shifts from writing code to reviewing, testing, and refining code -- a higher-skill activity that commands at least the same compensation.

**Maintenance and evolution costs remain unchanged**: AI can help write the initial version of a feature, but evolving that feature six months later -- when the requirements have shifted, the data model has changed, and the original context has been lost -- still requires a developer who understands the system holistically. Maintenance has always been the majority of software's lifetime cost (typically 60-80 percent), and that ratio is unlikely to change.


> See also: [The AI Technology Stack: Models, Frameworks, and Infrastructure Guide](/blog/the-ai-technology-stack-models-frameworks-and-infrastructure-guide/)


## The Competitive Implications for Businesses

For businesses that buy custom software, this shift has several practical implications.

**Time to market compresses**: Features ship faster, which is a genuine competitive advantage. A company that can validate an idea with working software in four weeks instead of eight has a real edge in learning speed and market responsiveness.

**The barrier to entry for software-enabled businesses drops**: If a logistics startup can build a basic fleet management system 40 percent faster than before, that is 40 percent less runway burned before they have a product in customers' hands. This lowers the capital requirements for software-heavy businesses, which means more competition.

**Differentiation shifts to the problem layer**: When everyone has access to fast code generation, the differentiator is no longer technical execution -- it is understanding the problem better than anyone else. A company that deeply understands the workflows of veterinary clinics and builds software specifically for their pain points will outperform a company that uses AI to generate a generic practice management system, even if the generic version has more features.

## What This Means for Choosing a Development Partner

If you are evaluating development agencies or technical partners in this landscape, here is what matters more than it used to, and what matters less.

**Matters more**: Domain expertise (do they understand your industry and its specific challenges), design capability (can they discover requirements and translate them into a well-structured product), architecture skills (can they make the structural decisions that keep the system maintainable as it grows), and operational maturity (can they deploy, monitor, and maintain what they build).

**Matters less**: Raw coding speed (AI equalizes this to a significant degree), familiarity with any one specific framework (the patterns transfer across frameworks, and AI handles the syntax), and team size (a smaller team with AI tools can match the output of a larger team without them).

The best development partners in 2024 and beyond are those who use AI to amplify their existing strengths in design, architecture, and domain understanding -- not those who treat AI as a way to cut corners on the parts of software development that actually determine whether the product succeeds.

## The Path Forward for Custom Software

Code is being commoditized, but software is not. Software is the combination of code, design, infrastructure, data, processes, and the accumulated understanding of a specific problem domain. AI makes one of those components cheaper to produce, which is genuinely valuable, but it does not replace the rest.

The organizations that benefit most from this shift are those that redirect the time and money saved on coding toward deeper problem understanding, better design, more thorough testing, and more robust operations. They use AI as a multiplier on their existing capabilities rather than as a replacement for the human judgment that makes software actually useful.

---

The Proper Motion Company builds custom software with a clear-eyed view of where AI helps and where human expertise remains essential. If you are planning a software project and want a partner who leverages AI tools without confusing faster coding with better software, [start a conversation with us](/contact.html).
