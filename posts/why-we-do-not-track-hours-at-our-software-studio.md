# Why We Do Not Track Hours at Our Software Studio

Most software companies track hours. Timesheets are filled out on Friday afternoons. Billable utilization rates are calculated. Engineers are expected to account for every 15-minute block of their workday. The entire system is so entrenched that questioning it feels like questioning gravity.

We stopped tracking hours at The Proper Motion Company. Not because we are cavalier about productivity or costs, but because we examined what hour tracking actually produces versus what it claims to produce, and the math did not work. The overhead, the behavioral distortions, and the misaligned incentives created by time tracking cost us more than the information it provided. Replacing it with outcome-based measurement made us faster, more honest with clients, and better at building software.

## The Hidden Costs of Time Tracking

Time tracking appears free. The tools cost $8-15 per user per month. The time to fill out a timesheet is 5-10 minutes per day. But the real costs are behavioral, and they compound.

**Context switching for logging.** An engineer deep in a complex debugging session does not want to stop, open a time tracking tool, log the previous 90 minutes, categorize it, and resume. The interruption breaks flow state --- a psychological condition where cognitive performance peaks. Research from Gloria Mark at UC Irvine shows that it takes an average of 23 minutes to return to the same depth of focus after an interruption. If an engineer logs time four times per day, that is potentially 92 minutes of lost deep work. Across a five-person team, that is 7.6 hours daily --- nearly a full person's output --- lost to the overhead of measuring the other four people's output.

**Incentive to fill hours, not solve problems.** When engineers are measured by billable hours, the rational behavior is to take longer. An engineer who solves a complex problem in 2 hours through clever thinking and efficient work is "less productive" than one who takes 8 hours through brute force. The time tracking system literally penalizes efficiency. Across hundreds of engineering organizations, this incentive distortion is one of the most consistent findings in software management research.

**Inaccurate data masquerading as precise data.** Studies on time tracking accuracy show that retrospective time logs (filled out at the end of the day or week) are inaccurate by 20-40%. People round up, round down, misremember, and categorize incorrectly. The resulting data feels precise because it has timestamps and decimal points, but it is substantially fictional. Decisions made on this data are not data-driven. They are fiction-driven with extra steps.

**Erosion of trust.** Time tracking communicates a message: "We do not trust you to use your time well, so we require proof." This message is corrosive to the kind of intrinsic motivation that drives the best engineering work. The engineers who build exceptional software do it because they care about craft, not because a timesheet is watching. Surveillance-oriented management selects for compliance, not creativity.


> Related: [What Ship It Actually Means in Software Development](/blog/what-ship-it-actually-means-in-software-development/)


## What We Measure Instead

Eliminating time tracking does not mean eliminating accountability. It means measuring things that actually correlate with client value.

**Deliverables completed per sprint.** Each sprint has a defined set of deliverables --- features, bug fixes, improvements --- with clear acceptance criteria. At the end of the sprint, the deliverables are either done and working or they are not. This binary accountability is more honest than "we spent 80 hours on the project this week" because 80 hours of effort can produce anything from a breakthrough feature to absolutely nothing.

**Cycle time.** We measure how long it takes from the moment a task is started to the moment it is deployed to production. This metric captures the full efficiency of our process: development speed, code review turnaround, testing thoroughness, and deployment pipeline health. A team with short cycle times is delivering value quickly. A team with long cycle times has bottlenecks worth investigating. Unlike hours logged, cycle time measures the output side of the equation.

**Client satisfaction and product outcomes.** Every two weeks, we check in with clients about their satisfaction with progress, quality, and communication. Monthly, we review the product metrics that the software is intended to affect: user adoption, error rates, performance benchmarks, business KPIs. These outcome measurements tell us whether the work is creating value. Hours worked tells us nothing about value.

**Code quality signals.** We track test coverage, deployment frequency, change failure rate, and mean time to recovery. These DORA metrics (from Google's DevOps Research and Assessment program) are the strongest known predictors of software delivery performance. A team with high deployment frequency and low change failure rate is producing reliable software efficiently, regardless of how many hours they logged.

## How This Changes Our Client Relationships

Most development firms sell hours. We sell outcomes. This distinction reshapes the client relationship in important ways.

**Scope conversations focus on value, not cost.** When a client asks for a new feature, the traditional conversation is: "How many hours will this take? What will it cost?" Our conversation is: "What business outcome does this feature serve? What is the simplest version that achieves that outcome? Let's build that, measure the result, and iterate." This produces leaner, more effective features because neither party is incentivized to inflate scope.

**Budget predictability improves.** We price projects based on scope and complexity, not estimated hours. A client who hires us for a 12-week engagement knows the cost from day one. There are no surprise invoices because a task "took longer than estimated." The risk of estimation errors sits with us, which motivates us to estimate honestly and work efficiently. Under an hourly model, estimation errors are the client's problem --- if the team underestimates, the client pays more. That misalignment of incentives is a structural flaw, not a minor inconvenience.

**The team optimizes for speed, not duration.** When nobody is billing hours, the fastest solution is the best solution. If an engineer can solve a problem in 30 minutes using an open-source library instead of 3 days of custom code, they choose the library without hesitation. Under an hourly model, the custom code option generates 24 more billable hours. We have watched firms operate under both models, and the behavioral difference is dramatic.

**Trust replaces surveillance.** Clients trust us to manage our time because our incentives are aligned with theirs. We get paid for delivering working software, not for occupying seats. Clients do not ask how many hours we worked this week. They ask what we shipped. That shift in conversation represents a fundamentally healthier working relationship.


> See also: [Why Great Software Feels Invisible to Users](/blog/why-great-software-feels-invisible-to-users/)


## The Objections We Hear (and Our Responses)

**"How do you estimate project costs without tracking hours?"** We estimate based on scope decomposition and historical data from similar projects. When we have built three similar authentication systems in the past, we know that an authentication system takes approximately 2-3 weeks of our team's effort, regardless of the exact hours. Our estimates are calibrated against outcomes, not timesheets.

**"What if an engineer is not performing?"** We know within days, not because a timesheet shows they logged fewer hours, but because their deliverables are not completed, their code reviews reveal quality issues, or their cycle time is significantly longer than the team average. These signals are faster and more accurate than hour counts.

**"Do you not need timesheets for invoicing?"** No. We invoice based on milestones or fixed monthly fees, depending on the engagement structure. The invoice says "Sprint 4 deliverables completed" with a list of what was built, not "127.5 hours at $175/hour." Clients know exactly what they are paying for.

**"Is this not just unlimited overtime in disguise?"** The opposite. Without the pressure to hit a billable hours target, our team works sustainable hours. There is no incentive to pad timesheets by working late. There is no guilt about finishing early on a productive day. The result is better work-life balance, not worse. Our average work week is around 40 hours, with occasional short bursts during launch periods that are followed by lighter weeks.

## The Broader Shift Toward Outcome-Based Work

Our approach is not radical in isolation. It reflects a broader movement in knowledge work away from industrial-era measurement (hours, attendance, busyness) and toward outcomes-based measurement (value delivered, quality produced, problems solved).

GitLab, Basecamp, Doist, and a growing number of software organizations have adopted similar philosophies. The common thread is a recognition that in creative, cognitive work, the relationship between time spent and value produced is weak. An engineer who spends 4 focused hours can produce more value than one who spends 10 distracted hours. Measuring the 10 hours as "more productive" is not just wrong. It actively selects for the wrong behavior.

The transition away from time tracking requires trust, clear expectations, and robust outcome measurement. It is not appropriate for every organization or every engagement type. Fixed-scope, fixed-price projects work naturally without timesheets. Staff augmentation engagements, where you are literally renting a person's time, legitimately require time tracking.

But for organizations building software products --- where the goal is to ship valuable, working software as efficiently as possible --- we believe outcome-based measurement produces better software, healthier teams, and more honest client relationships than any timesheet ever could.

---

If our approach resonates with how you want to work, [get in touch](/contact.html). We would be glad to discuss your project and how we can deliver results without the overhead.
