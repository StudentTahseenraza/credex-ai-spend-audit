# PROMPTS.md

## AI Prompts Documentation

This document contains all prompts used in the AI Spend Audit platform.

AI is used only for generating personalized executive summaries after the audit engine completes its rule-based financial analysis.

---

# AI Model Configuration

| Setting | Value |
|---|---|
| Provider | OpenRouter |
| Model | `openai/gpt-3.5-turbo` |
| Max Tokens | 250 |
| Temperature | 0.7 |

---

# Why AI Is Used

The assignment explicitly requires AI usage only for personalized summaries — not for the audit calculations themselves. The audit engine uses deterministic business logic and pricing rules to ensure financially defensible recommendations. AI is used only to convert structured audit results into concise, human-readable executive insights.

---

# System Prompt

```text
You are an AI spending auditor for startups and engineering teams.

Your role is to generate concise, financially realistic, and operationally useful executive summaries based on AI tooling audit results.

Focus on:
- cost optimization
- workflow efficiency
- realistic recommendations
- startup operational thinking

Avoid:
- generic AI advice
- hallucinated pricing
- fabricated metrics
- exaggerated claims

Your tone should be:
- professional
- analytical
- concise
- founder-focused
- financially intelligent

Main User Prompt Template
You are an AI spending auditor for startups.

Analyze the following AI tooling audit report and generate a concise executive summary for the team.

REPORT

Team Size:
{teamSize}

Primary Use Case:
{useCase}

Current Monthly Spend:
${currentMonthlySpend}

Potential Monthly Savings:
${totalMonthlySavings}

Potential Annual Savings:
${totalAnnualSavings}

Spend Health Score:
{healthScore}/100

Per-Tool Recommendations:
{toolsList}

Optimization Opportunities:
{opportunitiesList}

INSTRUCTIONS

- Write approximately 100–140 words
- Be financially realistic
- Explain WHY the current setup is inefficient
- Mention operational implications where relevant
- Highlight the biggest optimization opportunities
- Avoid repeating raw numbers excessively
- Sound like a startup operations consultant
- End with a forward-looking optimization insight

SUMMARY:

Template Variables

| Variable                | Source                | Example                                    |
| ----------------------- | --------------------- | ------------------------------------------ |
| `{teamSize}`            | Form input            | `5`                                        |
| `{useCase}`             | Form input            | `coding`                                   |
| `{currentMonthlySpend}` | Audit engine          | `220`                                      |
| `{totalMonthlySavings}` | Audit engine          | `70`                                       |
| `{totalAnnualSavings}`  | Audit engine          | `840`                                      |
| `{healthScore}`         | Spend score engine    | `72`                                       |
| `{toolsList}`           | Audit recommendations | `ChatGPT: reduce inactive seats`           |
| `{opportunitiesList}`   | Optimization engine   | `Consolidate overlapping AI subscriptions` |


Example Tool Recommendation Format
- ChatGPT Team → Reduce inactive seats (save $40/month)
- Claude Max → Downgrade to Pro (save $20/month)
- Cursor Pro → Already optimized
Example Optimization Opportunities
- Remove underutilized premium seats
- Consolidate overlapping conversational AI tools
- Reduce enterprise-tier overprovisioning
Prompt Engineering Decisions
1. Clear Role Definition
"You are an AI spending auditor for startups."
Why

This immediately establishes:

domain context
financial reasoning
startup-focused communication style

Without this, outputs became generic productivity advice.

2. Structured Audit Data

All audit data is passed as structured labeled sections.

Why

This reduces hallucination and improves:

recommendation consistency
factual accuracy
operational realism

The model performs better when financial inputs are clearly separated.

3. Operational Tone Constraints

The prompt explicitly requests:

financially realistic recommendations
operational insights
startup-oriented language
Why

Early versions produced:

generic AI summaries
unrealistic savings claims
repetitive wording

Adding tone constraints significantly improved summary quality.

4. Length Constraints
"Write approximately 100–140 words"
Why

Without limits:

outputs became inconsistent
summaries were sometimes too short or excessively verbose

The constraint improved:

readability
dashboard UX
executive scannability
Failed Prompt Iterations
Attempt 1 — Too Generic
Prompt
Write a summary about AI spending.
Result

Outputs were vague and repetitive:

"AI spending is important to optimize."

Why It Failed
no context
no role definition
no structure
no constraints
Attempt 2 — Overly Financial
Prompt
Calculate ROI, TCO, and long-term infrastructure optimization strategies.
Result

The model hallucinated:

fake financial metrics
imaginary projections
unsupported assumptions
Why It Failed

The model lacked real operational data and attempted to invent numbers.

Attempt 3 — No Tone Guidance
Result

Outputs sounded:

robotic
generic
repetitive
AI-generated
Why It Failed

No communication style constraints were provided.

Final Prompt Strategy

The final approach succeeded because it combines:

structured audit inputs
operational context
financial constraints
startup-oriented tone
concise formatting requirements

This produced summaries that felt:

executive-level
believable
useful
product-ready
Example Successful Output
Your team appears to be slightly over-provisioned on premium conversational AI tooling relative to workflow requirements and active seat usage. Most of the current value is concentrated in coding-focused workflows, where lower-tier collaboration plans can achieve similar productivity outcomes at reduced cost. The largest optimization opportunities come from consolidating overlapping AI subscriptions and reducing underutilized premium access. While the current stack supports flexibility, it may scale inefficiently as headcount grows. Periodic audits of seat utilization and workflow overlap can help maintain operational efficiency while preserving developer productivity.
Fallback Summary Generator

If the AI API fails due to:

rate limits
missing API keys
timeout errors
provider outages

the application falls back to a deterministic template-based summary generator.