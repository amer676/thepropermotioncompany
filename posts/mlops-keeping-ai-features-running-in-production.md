# MLOps: Keeping AI Features Running in Production

Shipping a machine learning model to production is the easy part. Keeping it accurate, reliable, and cost-effective over months and years is where most teams struggle. The gap between a working Jupyter notebook and a production AI feature that serves thousands of users without incident is vast, and it is filled with monitoring, pipeline engineering, and operational discipline that data science curricula rarely cover.

This guide covers the concrete practices that keep AI features running reliably in production, drawn from real deployments across fintech, logistics, and SaaS applications.

## Why ML Models Degrade and What That Looks Like in Practice

Every machine learning model in production is decaying. The question is how fast and whether you will notice before your users do.

Model degradation happens for three primary reasons. First, **data drift**: the statistical distribution of your input data changes over time. A fraud detection model trained on 2023 transaction patterns will see different spending behaviors in 2024 as consumer habits, merchant ecosystems, and economic conditions shift. Second, **concept drift**: the relationship between inputs and outputs changes. What constituted a fraudulent transaction six months ago may look different today as fraud tactics evolve. Third, **infrastructure drift**: upstream data sources change their schemas, latency characteristics, or availability patterns without warning.

The numbers are sobering. Research from Google and Microsoft suggests that production ML models lose 5 to 10 percent of their predictive accuracy per quarter without retraining. In fast-moving domains like advertising and fraud detection, significant degradation can occur within weeks.

A practical example: a logistics company deployed a demand forecasting model that performed well for three months. Then a major customer changed their ordering pattern from weekly bulk orders to daily just-in-time orders. The model's mean absolute error doubled in two weeks, but the team did not notice for another month because they were only monitoring system metrics (latency, throughput) rather than model metrics (prediction accuracy, feature distributions).

## Building a Model Monitoring Stack That Actually Alerts You

Effective model monitoring operates at three layers: system health, data health, and model performance.

**System health** is table stakes. Monitor prediction latency (p50, p95, p99), throughput (predictions per second), error rates, memory usage, and GPU utilization if applicable. Set alerts for p99 latency exceeding your SLA (typically 100 to 500 milliseconds for real-time inference) and error rates above 0.1 percent.

**Data health** catches drift before it affects model performance. For each input feature, track the statistical distribution over rolling windows (hourly, daily, weekly) and compare against your training data distribution. The Population Stability Index (PSI) is a practical metric here: a PSI below 0.1 indicates no significant change, 0.1 to 0.25 warrants investigation, and above 0.25 requires immediate attention.

Implement these checks:
- Null rate per feature (alert if it exceeds training-time null rate by more than 2x)
- Feature range validation (alert on values outside training range)
- Categorical feature distribution (alert on new, unseen categories)
- Input volume anomalies (alert on throughput drops exceeding 30 percent)

**Model performance** is the ultimate measure. If you have ground truth labels available (even delayed), compute your target metrics on a rolling basis. For classification models, track precision, recall, and F1 score. For regression models, track MAE, RMSE, and R-squared. For ranking models, track NDCG and MAP.

Many production models lack immediate ground truth. In those cases, use proxy metrics. For a recommendation system, track click-through rates and engagement time. For a fraud model, track the rate of customer disputes filed within 30 days of a flagged transaction. These proxy metrics should have automated alerts tied to statistically significant deviations from baseline.

Tools that work well in 2024: Evidently AI for open-source monitoring dashboards, Arize for hosted monitoring with automatic drift detection, and custom Prometheus/Grafana dashboards for teams that prefer full control.

## The Retraining Pipeline: Automated but Not Autonomous

Retraining should be automated but never fully autonomous. The pipeline should run without human intervention, but a human should approve model promotion to production.

A robust retraining pipeline has five stages:

1. **Data collection and validation.** Pull new training data from your feature store or data warehouse. Validate schema, completeness, and distribution before proceeding. If validation fails, alert the team and halt the pipeline.

2. **Training and hyperparameter optimization.** Train candidate models using your established architecture. Use Bayesian optimization (Optuna is excellent) rather than grid search to efficiently explore the hyperparameter space. Train on the latest 6 to 12 months of data, depending on your domain's volatility.

3. **Evaluation against the current production model.** Compare the candidate model against the production model on a held-out test set that represents recent data. The candidate must outperform on your primary metric by a statistically significant margin (we use a 2 percent improvement threshold with a p-value below 0.05).

4. **Shadow deployment.** Run the candidate model alongside the production model for 24 to 72 hours, serving real traffic but not using the candidate's predictions for anything user-facing. Compare predictions between the two models and investigate any significant divergence.

5. **Staged rollout.** Promote the candidate to serve 5 percent of traffic, then 25 percent, then 100 percent, with automated rollback triggers tied to your monitoring alerts.

The cadence depends on your domain. Financial models typically retrain monthly. Recommendation models retrain weekly. Fraud models retrain biweekly. Document these cadences and treat deviations as incidents.

## Feature Stores and the Data Foundation

The single highest-leverage MLOps investment is a feature store. Without one, every model training run involves writing custom SQL queries, every retraining pipeline duplicates data transformation logic, and feature computation between training and serving inevitably diverges (the dreaded training-serving skew).

A feature store provides three capabilities:

**Feature computation and storage.** Define features once as transformation logic, compute them on a schedule (batch) or in real-time (streaming), and store the results. Feast is the leading open-source option. Tecton and Databricks Feature Store are strong managed alternatives.

**Consistent serving.** The same feature definitions used in training are used at inference time, eliminating training-serving skew. This alone prevents a category of subtle bugs that can take weeks to diagnose.

**Feature reuse across models.** A "customer lifetime value" feature computed for your churn model can be reused by your upsell model without recomputation. As your model portfolio grows, the time savings compound dramatically.

If a full feature store is premature for your scale, start with a simpler practice: maintain all feature transformation logic in a shared Python package that is imported by both your training pipelines and your serving code. This does not give you the storage and serving layers, but it eliminates the most dangerous source of bugs.

## Cost Management: Inference Is Where the Bill Lives

Training costs are a one-time expense per model version. Inference costs are ongoing and scale with traffic. For a typical production deployment, inference accounts for 80 to 90 percent of total ML infrastructure cost.

Concrete cost reduction strategies:

**Model optimization.** Quantize your models from FP32 to INT8, which typically reduces inference cost by 60 to 75 percent with less than 1 percent accuracy loss. ONNX Runtime makes this straightforward for most model architectures. For transformer-based models, apply knowledge distillation to create smaller models that approximate the performance of larger ones.

**Batching.** If your use case tolerates latency of 50 to 200 milliseconds, batch inference requests. A batch size of 32 on a GPU instance can deliver 10x the throughput of individual predictions at the same cost.

**Caching.** For models with a finite input space or inputs that repeat frequently, cache predictions. A Redis cache in front of a recommendation model can reduce inference calls by 40 to 60 percent for popular items.

**Right-sizing infrastructure.** Most teams over-provision GPU instances. Start with CPU inference (which handles many sklearn and XGBoost models perfectly well) and only move to GPU when you have measured the latency requirement and confirmed that CPU cannot meet it. A single g5.xlarge instance on AWS ($1.006/hour) can serve 500 to 2,000 predictions per second for a medium-complexity neural network.

**Spot instances for batch inference.** If you run daily or weekly batch prediction jobs, use spot instances to reduce compute costs by 60 to 90 percent. Design your batch pipeline to checkpoint progress so that spot interruptions do not require restarting from zero.

## Incident Response for ML Systems

ML incidents are fundamentally different from traditional software incidents. A web server either works or it does not. A model can silently return confidently wrong predictions while every system metric looks healthy.

Build your ML incident response around these principles:

**Define what "broken" means quantitatively.** A fraud model is broken when its false negative rate exceeds 3 percent over a 4-hour window. A recommendation model is broken when click-through rate drops below 2 percent for more than 6 hours. Write these thresholds down and wire them to PagerDuty.

**Maintain a fallback strategy.** For every ML-powered feature, define what happens when the model is unavailable or unreliable. This might be a rule-based heuristic, the previous model version, or graceful degradation to a non-personalized experience. The fallback should be deployable in under five minutes.

**Postmortem ML-specific details.** After every ML incident, document: what metric degraded, when it started, when it was detected, what caused it (data drift, code change, upstream dependency), and what monitoring gap allowed delayed detection. Feed these findings back into your monitoring configuration.

Production ML is a discipline, not a project. The teams that treat it as ongoing operational work, with dedicated monitoring, rehearsed incident response, and continuous pipeline improvement, are the ones whose AI features actually deliver sustained business value.

---

If your team is deploying AI features and wants to ensure they stay reliable in production, [let's talk](/contact.html). The Proper Motion Company builds MLOps infrastructure that keeps models accurate and costs predictable.
