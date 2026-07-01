# MarketPilot

**Live app:** https://marketpilot-frontend.vercel.app

AI-powered marketing planning platform that helps small businesses generate a personalized marketing strategy and a 30-day content calendar in minutes, without needing marketing expertise.

## The Problem

Small business owners know marketing matters, but most don't have the time, expertise, or budget to plan it well. They're unsure what to post, how often, or on which platforms — and when they do try, existing analytics tools present data in dashboards that are hard for non-marketers to interpret. As a result, marketing efforts are often inconsistent or abandoned, and businesses either overpay for agencies or cobble together disconnected tools.

## The Solution

MarketPilot turns a short business questionnaire into a complete, structured marketing plan:

1. **Strategy Engine** — Takes inputs like industry, target customer, primary goal, and biggest struggle, and generates a personalized strategy: recommended platforms, posting frequency, content themes, and tone.
2. **Calendar Engine** — Converts that strategy into an actual day-by-day content calendar with specific post topics, draft captions, and platform-specific tips, spread realistically across the month based on posting frequency.
3. **Analytics & Insights Engine** *(planned)* — Will translate marketing performance data into plain-language recommendations instead of complex dashboards.

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

## Product Validation

Before building, I wrote a full PRD defining the target user (small business owners without a dedicated marketing team), core objectives, and success metrics, including:
- **Activation rate target:** 70% of new users complete onboarding and generate their first strategy + calendar
- **Retention target:** 40% of users return weekly to check their plan or insights
- **Satisfaction target:** average rating of 8/10 or higher

Full PRD included in this repo: [`docs/MarketPilot-PRD.pdf`](./docs/MarketPilot-PRD.pdf)

## Tech Stack

**Backend**
- Node.js + Express
- Anthropic Claude API (Claude Sonnet) for strategy and calendar generation
- Structured JSON prompting for reliable, parseable AI output

**Frontend**
- Next.js
- Deployed on Vercel

## Repository Structure

```
MarketPilot/
├── backend/     — Express API (strategy + calendar generation endpoints)
├── frontend/    — Next.js app
└── docs/        — Product requirements doc
```

## Notes

This is a personal project built to explore product scoping, AI-assisted content generation, and end-to-end shipping — from a written PRD through a live, working deployment. The Analytics & Insights Engine described in the PRD is on the roadmap and not yet implemented.
