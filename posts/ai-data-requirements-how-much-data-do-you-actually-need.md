# AI Data Requirements: How Much Data Do You Actually Need

"We want to add AI to our product" is the most common request we hear from founders and product leaders. The second most common question, once we start scoping the feature, is "how much data do we need?" The answer is almost never what they expect. It is not a single number. It depends on the type of AI feature, the complexity of the problem, the quality of the data, and the accuracy threshold that the business requires.

Some AI features work with 500 labeled examples. Others need 500,000. Some work with no training data at all by leveraging pre-trained foundation models. Understanding the data requirements for your specific use case is the difference between launching an AI feature in 8 weeks and spending 18 months collecting data that may never be enough.

## Data Requirements by AI Feature Type

Different AI capabilities have fundamentally different data appetites. Here is a practical breakdown by feature category.

**Text classification (spam filtering, sentiment analysis, ticket routing).** For a binary classifier (is this spam or not?), 500-2,000 labeled examples per class typically produce a model with 85-92% accuracy. For multi-class classification (routing support tickets to one of 10 departments), you need 200-500 examples per class, so 2,000-5,000 total. The key constraint is that each class must be adequately represented. If "billing disputes" accounts for 2% of your training data but 15% of real tickets, the model will underperform on that category.

With modern large language models (LLMs), you can often skip custom training entirely. A well-crafted prompt with 5-10 examples (few-shot learning) given to GPT-4 or Claude can achieve 80-90% accuracy on text classification tasks, especially if the categories are intuitive and well-defined. This approach needs zero training data but costs more per inference ($0.01-0.05 per classification versus $0.0001 for a custom model).

**Recommendation systems (product recommendations, content suggestions).** Collaborative filtering requires interaction data: user A bought items X, Y, Z. For a basic recommendation engine, you need at least 50,000 user-item interactions, with a minimum of 20 interactions per user and 20 interactions per item. Below these thresholds, the system lacks enough signal to identify meaningful patterns.

For cold-start scenarios (new users with no history), content-based recommendations work with item metadata alone. If your product catalog has rich descriptions, categories, and attributes, you can recommend similar items based on feature similarity with zero behavioral data.

**Computer vision (image classification, object detection, defect inspection).** Image classification typically needs 1,000-5,000 labeled images per class for a fine-tuned model. Object detection (drawing bounding boxes around objects) needs 2,000-10,000 annotated images. However, transfer learning from pre-trained models like ResNet or YOLO dramatically reduces these requirements. Fine-tuning a pre-trained model with 200-500 images per class can achieve production-quality results for many use cases.

For industrial inspection (detecting defects on a manufacturing line), the challenge is often that defect images are rare. If defects occur in 0.5% of products, collecting 1,000 defect images requires processing 200,000 units. Synthetic data generation and anomaly detection approaches (training only on "normal" images and flagging deviations) address this imbalance.

**Natural language generation (summarization, report writing, chatbots).** If you are using a pre-trained LLM via API (OpenAI, Anthropic, Cohere), you need zero training data. The model's pre-trained knowledge, combined with your domain-specific context provided through prompts or retrieval-augmented generation (RAG), handles most business text generation tasks.

If you need fine-tuned behavior (matching a specific brand voice, generating outputs in a proprietary format), 500-2,000 high-quality input-output pairs are sufficient for fine-tuning. Quality matters far more than quantity here. Two hundred carefully crafted examples produce better fine-tuned results than 2,000 sloppy ones.

**Time series forecasting (demand prediction, financial forecasting).** Statistical models like ARIMA need a minimum of 50-100 data points per time series. Machine learning models like LightGBM or Prophet need 2-5 years of historical data with at least weekly granularity to capture seasonal patterns. For daily granularity, 1-2 years is often sufficient.

The critical factor is capturing full seasonal cycles. A demand forecasting model trained on 8 months of data has never seen the holiday season and will produce wildly inaccurate Q4 predictions. Always ensure your training data spans at least two complete annual cycles.

## Data Quality Trumps Data Quantity Every Time

A model trained on 10,000 high-quality labeled examples will outperform one trained on 100,000 noisy, inconsistently labeled examples. Data quality has several dimensions.

**Label accuracy.** If humans labeled your training data, how consistent were they? Measure inter-annotator agreement: have three people label the same 200 examples independently and calculate the overlap. If annotators agree less than 80% of the time, your label definitions are ambiguous and the model will inherit that confusion. Rewrite labeling guidelines, add examples of edge cases, and re-annotate.

**Class balance.** If 95% of your data belongs to one class, the model learns to predict that class every time and achieves 95% accuracy while being completely useless. Techniques to address imbalance include: oversampling the minority class (SMOTE), undersampling the majority class, adjusting class weights in the loss function, or collecting more examples of the rare class specifically.

**Feature completeness.** If 40% of your records have missing values for a key feature, the model either ignores that feature (losing signal) or imputes values (introducing noise). Before training, audit your dataset for completeness. Features with more than 30% missing values should be either enriched through data collection efforts or dropped from the model.

**Temporal consistency.** Data collected under one set of business conditions may not be relevant under changed conditions. A churn prediction model trained on pre-pandemic data will perform poorly if customer behavior shifted permanently during 2020-2021. Identify regime changes in your data and either train only on post-change data or include a feature that captures the regime.

**Representativeness.** Training data must represent the full distribution of cases the model will encounter in production. If your training data contains only enterprise customers but the model will score SMB leads too, predictions for the SMB segment will be unreliable. Audit your data for gaps in geography, customer size, product usage patterns, and time periods.

## The Build vs. Buy Data Strategy

When your own data is insufficient, you have three options for closing the gap.

**Augment with synthetic data.** For image-based models, apply transformations (rotation, cropping, color adjustment, noise injection) to multiply your existing dataset by 5-10x. For text models, use LLMs to generate paraphrases of your existing examples. For tabular data, techniques like CTGAN can generate realistic synthetic records that preserve statistical properties of your real data. Synthetic data is not a perfect substitute for real data, but it meaningfully improves model performance when real data is scarce.

**Purchase or license external datasets.** Industry-specific datasets are available for purchase. Real estate transaction data from providers like ATTOM or CoreLogic, financial market data from Bloomberg or Refinitiv, consumer behavior data from Nielsen or Statista. These datasets fill gaps in your historical data and add features your internal systems do not capture.

**Partner for data sharing.** Non-competitive companies in adjacent spaces sometimes share anonymized data for mutual benefit. A property management company might share anonymized tenant behavior data with a real estate analytics company in exchange for market benchmarking data. These partnerships require careful legal structuring (data processing agreements, anonymization guarantees) but can provide data assets that would take years to build internally.

## Establishing Your Minimum Viable Dataset

Rather than waiting until you have "enough" data, define the minimum viable dataset (MVD) that lets you ship a v1 AI feature and improve iteratively.

**Step 1: Define the accuracy threshold for business viability.** Not every AI feature needs 99% accuracy. A product recommendation that is relevant 70% of the time still drives incremental revenue. A fraud detection system might need 95% precision (few false positives) but can tolerate 80% recall (missing some real fraud). Define the threshold where the feature creates more value than it costs in errors.

**Step 2: Run a data audit.** Inventory all data sources available: databases, CRM exports, log files, third-party integrations, spreadsheets. For each source, document: the number of records, the time span covered, the key features available, and the data quality (completeness, accuracy, consistency).

**Step 3: Build a rapid prototype.** Train a simple model (logistic regression, random forest, or a few-shot LLM prompt) on whatever data you have today. Measure accuracy against your threshold. If you are at 75% and need 85%, the gap tells you how much additional data or feature engineering is required. If you are at 60% and need 95%, you likely need a fundamentally different data strategy.

**Step 4: Implement a data flywheel.** Design the AI feature so that every user interaction generates labeled training data. A search ranking feature where users click results provides implicit relevance labels. A classification feature where users can correct the AI's output provides explicit training labels. Over time, the model improves as usage grows, creating a compounding advantage.

## When to Use Foundation Models Instead of Custom Training

The emergence of large pre-trained models has fundamentally changed the data equation. For many business applications, the right approach is not training a custom model at all.

Use foundation models (GPT-4, Claude, Gemini) when: the task involves general language understanding, you have fewer than 1,000 training examples, the domain is well-represented in public knowledge, and you need to ship quickly.

Use custom-trained models when: the task involves proprietary patterns not present in public data, inference cost at scale matters (custom models are 10-100x cheaper per prediction), latency requirements are strict (sub-50ms), or the data contains sensitive information that cannot be sent to third-party APIs.

A common hybrid approach is to start with a foundation model for the initial launch, collect training data from user interactions, and train a custom model once you have accumulated 5,000-10,000 high-quality examples. The foundation model buys you time while the data flywheel spins up.

---

At The Proper Motion Company, we help businesses assess their AI readiness, design data collection strategies, and build AI features calibrated to the data they actually have. If you are considering adding AI capabilities to your product, [let us help you plan the data foundation](/contact.html).
