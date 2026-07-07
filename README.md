# MarketPilot

**Live app:** https://marketpilot-frontend.vercel.app

AI-powered marketing planning platform that helps small businesses generate a personalized marketing strategy and a 30-day content calendar in minutes, without needing marketing expertise.

## The Problem

Small business owners know marketing matters, but most don't have the time, expertise, or budget to plan it well. They're unsure what to post, how often, or on which platforms — and when they do try, existing analytics tools present data in dashboards that are hard for non-marketers to interpret. As a result, marketing efforts are often inconsistent or abandoned, and businesses either overpay for agencies or cobble together disconnected tools.

## The Solution

MarketPilot turns a short business questionnaire into a complete, structured marketing plan:

1. **Strategy Engine** — Takes inputs like industry, target customer, primary goal, and biggest struggle, and generates a personalized strategy: recommended platforms, posting frequency, content themes, and tone.
2. **Calendar Engine** — Converts that strategy into an actual day-by-day content calendar with specific post topics, draft captions, and platform-specific tips, spread realistically across the month based on posting frequency.
3. **Analytics & Insights Engine (planned)** — Will translate marketing performance data into plain-language recommendations instead of complex dashboards.

## How It Works

```
Business owner fills out onboarding questionnaire
        ↓
Strategy Engine (Claude API) generates marketing strategy
        ↓
Calendar Engine converts strategy into a 30-day content calendar
        ↓
Owner follows the calendar and posts content
        ↓
(Planned) Analytics Engine reviews performance weekly
```

## Product Definition & Success Metrics

Before building, I wrote a full PRD defining the target user (small business owners without a dedicated marketing team), core objectives, and the success metrics the product would be measured against:

* **Activation target:** 70% of new users complete onboarding and generate their first strategy + calendar
* **Retention target:** 40% of users return weekly to check their plan or insights
* **Satisfaction target:** average rating of 8/10 or higher

*These are the targets defined in the PRD. MarketPilot is currently a working prototype and has not yet been tested with live users, so these metrics represent goals rather than measured results.*

Full PRD included in this repo: `docs/MarketPilot-PRD.pdf`

## Tech Stack

**Backend**
* Node.js + Express
* Anthropic Claude API (Claude Sonnet) for strategy and calendar generation
* Structured JSON prompting — the response schema is specified in the prompt and outputs are validated on parse, so the frontend receives reliable, predictable data instead of free-form text

**Frontend**
* Next.js
* Deployed on Vercel

## Repository Structure

```
MarketPilot/
├── backend/     — Express API (strategy + calendar generation endpoints)
├── frontend/    — Next.js app
└── docs/        — Product requirements doc
```

## What I'd Do Next

If I took MarketPilot past the prototype stage, the priorities would be:

* **Validate with real users first.** Put the tool in front of a small set of actual small-business owners and check the core assumption — that a generated strategy + calendar is genuinely usable — before building anything else. Onboarding completion and whether users act on the plan are the first things I'd want to observe.
* **Instrument the funnel.** Add event tracking for onboarding steps, strategy generation, and calendar views, so the activation and retention targets in the PRD become measurable instead of aspirational.
* **Harden the AI output.** Expand schema validation with retry-on-failure and fallbacks, and evaluate output quality across industries to catch cases where the generated strategy is generic or off-base.
* **Build the Analytics Engine against real signal.** Only worth building once there are enough active users generating performance data to make plain-language insights meaningful.

## Notes

This is an internship project built to explore product scoping, AI-assisted content generation, and end-to-end shipping — from a written PRD through a live, working deployment. The Analytics & Insights Engine described in the PRD is on the roadmap and not yet implemented.t implemented.
