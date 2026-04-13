# Customer Development for Software Products

Most software products fail not because of bad engineering but because they solve a problem nobody is willing to pay to fix. Customer development is the disciplined process of validating that your product idea matches a real market need before you invest months of engineering time. It is the difference between building something people want and building something you assume people want.

This guide covers how to do customer development specifically for software products, where the temptation to skip research and start coding is strongest.

## Identifying and Segmenting Your Target Customers

Customer development starts by defining who you are building for with enough specificity to find them and learn from them.

**Problem-first segmentation.** Do not start with demographics. Start with the problem. Instead of "marketing managers at mid-size companies," define your target as "marketing managers who spend more than 5 hours per week manually compiling performance reports from multiple ad platforms." The problem-first framing tells you exactly what to validate and where to find these people (LinkedIn groups about marketing analytics, MarTech conferences, subreddits about advertising operations).

**Identify the economic buyer.** In B2B software, the person who experiences the problem and the person who authorizes the purchase are often different. A customer support agent suffers from a bad ticketing workflow, but the VP of Customer Success signs the check. Your customer development process must include both: the user (who validates the problem exists and your solution addresses it) and the buyer (who validates they will pay to solve it).

**Early adopter profile.** Not every potential customer is a good first customer. Early adopters share specific traits: they actively search for solutions (they have already tried spreadsheets, manual processes, or competitor products), they have budget authority or influence, they are willing to tolerate imperfect software in exchange for solving their problem, and they will give you feedback. In B2B, these are typically companies between 50 and 500 employees, growing fast enough that their current tools are breaking but not so large that procurement takes 6 months.

**Segment sizing.** Estimate the total addressable market for your specific segment. Use a bottom-up approach: how many companies match your criteria (LinkedIn Sales Navigator can filter by headcount, industry, and job titles), multiplied by your estimated annual contract value. If the segment is smaller than $10M in annual revenue potential, it may not sustain a venture-scale business, but it could be a very profitable niche product.

## Conducting Customer Discovery Interviews

Interviews are the core of customer development. Most founders do them badly by pitching instead of listening.

**The Mom Test framework.** Rob Fitzpatrick's The Mom Test provides the foundational principle: ask about their life, not your idea. Bad question: "Would you use a tool that automatically compiles marketing reports?" (they will say yes to be polite). Good question: "Walk me through how you compile your weekly marketing performance report. How long does it take? What is most frustrating about the process?" This reveals the actual behavior and pain level without biasing the response.

**Interview structure.** A 30-minute customer discovery interview should follow this flow. Minutes 1 to 3: context setting and rapport. Minutes 3 to 15: understanding their current workflow (what they do, how they do it, what tools they use, what frustrates them). Minutes 15 to 22: exploring the impact (what happens when this goes wrong, how much time/money it costs, have they tried to fix it). Minutes 22 to 28: understanding their buying process (how they evaluate new tools, who else is involved, what budget exists). Minutes 28 to 30: ask for referrals to others with similar problems.

**Sample size.** Conduct 15 to 25 interviews per customer segment. After 8 to 12 interviews, you will start hearing the same problems and workflows repeated. This is convergence, and it signals that you have a reasonably accurate understanding of the segment. If you reach 20 interviews without convergence, your segment definition may be too broad.

**Recruiting interview subjects.** Cold outreach on LinkedIn works if your message references their specific role and a credible reason for the conversation ("I am researching how marketing teams handle cross-platform reporting. Would you be open to a 25-minute call? I am not selling anything."). Offer a $50 gift card for their time. The acceptance rate for well-targeted, non-salesy cold outreach is typically 8% to 15%. You need to send 100 to 200 messages to book 15 interviews.

**Note-taking and analysis.** Record interviews (with permission) and take structured notes immediately after. For each interview, capture: the interviewee's role and company context, the top 3 problems they described, how they currently solve those problems, quantified impact (time, money, frustration level), and any direct quotes that are particularly insightful. After completing your interviews, look for patterns: which problems appear in more than 60% of interviews? Those are your validated problems.

## Validating Willingness to Pay

Identifying a problem is necessary but not sufficient. The problem must be painful enough that people will spend money to solve it.

**The "shut up and take my money" test.** During later interviews, describe your proposed solution in one sentence and ask: "If this existed today, would you buy it?" Then follow up with: "What would you expect to pay for it?" and "How would this compare to your current spending on this problem?" The responses fall into three categories: enthusiasm with a specific price range (strong signal), polite interest without commitment (weak signal), and confusion or indifference (negative signal). You need at least 8 out of 15 interviews showing enthusiasm with price range to proceed confidently.

**Pre-selling.** The strongest validation is a purchase commitment before the product exists. Create a landing page describing the product, include pricing, and add a "Reserve your spot" or "Join the waitlist with $X deposit" button. A waitlist with a deposit (even $1) demonstrates dramatically stronger intent than a free email signup. If 50 people visit your landing page and 5 put down a deposit, you have a 10% conversion rate, which is strong for an unbuilt product.

**Competitive spending analysis.** Research what your target customers currently spend on the problem. This includes direct software costs (competitor tools they use), labor costs (salary of the people performing the task manually), and indirect costs (revenue lost due to inefficiency, error correction costs). If the total current spend is $500/month and your product costs $200/month, the value proposition is clear. If the current spend is $50/month, you need to demonstrate 10x value improvement to justify switching costs.

**Pricing anchoring from interviews.** Never ask "What would you pay?" in isolation. Instead, present two options: "Would you prefer a $99/month plan with these features, or a $299/month plan with these additional capabilities?" This forces the interviewee into a relative evaluation rather than an abstract valuation. The pattern of responses reveals price sensitivity: if most choose the higher tier, your lower tier is underpriced.

## Building and Testing Your Minimum Viable Product

Customer development does not end when you start building. It continues through MVP development and beyond.

**Defining MVP scope.** Your MVP should solve exactly one core problem for exactly one customer segment. List every feature you have considered, then ruthlessly cut anything that is not essential to solving the validated core problem. A good MVP for a marketing reporting tool is: connect to 3 ad platforms, pull spend and conversion data, generate a formatted weekly PDF report. Not in the MVP: custom dashboards, team collaboration, budget forecasting, A/B test analysis. Those are version 2 features informed by post-launch customer feedback.

**Concierge MVP.** Before writing code, consider whether you can deliver the value manually. For the marketing reporting tool, you could manually pull data from the customer's ad platforms, compile the report in Google Sheets, and email it weekly. This takes you 2 hours per customer but validates demand with zero engineering investment. If 5 customers pay $200/month for this manual service, you have proven demand and funded the first 2 months of development.

**Wizard of Oz MVP.** The interface looks automated, but a human performs the work behind the scenes. The customer sees a dashboard and clicks "Generate Report," but you manually compile the data and upload it. This tests the user experience and workflow without building the automation layer. Transition to full automation once you have confirmed the workflow matches customer expectations.

**Closed beta structure.** Launch your coded MVP to 10 to 20 customers. Charge them (at a discounted "founding member" rate, typically 50% of your target price), because paying customers give better feedback and are more committed to helping you improve. Set expectations: "You will get early access and a permanent discount in exchange for a 30-minute feedback call every two weeks." Use these calls to run continuous customer development: What is working? What is frustrating? What is missing?

## Iterating Based on Evidence, Not Opinions

Post-launch customer development is where most teams lose discipline. The temptation to build features based on gut feeling or loud customer requests is strong.

**Quantitative signals.** Instrument your MVP to track feature usage, workflow completion rates, and time-to-value (how quickly a new user reaches their first successful outcome). Features with low usage after 4 weeks of availability should be investigated: is the feature undiscoverable, poorly designed, or simply unnecessary? Workflow steps where users drop off indicate friction that needs redesign.

**Qualitative signals.** Continue customer interviews monthly, even after launch. Shift the focus from "What problems do you have?" to "How are you using the product? What have you tried to do that did not work? What would make you recommend this to a colleague?" Ask for screen shares where the customer walks through their actual usage. You will discover workflows and workarounds you never anticipated.

**Feature request triage.** Create a scoring framework for feature requests: frequency (how many customers request it), revenue impact (will it help close deals or reduce churn), effort (engineering weeks required), and strategic alignment (does it move toward your product vision). Score each request and prioritize the top 3 per quarter. Saying no to the other requests is painful but necessary for focus.

**Pivot signals.** Sometimes customer development reveals that your initial hypothesis was wrong. Pivot signals include: customers consistently using your product for a purpose other than your intended use case, your target segment having low willingness to pay but an adjacent segment showing strong demand, or your core feature being less valued than a secondary feature you built as an afterthought. When you see these signals, do not ignore them. Run a focused discovery sprint (10 interviews in 2 weeks) on the new hypothesis before committing to a direction change.

---

Customer development is not a phase you complete before building. It is an ongoing discipline that keeps your product aligned with market reality. The teams that win are the ones that never stop talking to their customers. If you are preparing to build a software product and want help structuring your customer discovery and MVP strategy, [get in touch with our team](/contact.html).
