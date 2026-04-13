# What We Learned Building Our Own Company Website

There is an old joke in the industry that the cobbler's children have no shoes. Software studios are notorious for having outdated, half-finished, or deeply generic websites while building beautiful products for their clients. We were no different. For the first stretch of The Proper Motion Company's existence, our website was an afterthought. When we finally committed to building it properly, the process taught us things about scope, decision-making, and self-awareness that no client project ever had. Here is what we learned.

## The Hardest Client Is Yourself

When you build for a client, the constraints are clarifying. There is a budget, a timeline, a stakeholder who approves designs, and a set of requirements that someone else defined. When you build for yourself, every constraint evaporates and the project balloons.

We spent three weeks debating whether to use a static site generator, a headless CMS with a front end framework, or a completely custom solution. For a company website. A site that, at its core, needs to communicate what we do, show some work, and provide a way to get in touch. That decision should have taken an afternoon.

The lesson was that self-imposed projects need the same discipline as client projects. We eventually assigned one person as the "product owner" who made final calls on scope and design. We set a two-week build window with a hard launch date. We wrote a brief, just like we would for a client, defining the audience, the goals, and the constraints. The moment we treated ourselves as a client, the project started moving.

If you run a studio or any services business and your own website is perpetually under construction, the fix is not more design reviews or more technology evaluation. The fix is a deadline and a decision-maker.

## We Over-Engineered the First Version

Our first attempt involved a React front end with server-side rendering, a headless CMS for content management, a custom animation library for page transitions, and a CI/CD pipeline with staging environments. For a site with five pages and a contact form.

We were building the website we wanted to show off, not the website our potential clients needed. A founder evaluating software studios does not care whether your site uses server-side rendering. They care whether your portfolio demonstrates relevant experience and whether they can quickly understand what you offer.

We scrapped it and rebuilt with plain HTML, CSS, and minimal JavaScript. The site loads in under a second on any connection. It scores 100 on every Lighthouse audit category. There are no build steps, no dependencies to update, no CMS to maintain. When we need to add a case study, we write HTML. It takes ten minutes.

The takeaway applies to any product decision: technology choices should be driven by the problem, not by what the engineering team finds interesting. A static site with excellent content beats a technically sophisticated site with mediocre content every time.

## Content Is the Actual Product

We spent far more time on content than on code, and that was the right call. The homepage copy went through seven revisions. Each case study took days to write. We agonized over what to include on the services page, what language to use, and how to describe our process without sounding like every other studio.

What worked was being specific. Instead of saying "we build custom software," we described the types of problems we solve and the types of clients we work with. Instead of listing technologies, we described outcomes. Instead of generic testimonials, we wrote detailed case studies that explained the problem, the approach, and the result.

The content creation process also forced useful internal conversations. Writing about our process required us to actually codify our process. Describing our ideal client forced us to define who that was. Drafting case studies required revisiting projects and articulating what we did well and what we would do differently. The website became a forcing function for organizational clarity.

For anyone building a company website, budget at least 60% of the project time for content. The design and development are the easy parts. Writing honest, specific, compelling copy that differentiates you from competitors is where the real work happens.

## Performance as a Non-Negotiable

We made a deliberate decision to optimize for performance from the start, not as a polish step at the end. This meant no web fonts beyond system fonts, no JavaScript frameworks, no third-party analytics scripts on initial load, and images optimized and served in modern formats.

The result is a site that loads almost instantly on any device. First Contentful Paint under 0.5 seconds. Total page weight under 200KB. This matters for two practical reasons.

First, performance correlates with conversion. Google's research consistently shows that each additional second of load time increases bounce rate by 20 to 30 percent. For a services company where every qualified lead has significant lifetime value, reducing bounce rate even marginally has an outsized impact.

Second, performance reflects our values. If we claim to build high-quality software, our own website should demonstrate that quality. A slow, bloated site undermines credibility before a visitor reads a single word.

The specific choices we made were: system font stacks (which look perfectly good on modern operating systems), SVG for icons and logos, responsive images with srcset for photographs, lazy loading for anything below the fold, and inline critical CSS to eliminate render-blocking requests. None of these are cutting-edge techniques. They are basics that too many sites skip because the development team defaults to familiar tooling that adds weight.

## Design Decisions That Survived Contact with Reality

We went through multiple design directions before landing on something that worked. The early concepts were heavily influenced by studio portfolios we admired, full-bleed imagery, dramatic animations, experimental typography. They looked great in Figma. They failed in practice.

The problem was that visitors to a custom software studio's website are not browsing for visual entertainment. They are evaluating a potential business partner. They want to understand capability, see relevant experience, and find a way to start a conversation. Dense typography and subtle animations get in the way of that.

The design that worked is simple almost to the point of being plain. Clean typography with generous line heights. Straightforward navigation. Case studies with large screenshots and concise descriptions. A prominent contact section on every page. No animations beyond standard hover states.

We ran the site through a usability exercise with five people matching our target audience: founders and CTOs at companies considering custom software. Every one of them navigated to a case study within ten seconds and found the contact page within twenty. That validated the approach more than any design award would.

The lesson is that design quality is not measured by visual complexity. It is measured by how quickly and comfortably a visitor accomplishes their goal. For a services company, that goal is usually: understand what they do, decide if they are credible, and reach out.

## What We Would Do Differently

If we built the site again from scratch, we would change three things.

First, we would start with content before any design work. We did some of this, but not enough. Several design decisions had to be revisited because the content did not fit the layout assumptions. Starting with final or near-final content would have saved a full week of back-and-forth.

Second, we would set up analytics from day one but keep it simple. We launched without any analytics and added Plausible (a privacy-focused, lightweight alternative to Google Analytics) two months later. Those first two months of data are gone. Even basic visit counts and referral sources help you understand which marketing efforts are working.

Third, we would build the blog infrastructure from the start. We initially planned to add a blog later, which meant we had to retrofit it after launch. Building it into the initial architecture, even if the first post came weeks later, would have been simpler.

One thing we would not change is the technology choice. Plain HTML and CSS with no build process has been maintenance-free for the entirety of the site's existence. We have never had to update a dependency, fix a broken build, or deal with a framework upgrade. For a site that we update infrequently and need to be reliable, zero dependencies is the right architecture.

Building your own company website is a deceptively difficult project because the constraints are soft and the stakeholders have strong opinions. The best thing you can do is treat it like a real project with a real deadline, optimize for clarity over cleverness, and invest the majority of your effort in content that honestly represents what you do and who you do it for.

---

If you are building a product and need a team that applies this same rigor to your software, [reach out to us](/contact.html). We would love to hear about what you are working on.
