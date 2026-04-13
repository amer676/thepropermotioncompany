# How Our AI Lead Scoring System Tripled Conversion Rates

When a mid-market B2B software company approached us, their sales team was drowning in leads and closing almost none of them. Their marketing engine was generating 4,200 inbound leads per month. Their 12-person sales team was working through them in the order they arrived, spending equal time on a Fortune 500 VP who downloaded a whitepaper and a student who signed up for the free tier out of curiosity. Their close rate was 1.8%, and their average time from lead to first contact was 3.4 days.

Eighteen weeks later, their close rate was 5.7% --- a 3.2x improvement --- and their average time to first contact for high-value leads had dropped to 22 minutes. The difference was an AI lead scoring system that replaced their gut-feel approach with a data-driven prioritization engine. This is the story of how we built it, what worked, what did not, and what we would do differently.

## The Problem: Equal Treatment of Unequal Leads

The fundamental issue was not lead volume. It was lead prioritization. The sales team had a simple queue: new leads appeared in Salesforce in chronological order, and reps worked top to bottom. A lead that came in at 2 AM Tuesday got called before a lead that came in at 9 AM Wednesday, regardless of their likelihood to buy.

The company had experimented with manual scoring rules. Marketing had set up a point system: +10 for visiting the pricing page, +5 for downloading content, +20 for being a manager or above, -10 for using a personal email address. This rule-based system was better than nothing, but it had three problems.

First, the rules were static. They reflected marketing's assumptions from six months ago, not the patterns in recent conversion data. Second, the rules could not capture complex interactions. A lead who visits the pricing page three times in one week and downloads a case study is exhibiting a fundamentally different pattern than a lead who visits the pricing page once and never returns. The point system treated both the same. Third, the rules were brittle. Every time the sales team noticed a pattern ("leads from the healthcare vertical convert at 3x the average"), someone had to manually add a rule, guess an appropriate point value, and hope it did not break the other rules.

We proposed replacing the manual scoring system with a machine learning model trained on the company's own historical conversion data.


> Related: [How AI Changes Software Architecture](/blog/how-ai-changes-software-architecture/)


## Data Collection and Feature Engineering

The model is only as good as the data feeding it. We started by auditing what was available.

The company had 18 months of lead data in Salesforce: 52,000 leads with outcomes (converted, lost, or still open). For each lead, we could extract: demographic attributes (company size, industry, job title, location), behavioral signals from their marketing automation platform (pages visited, content downloaded, emails opened, webinar attendance), firmographic data enriched via Clearbit (company revenue, technology stack, funding stage), and temporal patterns (time of day of activity, days between touchpoints, velocity of engagement).

We engineered 47 features from these raw data sources. Some were straightforward (number of page views in the first 7 days, binary flag for pricing page visit). Others required more thought. We created a "momentum score" that measured the acceleration of engagement over time: a lead whose activity is increasing week-over-week scored higher than one with flat or declining activity. We built a "content depth index" that weighted content interactions by funnel stage: downloading a top-of-funnel blog post scored lower than watching a product demo video.

Feature engineering consumed roughly 40% of the total project time. This is normal for ML projects and is not wasted effort. The features encode your business knowledge into a format the model can leverage. A model with clever features and a simple algorithm almost always outperforms a model with raw data and a sophisticated algorithm.

We split the data: 70% for training (36,400 leads), 15% for validation (7,800 leads), and 15% for testing (7,800 leads). The test set was strictly held out and not touched until final evaluation. This prevented us from unconsciously overfitting to the evaluation data during development.

## Model Development and Iteration

We started with a gradient-boosted decision tree model (XGBoost) for three reasons: it handles mixed feature types (numerical and categorical) naturally, it performs well on tabular data with relatively small datasets, and it produces feature importance scores that make the model's decisions explainable to non-technical stakeholders.

The first model achieved an AUC-ROC of 0.81 on the validation set. Respectable, but not transformative. We diagnosed the weaknesses by examining where the model was confident but wrong.

The biggest error source was leads from small companies in niche industries. The model had insufficient training data for these segments and defaulted to the population average. We addressed this by adding industry-cluster features: instead of treating each of 200 industries as a separate category, we grouped them into 15 clusters based on historical conversion rates and deal sizes. This gave the model enough data per cluster to learn meaningful patterns.

The second error source was timing. Leads that converted quickly (within 48 hours of first touch) looked different from leads that converted slowly (over 30-60 days). The model was averaging these patterns and performing poorly on both. We added a set of recency-weighted features that gave more importance to recent behavior, and we trained separate sub-models for "fast-track" and "nurture" lead segments.

After three iteration cycles over six weeks, the final model achieved an AUC-ROC of 0.89 on the held-out test set. More importantly, the top decile of scored leads converted at 14.2%, compared to the 1.8% baseline. The model was concentrating the highest-value leads at the top of the queue with high reliability.


> See also: [AI for Customer Support: Beyond Basic Chatbots](/blog/ai-for-customer-support-beyond-basic-chatbots/)


## Integration With the Sales Workflow

A model that lives in a Jupyter notebook does not close deals. The integration with the sales team's actual workflow was as important as the model's accuracy.

We deployed the model as a microservice behind a REST API, hosted on AWS Lambda for cost efficiency (the scoring workload was bursty --- heavy during business hours, near-zero overnight). The service received a webhook from Salesforce whenever a new lead was created or an existing lead's behavior changed, scored the lead in under 200 milliseconds, and wrote the score back to a custom field in Salesforce.

In Salesforce, we created three lead queues based on score thresholds. The **Priority Queue** (top 15% of scores) triggered an immediate Slack notification to the assigned rep and auto-created a task with a 30-minute deadline. The **Standard Queue** (middle 50%) appeared in the normal work queue with a 24-hour SLA. The **Nurture Queue** (bottom 35%) was routed to an automated email nurture sequence rather than consuming sales time.

We added a "Score Explanation" panel to the Salesforce lead detail page. This showed the top five factors contributing to each lead's score in plain language: "Visited pricing page 4 times this week," "Company matches high-converting firmographic profile (B2B SaaS, 50-200 employees, Series B)," "Downloaded product comparison guide." This transparency was critical for sales team adoption. Reps trusted the system because they could see why each lead was prioritized, not just that it was.

We also built a feedback loop. When a rep worked a lead and the outcome was known (converted or lost), that data flowed back into the training set. The model was retrained weekly on a rolling 18-month window, ensuring it adapted to shifting market conditions and buyer behavior. This continuous learning increased model accuracy by approximately 2 percentage points over the first six months of operation.

## Results and Lessons Learned

After 90 days of full operation, the numbers told a clear story.

**Close rate** improved from 1.8% to 5.7%. The improvement came almost entirely from prioritization --- the sales team was reaching high-intent leads while they were still in buying mode, rather than three days later when they had moved on to a competitor. The conversion rate on Priority Queue leads was 14.2%, compared to 1.1% on Nurture Queue leads. The model was accurately separating wheat from chaff.

**Average time to first contact** for Priority Queue leads dropped from 3.4 days to 22 minutes. The Slack notification system and 30-minute SLA made this possible. Speed matters enormously in B2B sales: research from InsideSales.com showed that leads contacted within 5 minutes are 21x more likely to qualify than leads contacted after 30 minutes.

**Sales team efficiency** improved dramatically. The 12-person team was now spending 70% of their time on the 15% of leads most likely to convert, instead of spreading effort uniformly. Two reps who had been considering leaving because of burnout from fruitless cold calls became the team's top performers.

**Revenue per sales rep** increased by 2.4x over the 90-day period, enabling the company to grow revenue without expanding the sales team.

The lessons we took from this project were concrete. First, feature engineering matters more than model sophistication. Our best accuracy gains came from better features, not fancier algorithms. Second, integration design is as important as model design. The Priority Queue, Slack notifications, and score explanations drove adoption. A more accurate model without these workflow integrations would have been ignored. Third, continuous retraining is non-negotiable. The model's accuracy drifted downward by about 1 percentage point per month without retraining, as buyer behavior shifted and the market evolved. Weekly retraining kept the model current. Fourth, start with the business metric, not the ML metric. We optimized for close rate and time-to-contact, not AUC-ROC. The ML metrics were means to an end.

The total project cost was approximately $95,000 over 18 weeks (discovery, data engineering, model development, integration, and deployment). The incremental revenue generated in the first 90 days of operation exceeded $380,000. The system paid for itself within the first month.

---

Interested in exploring how AI-driven lead scoring could work for your sales team? [Let us know](/contact.html) --- we will assess your data readiness and scope a pilot.
