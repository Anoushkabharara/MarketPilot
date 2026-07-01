'use client';
import { useState } from 'react';

const API = 'https://marketpilot-backend-production.up.railway.app';

const inputStyle = (hasErr) => ({
  padding: '13px 16px', borderRadius: '8px', background: 'white',
  border: `1px solid ${hasErr ? '#E07070' : '#EDE4D8'}`,
  fontFamily: 'sans-serif', fontSize: '15px', color: '#1E1A16',
  outline: 'none', width: '100%', boxSizing: 'border-box',
});
const textareaStyle = (hasErr) => ({
  ...inputStyle(hasErr), resize: 'vertical', minHeight: '110px', lineHeight: '1.6',
});
const labelStyle = {
  fontSize: '11px', color: '#9E9890', letterSpacing: '0.08em',
  textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: '500', marginBottom: '8px', display: 'block',
};
const errorStyle = { fontSize: '12px', color: '#C0504D', fontFamily: 'sans-serif', marginTop: '5px' };
const tipStyle   = { fontSize: '12px', color: '#9E9890', fontFamily: 'sans-serif', marginTop: '6px', fontWeight: '300' };
const navStyle   = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '72px', background: 'rgba(250,247,242,0.97)', borderBottom: '1px solid #EDE4D8', position: 'sticky', top: 0, zIndex: 100 };
const logoStyle  = { fontSize: '22px', fontWeight: '500', color: '#5C4230', letterSpacing: '0.02em', fontFamily: 'Georgia, serif' };
const btnPrimary = { background: '#7D5F44', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '100px', fontSize: '14px', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: '500' };
const btnGhost   = { background: 'transparent', color: '#7D5F44', border: '1px solid #D9CABC', padding: '12px 24px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', fontFamily: 'sans-serif' };
const btnBack    = { background: 'transparent', color: '#6B6560', border: '1px solid #D9CABC', padding: '10px 20px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', fontFamily: 'sans-serif' };
const btnNext    = { background: '#7D5F44', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: '500' };

const PLATFORM_COLORS = {
  Instagram: '#C4785A', TikTok: '#8B7355', Facebook: '#6B8CAE',
  LinkedIn: '#7B9EA8', Pinterest: '#C05050', YouTube: '#B05C5C',
};

const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const formatMonthYear = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export default function Home() {
  const [screen,   setScreen]   = useState('landing');
  const [step,     setStep]     = useState(1);
  const [form,     setForm]     = useState({});
  const [errors,   setErrors]   = useState({});
  const [strategy, setStrategy] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [calDays,  setCalDays]  = useState(null);
  const [selected, setSelected] = useState(null);

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    setErrors(er => ({ ...er, [key]: null }));
  };

  const requiredFor = {
    1: ['businessName', 'industry', 'location', 'description'],
    2: ['idealCustomer', 'primaryGoal', 'biggestStruggle'],
    3: ['platforms', 'postsPerWeek', 'teamSize'],
  };

  const validate = (n) => {
    const errs = {};
    requiredFor[n].forEach(k => { if (!form[k] || !form[k].trim()) errs[k] = 'This field is required'; });
    return errs;
  };

  const next = () => {
    const errs = validate(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setStep(s => s + 1); window.scrollTo(0, 0);
  };
  const back = () => { setErrors({}); setStep(s => s - 1); window.scrollTo(0, 0); };

  const generateStrategy = async () => {
    const errs = validate(3);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setScreen('loading');
    try {
      const res = await fetch(`${API}/api/strategy`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const json = await res.json();
      setStrategy(json.strategy);
      setScreen('strategy');
    } catch {
      alert('Something went wrong. Make sure your backend is running.');
      setScreen('onboarding');
    }
  };

  const generateCalendar = async (days) => {
    setCalDays(days);
    setScreen('loading-cal');
    setSelected(null);
    try {
      const res = await fetch(`${API}/api/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy,
          businessName: form.businessName,
          days,
          startDate: getTomorrow(),
        }),
      });
      const json = await res.json();
      setCalendar(json.calendar);
      setScreen('calendar');
    } catch {
      alert('Something went wrong generating the calendar.');
      setScreen('cal-choice');
    }
  };

  const restart = () => {
    setScreen('landing'); setStep(1); setForm({}); setErrors({});
    setStrategy(null); setCalendar(null); setCalDays(null); setSelected(null);
  };

  const Err = ({ k }) => errors[k] ? <div style={errorStyle}>⚠ {errors[k]}</div> : null;
  const Tip = ({ t }) => <div style={tipStyle}>💡 {t}</div>;

  const Nav = ({ right }) => (
    <nav style={navStyle}>
      <div style={logoStyle}>Market<em style={{ fontStyle: 'italic', color: '#A8896C' }}>Pilot</em></div>
      {right}
    </nav>
  );

  const Progress = () => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
      {[['Your Business', 1], ['Audience & Goals', 2], ['Platforms', 3]].map(([label, n], i) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 18px', borderRadius: '100px', background: step > n ? '#7D5F44' : step === n ? '#F2EDE4' : 'transparent', border: step === n ? '1px solid #A8896C' : '1px solid transparent' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontFamily: 'sans-serif', fontWeight: '700', background: step > n ? 'rgba(255,255,255,0.25)' : step === n ? '#A8896C' : '#EDE4D8', color: step >= n ? 'white' : '#9E9890' }}>
              {step > n ? '✓' : n}
            </div>
            <span style={{ fontSize: '13px', fontFamily: 'sans-serif', fontWeight: '500', color: step > n ? 'white' : step === n ? '#7D5F44' : '#9E9890' }}>{label}</span>
          </div>
          {i < 2 && <div style={{ width: '28px', height: '1px', background: '#EDE4D8' }} />}
        </div>
      ))}
    </div>
  );

  const LoadingScreen = ({ title, sub }) => (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #EDE4D8', borderTopColor: '#A8896C', animation: 'spin 0.8s linear infinite', marginBottom: '28px' }} />
      <div style={{ fontSize: '28px', fontWeight: '300', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '14px', color: '#9E9890', fontFamily: 'sans-serif', fontWeight: '300' }}>{sub}</div>
    </div>
  );

  // ── LANDING ───────────────────────────────────
  if (screen === 'landing') return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: 'Georgia, serif', color: '#1E1A16' }}>
      <style>{`* { box-sizing: border-box; } input::placeholder { color: #C4B09A; }`}</style>
      <Nav right={<button style={btnPrimary} onClick={() => setScreen('onboarding')}>Get started</button>} />
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '120px 24px 100px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F2EDE4', border: '1px solid #D9CABC', color: '#A8896C', padding: '7px 18px', borderRadius: '100px', fontSize: '12px', fontFamily: 'sans-serif', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '32px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A8896C', display: 'inline-block' }} />
          AI Marketing for Small Business
        </div>
        <h1 style={{ fontSize: 'clamp(48px, 6vw, 80px)', fontWeight: '300', lineHeight: '1.05', letterSpacing: '-1px', marginBottom: '24px', maxWidth: '820px' }}>
          Your marketing, <em style={{ color: '#A8896C' }}>elegantly</em> planned.
        </h1>
        <p style={{ fontSize: '18px', fontWeight: '300', color: '#6B6560', maxWidth: '500px', lineHeight: '1.75', marginBottom: '48px', fontFamily: 'sans-serif' }}>
          Stop guessing what to post. MarketPilot builds your strategy, fills your calendar, and tells you what's working — in plain English.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '72px' }}>
          <button style={{ ...btnPrimary, padding: '16px 40px', fontSize: '15px' }} onClick={() => setScreen('onboarding')}>Start for free</button>
          <button style={{ ...btnGhost, padding: '16px 36px', fontSize: '15px' }}>View sample →</button>
        </div>
        <div style={{ display: 'flex', background: 'white', border: '1px solid #EDE4D8', borderRadius: '20px', boxShadow: '0 2px 20px rgba(93,66,48,0.07)', overflow: 'hidden' }}>
          {[['2,400+', 'Businesses'], ['30-day', 'Content Calendar'], ['~2 hrs', 'Per Week'], ['5 min', 'To Get Started']].map(([num, label], i, arr) => (
            <div key={label} style={{ padding: '28px 44px', textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid #EDE4D8' : 'none' }}>
              <span style={{ fontSize: '30px', color: '#A8896C', display: 'block', marginBottom: '4px' }}>{num}</span>
              <span style={{ fontSize: '11px', color: '#9E9890', fontFamily: 'sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: '100px 64px', borderTop: '1px solid #EDE4D8' }}>
        <div style={{ fontSize: '11px', color: '#A8896C', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: '500', marginBottom: '16px' }}>How it works</div>
        <div style={{ fontSize: '42px', fontWeight: '300', marginBottom: '56px', maxWidth: '400px', lineHeight: '1.15' }}>Three engines, one <em style={{ color: '#A8896C' }}>seamless</em> workflow</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {[['01', 'Strategy Engine', 'Answer nine questions. Get a complete personalised marketing strategy tailored to your industry, audience, and goals.'],
            ['02', 'Calendar Engine', 'Choose 15 or 30 days. Your strategy becomes a real content calendar starting from tomorrow — click any day to see what to post.'],
            ['03', 'Insights Engine', "Every Monday, a plain-language report. Understand what worked, what didn't, and get recommendations for the week ahead."]
          ].map(([n, title, desc]) => (
            <div key={n} style={{ background: 'white', border: '1px solid #EDE4D8', borderRadius: '20px', padding: '40px' }}>
              <div style={{ fontSize: '48px', fontWeight: '300', color: '#EDE4D8', lineHeight: '1', marginBottom: '24px' }}>{n}</div>
              <h3 style={{ fontSize: '22px', fontWeight: '400', marginBottom: '12px' }}>{title}</h3>
              <p style={{ fontSize: '14px', color: '#6B6560', lineHeight: '1.75', fontFamily: 'sans-serif', fontWeight: '300', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <div style={{ background: '#F2EDE4', borderTop: '1px solid #EDE4D8', padding: '80px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
        <div>
          <h2 style={{ fontSize: '36px', fontWeight: '300', marginBottom: '8px' }}>Join the waitlist</h2>
          <p style={{ color: '#6B6560', fontSize: '15px', fontFamily: 'sans-serif', fontWeight: '300', margin: 0 }}>Get three months free when we launch.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input type="email" placeholder="your@email.com" style={{ padding: '13px 20px', borderRadius: '10px', width: '280px', background: 'white', border: '1px solid #D9CABC', fontFamily: 'sans-serif', fontSize: '14px', outline: 'none' }} />
          <button style={btnPrimary} onClick={() => setScreen('onboarding')}>Reserve my spot</button>
        </div>
      </div>
    </div>
  );

  if (screen === 'loading')     return <LoadingScreen title="Crafting your strategy…"          sub="Our AI is analysing your business and audience" />;
  if (screen === 'loading-cal') return <LoadingScreen title={`Building your ${calDays}-day calendar…`} sub="Generating your personalised content plan" />;

  // ── ONBOARDING ────────────────────────────────
  if (screen === 'onboarding') return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: 'Georgia, serif', color: '#1E1A16' }}>
      <style>{`* { box-sizing: border-box; } input:focus, textarea:focus { border-color: #A8896C !important; outline: none; } input::placeholder, textarea::placeholder { color: #C4B09A; }`}</style>
      <Nav right={<span style={{ fontSize: '13px', color: '#9E9890', fontFamily: 'sans-serif' }}>Step {step} of 3</span>} />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '64px 24px' }}>
        <Progress />
        {step === 1 && <>
          <div style={{ fontSize: '11px', color: '#A8896C', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: '500', marginBottom: '10px' }}>Step 1 of 3</div>
          <h2 style={{ fontSize: '38px', fontWeight: '300', marginBottom: '8px' }}>Tell us about your business</h2>
          <p style={{ color: '#6B6560', fontSize: '15px', fontFamily: 'sans-serif', fontWeight: '300', marginBottom: '44px', lineHeight: '1.6' }}>This is the foundation of your strategy — the more detail you give, the better your results.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div><label style={labelStyle}>Business Name <span style={{ color: '#A8896C' }}>*</span></label><input value={form.businessName || ''} onChange={set('businessName')} placeholder="e.g. Glow & Grow Salon" style={inputStyle(!!errors.businessName)} /><Err k="businessName" /></div>
            <div><label style={labelStyle}>Industry <span style={{ color: '#A8896C' }}>*</span></label><input value={form.industry || ''} onChange={set('industry')} placeholder="e.g. Beauty & Wellness, Fitness…" style={inputStyle(!!errors.industry)} /><Err k="industry" /></div>
            <div><label style={labelStyle}>City & Region <span style={{ color: '#A8896C' }}>*</span></label><input value={form.location || ''} onChange={set('location')} placeholder="e.g. Austin, Texas" style={inputStyle(!!errors.location)} /><Err k="location" /></div>
            <div />
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Describe your business <span style={{ color: '#A8896C' }}>*</span></label>
              <textarea value={form.description || ''} onChange={set('description')} placeholder="What you do, who your customers are, what makes you different…" style={textareaStyle(!!errors.description)} />
              <Err k="description" />{!errors.description && <Tip t="The more detail here, the more specific your strategy." />}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #EDE4D8' }}>
            <button style={btnBack} onClick={() => setScreen('landing')}>← Back</button>
            <button style={btnNext} onClick={next}>Next: Audience & Goals →</button>
          </div>
        </>}
        {step === 2 && <>
          <div style={{ fontSize: '11px', color: '#A8896C', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: '500', marginBottom: '10px' }}>Step 2 of 3</div>
          <h2 style={{ fontSize: '38px', fontWeight: '300', marginBottom: '8px' }}>Your audience & goals</h2>
          <p style={{ color: '#6B6560', fontSize: '15px', fontFamily: 'sans-serif', fontWeight: '300', marginBottom: '44px', lineHeight: '1.6' }}>Understanding who you're speaking to is what makes a strategy actually work.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Who is your ideal customer? <span style={{ color: '#A8896C' }}>*</span></label>
              <textarea value={form.idealCustomer || ''} onChange={set('idealCustomer')} placeholder="Age, lifestyle, what they care about…" style={textareaStyle(!!errors.idealCustomer)} />
              <Err k="idealCustomer" />{!errors.idealCustomer && <Tip t="Think about your best current customers." />}
            </div>
            <div><label style={labelStyle}>Primary Goal <span style={{ color: '#A8896C' }}>*</span></label><input value={form.primaryGoal || ''} onChange={set('primaryGoal')} placeholder="e.g. Get more bookings, grow followers…" style={inputStyle(!!errors.primaryGoal)} /><Err k="primaryGoal" /></div>
            <div><label style={labelStyle}>Biggest Struggle <span style={{ color: '#A8896C' }}>*</span></label><input value={form.biggestStruggle || ''} onChange={set('biggestStruggle')} placeholder="e.g. Don't know what to post…" style={inputStyle(!!errors.biggestStruggle)} /><Err k="biggestStruggle" /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #EDE4D8' }}>
            <button style={btnBack} onClick={back}>← Back</button>
            <button style={btnNext} onClick={next}>Next: Platforms →</button>
          </div>
        </>}
        {step === 3 && <>
          <div style={{ fontSize: '11px', color: '#A8896C', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: '500', marginBottom: '10px' }}>Step 3 of 3</div>
          <h2 style={{ fontSize: '38px', fontWeight: '300', marginBottom: '8px' }}>Platforms & capacity</h2>
          <p style={{ color: '#6B6560', fontSize: '15px', fontFamily: 'sans-serif', fontWeight: '300', marginBottom: '44px', lineHeight: '1.6' }}>A strategy you can't execute is useless — tell us what's realistic.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div><label style={labelStyle}>Which platforms are you on? <span style={{ color: '#A8896C' }}>*</span></label><input value={form.platforms || ''} onChange={set('platforms')} placeholder="e.g. Instagram, TikTok, Facebook…" style={inputStyle(!!errors.platforms)} /><Err k="platforms" />{!errors.platforms && <Tip t="List all you use, even occasionally." />}</div>
            <div><label style={labelStyle}>Posts per week <span style={{ color: '#A8896C' }}>*</span></label><input value={form.postsPerWeek || ''} onChange={set('postsPerWeek')} placeholder="e.g. 3–5 posts" style={inputStyle(!!errors.postsPerWeek)} /><Err k="postsPerWeek" /></div>
            <div><label style={labelStyle}>Solo or team? <span style={{ color: '#A8896C' }}>*</span></label><input value={form.teamSize || ''} onChange={set('teamSize')} placeholder="e.g. Just me / Small team" style={inputStyle(!!errors.teamSize)} /><Err k="teamSize" /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #EDE4D8' }}>
            <button style={btnBack} onClick={back}>← Back</button>
            <button style={{ ...btnNext, padding: '13px 32px', fontSize: '15px' }} onClick={generateStrategy}>Generate My Strategy ✦</button>
          </div>
        </>}
      </div>
    </div>
  );

  // ── STRATEGY ──────────────────────────────────
  if (screen === 'strategy') return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: 'Georgia, serif', color: '#1E1A16' }}>
      <style>{`* { box-sizing: border-box; }`}</style>
      <Nav right={<button style={btnGhost} onClick={() => setScreen('cal-choice')}>Build Calendar →</button>} />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ fontSize: '11px', color: '#A8896C', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: '500', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A8896C', display: 'inline-block' }} />
          Generated for {form.businessName} · {form.location}
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: '300', marginBottom: '48px' }}>Your Marketing Strategy</h1>
        {strategy && [
          ['Recommended Platforms', Array.isArray(strategy.platforms) ? strategy.platforms.join(', ') : strategy.platforms, false],
          ['Posting Schedule', strategy.postingSchedule, false],
          ['Content Themes', Array.isArray(strategy.contentThemes) ? strategy.contentThemes.join(' · ') : strategy.contentThemes, false],
          ['Tone & Style', strategy.toneAndStyle, false],
          ['✦ Top Tip', strategy.topTip, true],
        ].map(([title, content, highlight]) => (
          <div key={title} style={{ background: highlight ? '#FDF6EE' : 'white', border: `1px solid ${highlight ? '#C4B09A' : '#EDE4D8'}`, borderRadius: '16px', padding: '28px 32px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#9E9890', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: '500', marginBottom: '10px' }}>{title}</div>
            <p style={{ fontSize: '16px', color: '#1E1A16', lineHeight: '1.7', margin: 0, fontWeight: '300' }}>{content}</p>
          </div>
        ))}
        <div style={{ background: '#7D5F44', borderRadius: '20px', padding: '40px', marginTop: '40px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '300', color: 'white', marginBottom: '8px' }}>Ready to build your content calendar?</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'sans-serif', fontWeight: '300', marginBottom: '28px' }}>Turn your strategy into a real calendar starting tomorrow.</p>
          <button style={{ ...btnPrimary, background: 'white', color: '#7D5F44', padding: '14px 36px', fontSize: '15px' }} onClick={() => setScreen('cal-choice')}>Build My Calendar →</button>
        </div>
        <button onClick={restart} style={{ background: 'transparent', border: '1px solid #D9CABC', color: '#A8896C', padding: '12px 28px', borderRadius: '100px', fontSize: '14px', cursor: 'pointer', marginTop: '24px', fontFamily: 'sans-serif' }}>Start Over</button>
      </div>
    </div>
  );

  // ── CALENDAR CHOICE ───────────────────────────
  if (screen === 'cal-choice') return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: 'Georgia, serif', color: '#1E1A16' }}>
      <style>{`* { box-sizing: border-box; }`}</style>
      <Nav right={<button style={btnGhost} onClick={() => setScreen('strategy')}>← Back to strategy</button>} />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: '#A8896C', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: '500', marginBottom: '16px' }}>Calendar Engine</div>
        <h2 style={{ fontSize: '42px', fontWeight: '300', marginBottom: '12px' }}>How far ahead do you want to plan?</h2>
        <p style={{ color: '#6B6560', fontSize: '16px', fontFamily: 'sans-serif', fontWeight: '300', marginBottom: '16px', lineHeight: '1.7' }}>Your calendar will start from tomorrow and show exactly what to post each day.</p>
        <p style={{ color: '#A8896C', fontSize: '14px', fontFamily: 'sans-serif', fontWeight: '500', marginBottom: '52px' }}>Starting from: {new Date(getTomorrow() + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div onClick={() => generateCalendar(15)} style={{ background: 'white', border: '2px solid #EDE4D8', borderRadius: '20px', padding: '40px 32px', cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#A8896C'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(93,66,48,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE4D8'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ fontSize: '48px', fontWeight: '300', color: '#A8896C', lineHeight: '1', marginBottom: '12px' }}>15</div>
            <div style={{ fontSize: '20px', fontWeight: '400', marginBottom: '12px' }}>Days</div>
            <p style={{ fontSize: '14px', color: '#6B6560', fontFamily: 'sans-serif', fontWeight: '300', lineHeight: '1.65', margin: '0 0 20px' }}>A focused two-week plan. Great for getting started or testing before committing to a full month.</p>
            <div style={{ color: '#A8896C', fontSize: '13px', fontFamily: 'sans-serif', fontWeight: '500' }}>Start with 15 days →</div>
          </div>
          <div onClick={() => generateCalendar(30)} style={{ background: '#7D5F44', border: '2px solid #7D5F44', borderRadius: '20px', padding: '40px 32px', cursor: 'pointer', textAlign: 'left', transition: 'all .2s', position: 'relative' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5C4230'; e.currentTarget.style.borderColor = '#5C4230'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#7D5F44'; e.currentTarget.style.borderColor = '#7D5F44'; }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#A8896C', color: 'white', fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '100px', fontFamily: 'sans-serif' }}>RECOMMENDED</div>
            <div style={{ fontSize: '48px', fontWeight: '300', color: 'rgba(255,255,255,0.9)', lineHeight: '1', marginBottom: '12px' }}>30</div>
            <div style={{ fontSize: '20px', fontWeight: '400', color: 'white', marginBottom: '12px' }}>Days</div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', fontFamily: 'sans-serif', fontWeight: '300', lineHeight: '1.65', margin: '0 0 20px' }}>A full month of content. The most effective way to build consistent marketing habits.</p>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontFamily: 'sans-serif', fontWeight: '500' }}>Go all in with 30 days →</div>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#9E9890', fontFamily: 'sans-serif', fontWeight: '300', marginTop: '32px' }}>✦ Click any day on the calendar to see what to post, draft captions, and tips</p>
      </div>
    </div>
  );

  // ── CALENDAR VIEW ─────────────────────────────
  if (screen === 'calendar' && calendar) {
    // Group calendar days by month+week for grid rendering
    const firstDate = new Date(calendar[0].date + 'T00:00:00');
    const startDow = firstDate.getDay(); // 0=Sun

    // Build grid with leading empty cells
    const gridCells = [];
    for (let i = 0; i < startDow; i++) gridCells.push(null);
    calendar.forEach(day => gridCells.push(day));
    // Pad to complete last week
    while (gridCells.length % 7 !== 0) gridCells.push(null);

    const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: 'Georgia, serif', color: '#1E1A16' }}>
        <style>{`* { box-sizing: border-box; } .cal-cell:hover { background: #F2EDE4 !important; } .post-cell:hover { background: #FDF6EE !important; }`}</style>
        <Nav right={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={btnGhost} onClick={() => setScreen('strategy')}>← Strategy</button>
            <button style={btnPrimary} onClick={() => setScreen('cal-choice')}>Regenerate</button>
          </div>
        } />

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#A8896C', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: '500', marginBottom: '8px' }}>
                {calDays}-Day Content Calendar · {form.businessName}
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: '300', margin: 0 }}>
                {formatMonthYear(calendar[0].date)}
                {calendar[calendar.length-1].date.slice(0,7) !== calendar[0].date.slice(0,7) && ` — ${formatMonthYear(calendar[calendar.length-1].date)}`}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {strategy?.platforms?.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #EDE4D8', borderRadius: '100px', padding: '5px 12px', fontSize: '12px', fontFamily: 'sans-serif' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PLATFORM_COLORS[p] || '#A8896C' }} />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ background: 'white', border: '1px solid #EDE4D8', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Day of week headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #EDE4D8' }}>
              {DOW.map(d => (
                <div key={d} style={{ padding: '12px 0', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#9E9890', fontFamily: 'sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{d}</div>
              ))}
            </div>
            {/* Weeks */}
            {Array.from({ length: gridCells.length / 7 }, (_, wi) => (
              <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: wi < gridCells.length / 7 - 1 ? '1px solid #EDE4D8' : 'none' }}>
                {gridCells.slice(wi * 7, wi * 7 + 7).map((day, ci) => {
                  if (!day) return <div key={ci} style={{ minHeight: '100px', background: '#FAFAF8', borderRight: ci < 6 ? '1px solid #EDE4D8' : 'none' }} />;
                  const isSelected = selected?.dayIndex === day.dayIndex;
                  const pColor = PLATFORM_COLORS[day.platform] || '#A8896C';
                  return (
                    <div
                      key={ci}
                      className={day.hasPost ? 'post-cell' : 'cal-cell'}
                      onClick={() => day.hasPost ? setSelected(isSelected ? null : day) : null}
                      style={{
                        minHeight: '100px', padding: '10px', cursor: day.hasPost ? 'pointer' : 'default',
                        borderRight: ci < 6 ? '1px solid #EDE4D8' : 'none',
                        background: isSelected ? '#FDF6EE' : 'white',
                        transition: 'background .15s',
                        outline: isSelected ? `2px solid ${pColor}` : 'none',
                        outlineOffset: '-2px',
                      }}
                    >
                      {/* Date number */}
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#9E9890', fontFamily: 'sans-serif', marginBottom: '6px' }}>
                        {new Date(day.date + 'T00:00:00').getDate()}
                      </div>
                      {/* Post pill */}
                      {day.hasPost && (
                        <div style={{ background: pColor + '18', border: `1px solid ${pColor}40`, borderRadius: '6px', padding: '5px 7px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: pColor, flexShrink: 0 }} />
                            <span style={{ fontSize: '10px', fontWeight: '700', color: pColor, fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{day.platform}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#3A3632', fontFamily: 'sans-serif', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {day.topic}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Selected Day Panel */}
          {selected && (
            <div style={{ marginTop: '24px', background: 'white', border: `2px solid ${PLATFORM_COLORS[selected.platform] || '#A8896C'}`, borderRadius: '16px', padding: '32px', animation: 'fadeIn .2s ease' }}>
              <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: PLATFORM_COLORS[selected.platform] || '#A8896C' }} />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: PLATFORM_COLORS[selected.platform] || '#A8896C', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{selected.platform}</span>
                    <span style={{ fontSize: '12px', color: '#9E9890', fontFamily: 'sans-serif' }}>· {selected.contentType}</span>
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: '400', margin: 0 }}>{selected.topic}</h3>
                  <div style={{ fontSize: '13px', color: '#9E9890', fontFamily: 'sans-serif', marginTop: '4px' }}>
                    {new Date(selected.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9890', fontSize: '20px', padding: '4px' }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#9E9890', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: '500', marginBottom: '10px' }}>Draft Caption</div>
                  <div style={{ background: '#FAF7F2', border: '1px solid #EDE4D8', borderRadius: '10px', padding: '16px', fontSize: '14px', color: '#3A3632', fontFamily: 'sans-serif', lineHeight: '1.7', fontWeight: '300' }}>
                    {selected.caption}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button style={{ ...btnPrimary, padding: '8px 20px', fontSize: '13px' }}>✓ Approve</button>
                    <button style={{ ...btnGhost, padding: '8px 20px', fontSize: '13px' }}>✏ Edit</button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#9E9890', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: '500', marginBottom: '10px' }}>How to Create This</div>
                  <div style={{ background: '#FAF7F2', border: '1px solid #EDE4D8', borderRadius: '10px', padding: '16px', fontSize: '14px', color: '#3A3632', fontFamily: 'sans-serif', lineHeight: '1.7', fontWeight: '300' }}>
                    {selected.tips || 'Film in natural light. Keep it authentic and on-brand. Engage with comments within the first hour of posting.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #EDE4D8' }}>
            {calDays === 15 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#6B6560', fontFamily: 'sans-serif', fontWeight: '300', marginBottom: '12px' }}>Ready to plan the full month?</p>
                <button style={{ ...btnPrimary, padding: '12px 28px' }} onClick={() => generateCalendar(30)}>Extend to 30 days →</button>
              </div>
            )}
            <button onClick={restart} style={{ background: 'transparent', border: '1px solid #D9CABC', color: '#A8896C', padding: '12px 28px', borderRadius: '100px', fontSize: '14px', cursor: 'pointer', fontFamily: 'sans-serif' }}>Start Over</button>
          </div>
        </div>
      </div>
    );
  }
}
