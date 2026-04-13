# Wealth Management Software Development

Financial advisors managing $50 million to $500 million in assets under management face a peculiar technology problem. Enterprise platforms like Addepar or Black Diamond are designed for firms managing billions and priced accordingly, often $50,000 to $200,000 per year. Consumer tools like Mint or Personal Capital lack the portfolio analytics, compliance features, and multi-account structures that professional advisors require. The middle market is underserved by generic solutions that demand painful compromises.

Custom wealth management software fills this gap by building exactly the capabilities an advisory firm needs: portfolio construction and rebalancing, client reporting, performance attribution, compliance monitoring, and a client portal that reinforces the firm's brand and relationship model. This guide covers the technical and regulatory considerations for building portfolio management systems for financial advisors.

## Portfolio Data Aggregation and the Custodian Integration Challenge

The first and most technically challenging component of any wealth management system is data aggregation. Client assets are held at custodians (Schwab, Fidelity, Pershing, TD Ameritrade), and the advisory firm needs a consolidated view of all positions, transactions, and balances across custodians.

**Custodian data feeds.** Each custodian provides data through different mechanisms with different formats:

- **Schwab** provides daily position and transaction files via SFTP in a proprietary fixed-width format. Files are available by 6 AM ET.
- **Fidelity** offers the Wealthscape API for real-time position data and daily batch files for transactions. The API uses OAuth 2.0 authentication.
- **Pershing** delivers data through the NetX360 platform, with batch files in a standardized format and an API for intraday position lookups.

Each custodian uses different security identifiers (CUSIP, SEDOL, ISIN), different transaction type codes, and different account numbering schemes. The aggregation layer must normalize this data into a common model.

Build the aggregation pipeline with these stages:

1. **Ingestion.** Retrieve files or API data from each custodian on a daily schedule (batch) or periodic polling (API). Store raw data before any transformation, preserving the original format for audit purposes.

2. **Normalization.** Map custodian-specific fields to a common schema. Standardize security identifiers using a reference data service (OpenFIGI provides free CUSIP-to-ISIN mapping). Normalize transaction types to a common taxonomy: buy, sell, dividend, interest, transfer_in, transfer_out, fee, corporate_action.

3. **Reconciliation.** Compare aggregated positions against custodian statements. Flag discrepancies exceeding a configurable threshold ($100 or 0.1 percent of position value, whichever is greater). A reconciliation break rate below 0.5 percent is the target; above 2 percent indicates a systemic data quality issue.

4. **Enrichment.** Add market data (closing prices, yields, credit ratings) from a pricing service. Bloomberg Terminal data feeds are the gold standard but expensive ($20,000+ per year). Alternatives include IEX Cloud ($9/month for basic equity data), Refinitiv, or the SEC's EDGAR for fundamental data. For fixed income pricing, which is less transparent than equity pricing, Interactive Data Corporation (IDC) or ICE are standard sources.

## Portfolio Analytics and Performance Measurement

Once data is aggregated, the system must calculate the metrics that advisors and clients care about: portfolio value, performance, risk, and attribution.

**Time-weighted return (TWR)** is the industry standard for measuring portfolio manager performance because it eliminates the impact of client cash flows. The calculation chains daily returns:

Daily return = (Ending value - Beginning value - Cash flows) / (Beginning value + Time-weighted cash flows)

Annualized TWR = ((1 + R1) x (1 + R2) x ... x (1 + Rn))^(365/n) - 1

Implement Modified Dietz for periods between valuations when daily pricing is not available. For periods with daily pricing (most modern scenarios), use true daily TWR.

**Money-weighted return (MWR/IRR)** measures the client's actual experience, incorporating the timing and size of their cash flows. This is what clients care about: "How much did I actually earn on my investment?" Calculate using the XIRR method, which solves for the discount rate that sets the net present value of all cash flows to zero.

**Risk metrics** that advisors commonly present:
- Standard deviation (annualized, using daily or monthly returns)
- Sharpe ratio (excess return over risk-free rate, divided by standard deviation)
- Maximum drawdown (largest peak-to-trough decline)
- Beta (portfolio sensitivity to a benchmark, typically S&P 500)
- Tracking error (standard deviation of the difference between portfolio and benchmark returns)

**Performance attribution** decomposes portfolio returns into their sources. The Brinson-Fachler model is the most widely used approach, separating returns into:
- Allocation effect (the impact of over/underweighting sectors relative to the benchmark)
- Selection effect (the impact of choosing specific securities within each sector)
- Interaction effect (the combined impact of allocation and selection decisions)

This analysis answers the question clients always ask: "Why did my portfolio underperform the S&P 500 this quarter?" The advisor can respond with specifics: "Our overweight to healthcare added 0.3 percent, but our security selection in technology detracted 0.8 percent due to the decline in our semiconductor holdings."

## Client Portal and Reporting

The client-facing portal is where the advisory firm's technology investment becomes visible and differentiating. A well-designed portal reinforces the client relationship, reduces call volume for routine inquiries, and provides a canvas for the advisor's insights.

**Dashboard design for high-net-worth clients.** The client opens the portal and sees:

- Total portfolio value with daily change in dollars and percentage
- Performance chart (configurable: MTD, QTD, YTD, 1-year, 3-year, since inception) compared to a relevant benchmark
- Asset allocation visualization (a donut chart showing the target allocation, current allocation, and drift for each asset class)
- Recent transactions (last 30 days)
- Upcoming events (required minimum distributions, bond maturities, option expirations)
- Advisor commentary (a short note from the advisor about market conditions or portfolio actions)

**Household-level views.** Wealthy clients have multiple accounts: individual brokerage, joint brokerage, IRA, Roth IRA, trust, 529 plans, and potentially entity accounts (LLC, foundation). The portal must aggregate across all accounts in a household while also allowing drill-down to individual account performance. The household view answers: "What is our total family net worth, and how is it allocated?"

**Document vault.** A secure area where the advisor uploads and the client accesses: financial plans, investment policy statements, quarterly reports, tax documents (1099s, K-1s), and estate planning documents. Role-based access ensures that a client's adult children can see trust documents but not the client's individual account statements.

**Reporting engine.** Generate quarterly performance reports (PDF) that the advisor reviews and personalizes before sending to the client. The report includes: portfolio summary, performance vs. benchmark, asset allocation changes, realized gains/losses, income received, and advisor commentary. Automated generation saves 2 to 4 hours per client per quarter. For a firm with 200 client households, that is 400 to 800 hours per year redirected from report compilation to client service.

## Regulatory Compliance and Security Requirements

Wealth management software operates under stringent regulatory requirements. In the United States, the primary regulators are the SEC (for registered investment advisors) and FINRA (for broker-dealers).

**SEC Rule 206(4)-7** requires registered investment advisors to adopt and implement written compliance policies and procedures. The software should enforce these policies programmatically:

- **Trade allocation fairness.** When the advisor executes a block trade across multiple client accounts, the system must allocate shares using a pre-defined, equitable method (pro rata by account size is most common). The allocation method must be documented and consistently applied.

- **Best execution documentation.** The system should log the rationale for trade execution decisions: why a particular broker was selected, comparison of execution prices to market prices at the time of order entry.

- **Personal trading compliance.** If the firm requires employees to pre-clear personal trades, the system should provide a pre-clearance workflow with automated checks against restricted lists and holding periods.

**Data security** requirements for financial data:

- Encryption at rest (AES-256) for all client data, including database fields, file storage, and backups.
- Encryption in transit (TLS 1.2+) for all data transmission, including custodian data feeds, API communications, and client portal access.
- Multi-factor authentication for all users (advisors and clients).
- Session management with automatic timeout (15 minutes of inactivity for advisor accounts, 30 minutes for client accounts).
- Penetration testing annually, with remediation of all critical and high findings within 30 days.
- SOC 2 Type II compliance if the software is hosted as a service for multiple advisory firms.

**Audit trail requirements.** Every data modification, trade execution, report generation, and client communication must be logged with timestamp, actor, and action details. Retain audit logs for a minimum of 5 years (SEC requirement) or 6 years (FINRA requirement for broker-dealers). The audit trail must be tamper-evident: use append-only logging with integrity hashes.

## Build vs. Buy: When Custom Makes Sense

Custom development is justified when the advisory firm has a differentiated investment process or client service model that generic platforms cannot accommodate.

**Build custom when:**
- Your firm uses a proprietary investment strategy (e.g., custom factor models, alternative asset classes, tax-loss harvesting algorithms) that requires integration into the portfolio management workflow.
- You serve a niche client segment (e.g., corporate executives with concentrated stock positions, physicians with complex partnership structures) that requires specialized analytics.
- Your client experience is a competitive differentiator and you want complete control over the portal's design, functionality, and branding.
- You manage $100M+ in AUM where the cost of custom software ($150,000 to $400,000 initial build plus $30,000 to $60,000 annual maintenance) is justified by the operational efficiency gains and client retention impact.

**Use an existing platform when:**
- Your investment process follows standard asset allocation and rebalancing approaches.
- Your firm manages under $50M in AUM and the custom software investment cannot be justified.
- You need to be operational within 30 to 60 days and cannot wait for a 4 to 6 month development cycle.

For many firms, the optimal approach is a hybrid: use an existing custodial platform for trade execution and basic account management, and build custom components for client reporting, portfolio analytics, and the client portal where differentiation matters most.

---

If your advisory firm is ready to upgrade from spreadsheets and generic tools to a custom platform built for your investment process and client experience, [schedule a conversation with us](/contact.html). The Proper Motion Company builds wealth management technology that helps advisors serve their clients more effectively.
