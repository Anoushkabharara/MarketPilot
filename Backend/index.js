const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get('/', (req, res) => {
  res.json({ message: 'MarketPilot API is running!' });
});

// ── STRATEGY ENDPOINT ─────────────────────────────────────────────
app.post('/api/strategy', async (req, res) => {
  const { businessName, industry, description, location, idealCustomer, primaryGoal, biggestStruggle, platforms, postsPerWeek, teamSize } = req.body;
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a marketing strategist. Generate a marketing strategy for this business:
Business: ${businessName}
Industry: ${industry}
Description: ${description}
Location: ${location}
Ideal Customer: ${idealCustomer}
Primary Goal: ${primaryGoal}
Biggest Struggle: ${biggestStruggle}
Platforms: ${platforms}
Posts per week: ${postsPerWeek}
Team size: ${teamSize}

Respond ONLY with a JSON object in this exact format, no other text:
{
  "platforms": ["platform1", "platform2"],
  "postingSchedule": "description of when to post",
  "contentThemes": ["theme1", "theme2", "theme3"],
  "toneAndStyle": "description of tone",
  "topTip": "single most important tip for this business"
}`
      }]
    });
    const strategy = JSON.parse(message.content[0].text);
    res.json({ success: true, strategy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── CALENDAR ENDPOINT ─────────────────────────────────────────────
app.post('/api/calendar', async (req, res) => {
  const { strategy, businessName, days, startDate } = req.body;

  // Build array of actual dates starting from tomorrow
  const start = new Date(startDate);
  const dateList = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dateList.push({
      index: i + 1,
      dateStr: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }

  // Determine how many posts to generate based on postsPerWeek
  // Spread posts across the days — not every day gets a post
  const weeksCount = Math.ceil(days / 7);
  const postsPerWeek = strategy.postsPerWeek || 3;
  const totalPosts = Math.min(weeksCount * postsPerWeek, days);

  // Pick which day indices get posts (spread evenly)
  const postIndices = new Set();
  const step = days / totalPosts;
  for (let i = 0; i < totalPosts; i++) {
    postIndices.add(Math.min(Math.floor(i * step), days - 1));
  }
  const postDays = dateList.filter((_, idx) => postIndices.has(idx));

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `You are a social media content planner for ${businessName}.

Strategy:
- Platforms: ${strategy.platforms?.join(', ')}
- Content Themes: ${strategy.contentThemes?.join(', ')}
- Tone: ${strategy.toneAndStyle}

Generate content for EXACTLY these ${postDays.length} dates. No more, no less:
${postDays.map(d => `- Day ${d.index}: ${d.label} (${d.dateStr})`).join('\n')}

Respond ONLY with a JSON array with exactly ${postDays.length} items, no other text:
[
  {
    "dayIndex": 1,
    "date": "2026-03-21",
    "dateLabel": "Sat, Mar 21",
    "platform": "Instagram",
    "contentType": "Photo",
    "topic": "specific post idea",
    "caption": "draft caption 2-3 sentences in a conversational tone",
    "tips": "one specific filming or photography tip for this post"
  }
]

Make each topic specific and actionable. Vary platforms and content types. Use the content themes.`
      }]
    });

    const text = message.content[0].text.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const posts = JSON.parse(clean);

    // Build full calendar — all days, with posts on assigned days
    const fullCalendar = dateList.map(day => {
      const post = posts.find(p => p.dayIndex === day.index);
      return {
        dayIndex: day.index,
        date: day.dateStr,
        dateLabel: day.label,
        hasPost: !!post,
        ...(post || {})
      };
    });

    res.json({ success: true, calendar: fullCalendar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
