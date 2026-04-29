// frontend/src/pages/Dashboard.js
// VYVRA – Full Dashboard (Day 3 updated)
// Includes: Insights card, sidebar navigation, history link, profile link

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  getFitnessStats,
  addFitnessEntry,
  getFitnessInsights
} from '../services/api';

/* ─────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────── */
const THEMES = {
  dark: {
    bg:           '#0d0d0f',
    surface:      '#17171a',
    border:       '#2a2a30',
    borderLight:  '#222228',
    text:         '#f0f0f4',
    textSub:      '#8888a0',
    textMuted:    '#44444e',
    accent:       '#6366f1',
    accentBg:     '#1e1e3a',
    success:      '#22c55e',
    danger:       '#ef4444',
    chartGrid:    '#1e1e24',
    tooltipBg:    '#1a1a22',
    cardShadow:   '0 1px 3px rgba(0,0,0,0.4)',
  },
  light: {
    bg:           '#f4f4f8',
    surface:      '#ffffff',
    border:       '#e4e4ec',
    borderLight:  '#ededf4',
    text:         '#111118',
    textSub:      '#6b6b80',
    textMuted:    '#b0b0c0',
    accent:       '#4f46e5',
    accentBg:     '#eff0ff',
    success:      '#16a34a',
    danger:       '#dc2626',
    chartGrid:    '#f0f0f5',
    tooltipBg:    '#ffffff',
    cardShadow:   '0 1px 3px rgba(0,0,0,0.08)',
  }
};

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const Icon = {
  steps:   () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  fire:    () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>,
  sleep:   () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>,
  water:   () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.477 2 2 9 2 13a10 10 0 0020 0c0-4-4.477-11-10-11z"/></svg>,
  sun:     () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  moon:    () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>,
  plus:    () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 12h16"/></svg>,
  close:   () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  logout:  () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
  chart:   () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  user:    () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  history: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
};

/* ─────────────────────────────────────────
   PROGRESS RING
───────────────────────────────────────── */
function ProgressRing({ value, max, color, size = 52 }) {
  const pct  = Math.min((value / max) * 100, 100);
  const r    = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color, progress, progressMax, t }) {
  return (
    <div style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '20px', boxShadow: t.cardShadow, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: color + '1a', color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: t.textSub }}>{label}</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: t.text, lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</div>
        </div>
        {progress !== undefined && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <ProgressRing value={progress} max={progressMax} color={color}/>
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '10px', fontWeight: '700', color }}>
              {Math.round((progress / progressMax) * 100)}%
            </span>
          </div>
        )}
      </div>
      <div style={{ fontSize: '12px', color: t.textSub, borderTop: `1px solid ${t.borderLight}`, paddingTop: '10px' }}>{sub}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CUSTOM TOOLTIP
───────────────────────────────────────── */
function CustomTooltip({ active, payload, label, unit, color, t }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: t.tooltipBg, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
      <p style={{ color: t.textSub, fontSize: '12px', margin: '0 0 4px' }}>{label}</p>
      <p style={{ color, fontSize: '16px', fontWeight: '700', margin: 0 }}>{payload[0].value.toLocaleString()} {unit}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   INSIGHTS CARD
───────────────────────────────────────── */
function InsightsCard({ t, navigate }) {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    getFitnessInsights()
      .then(res => setInsights(res.data))
      .catch(() => {});
  }, []);

  if (!insights?.has_data) return null;

  const { averages, best_days, streaks } = insights;

  const items = [
    { emoji: '👟', label: '30-day avg steps',  value: averages.steps.toLocaleString(),  color: '#6366f1' },
    { emoji: '😴', label: 'Best sleep day',    value: best_days.sleep?.day ? `${best_days.sleep.day} — ${best_days.sleep.value} hrs` : '—', color: '#8b5cf6' },
    { emoji: '💧', label: 'Hydration streak',  value: `${streaks.water} day${streaks.water !== 1 ? 's' : ''}`, color: '#06b6d4' },
    { emoji: '🏆', label: 'Steps goal streak', value: `${streaks.steps} day${streaks.steps !== 1 ? 's' : ''}`, color: '#f97316' },
  ];

  return (
    <div style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px', marginTop: '20px', boxShadow: t.cardShadow }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: t.text }}>Your Insights</h2>
          <p style={{ fontSize: '13px', color: t.textSub, marginTop: '2px' }}>Powered by Pandas analytics</p>
        </div>
        <button onClick={() => navigate('/history')} style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${t.border}`, backgroundColor: 'transparent', color: t.textSub, cursor: 'pointer', fontSize: '13px' }}>
          View history →
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {items.map((c, i) => (
          <div key={i} style={{ backgroundColor: t.bg, borderRadius: '12px', padding: '16px', borderLeft: `3px solid ${c.color}` }}>
            <p style={{ fontSize: '20px', marginBottom: '8px' }}>{c.emoji}</p>
            <p style={{ fontSize: '15px', fontWeight: '700', color: t.text, marginBottom: '3px' }}>{c.value}</p>
            <p style={{ fontSize: '12px', color: t.textSub }}>{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || '{}');

  const [theme, setTheme]           = useState(() => localStorage.getItem('vyvra_theme') || 'dark');
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [activeChart, setActiveChart] = useState('steps');
  const [formData, setFormData]     = useState({ steps: '', calories: '', sleep_hours: '', water_litres: '' });
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);

  const t = THEMES[theme];

  useEffect(() => { localStorage.setItem('vyvra_theme', theme); }, [theme]);
  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const loadStats = async () => {
    try {
      const res = await getFitnessStats();
      setStats(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addFitnessEntry({
        steps:        parseInt(formData.steps)          || 0,
        calories:     parseInt(formData.calories)       || 0,
        sleep_hours:  parseFloat(formData.sleep_hours)  || 0,
        water_litres: parseFloat(formData.water_litres) || 0,
      });
      setToast({ msg: 'Entry saved successfully!', type: 'success' });
      setShowForm(false);
      setFormData({ steps: '', calories: '', sleep_hours: '', water_litres: '' });
      loadStats();
    } catch {
      setToast({ msg: 'Failed to save. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg, gap: '16px' }}>
      <div style={{ width: '36px', height: '36px', border: `3px solid ${t.border}`, borderTop: `3px solid ${t.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <p style={{ color: t.textSub, fontSize: '14px' }}>Loading your data…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const today     = stats?.today;
  const chartData = stats?.weekly_chart || [];
  const hasData   = chartData.some(d => d.steps > 0 || d.calories > 0);
  const greeting  = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const statCards = [
    { icon: <Icon.steps/>, label: 'Steps',    color: t.accent,  value: today ? today.steps.toLocaleString()         : '—', sub: today ? `${Math.round((today.steps/10000)*100)}% of 10,000 goal`                             : 'No entry yet', progress: today?.steps,        progressMax: 10000 },
    { icon: <Icon.fire/>,  label: 'Calories', color: '#f97316', value: today ? `${today.calories.toLocaleString()} kcal` : '—', sub: today ? 'Active burn for today'                                                          : 'No entry yet', progress: today?.calories,     progressMax: 2500  },
    { icon: <Icon.sleep/>, label: 'Sleep',    color: '#8b5cf6', value: today ? `${today.sleep_hours} hrs`            : '—', sub: today ? (today.sleep_hours >= 7 ? 'Great sleep! 🌟' : 'Aim for 7–9 hrs')                    : 'No entry yet', progress: today?.sleep_hours,  progressMax: 9     },
    { icon: <Icon.water/>, label: 'Water',    color: '#06b6d4', value: today ? `${today.water_litres} L`             : '—', sub: today ? (today.water_litres >= 2 ? 'Well hydrated! 💪' : 'Aim for 2+ litres')                : 'No entry yet', progress: today?.water_litres, progressMax: 3     },
  ];

  const formFields = [
    { name: 'steps',        label: 'Steps',           icon: <Icon.steps/>,  color: t.accent,  placeholder: 'e.g. 8000', step: '1',   min: '0' },
    { name: 'calories',     label: 'Calories burned', icon: <Icon.fire/>,   color: '#f97316', placeholder: 'e.g. 1800', step: '1',   min: '0' },
    { name: 'sleep_hours',  label: 'Sleep (hours)',   icon: <Icon.sleep/>,  color: '#8b5cf6', placeholder: 'e.g. 7.5',  step: '0.5', min: '0' },
    { name: 'water_litres', label: 'Water (litres)',  icon: <Icon.water/>,  color: '#06b6d4', placeholder: 'e.g. 2.0',  step: '0.1', min: '0' },
  ];

  const navItems = [
    { icon: <Icon.chart/>,   label: 'Dashboard', path: '/dashboard' },
    { icon: <Icon.history/>, label: 'History',   path: '/history'   },
    { icon: <Icon.user/>,    label: 'Profile',   path: '/profile'   },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, color: t.text, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", transition: 'background-color 0.3s,color 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input[type=number]::-webkit-inner-spin-button{opacity:0.4;}
        input:focus{outline:none;border-color:${t.accent}!important;box-shadow:0 0 0 3px ${t.accent}22!important;}
        button:active{transform:scale(0.97);}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
        @media(max-width:768px){.sidebar{display:none!important}}
        @media(max-width:600px){.stat-grid{grid-template-columns:1fr 1fr!important}.form-grid{grid-template-columns:1fr!important}}
        @media(max-width:400px){.stat-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:'20px', right:'20px', zIndex:9999, backgroundColor: toast.type==='success' ? t.success : t.danger, color:'#fff', padding:'12px 20px', borderRadius:'12px', fontSize:'14px', fontWeight:'500', boxShadow:'0 8px 24px rgba(0,0,0,0.2)', animation:'toastIn 0.3s ease', display:'flex', alignItems:'center', gap:'8px' }}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      <div style={{ display:'flex', minHeight:'100vh' }}>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar" style={{ width:'220px', flexShrink:0, backgroundColor:t.surface, borderRight:`1px solid ${t.border}`, padding:'28px 16px', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>
          <div style={{ marginBottom:'36px', paddingLeft:'8px' }}>
            <div style={{ fontSize:'20px', fontWeight:'800', letterSpacing:'0.12em', color:t.accent }}>VYVRA</div>
            <div style={{ fontSize:'11px', color:t.textMuted, letterSpacing:'0.08em', marginTop:'2px' }}>FITNESS ANALYTICS</div>
          </div>

          {navItems.map(item => {
            const active = window.location.pathname === item.path;
            return (
              <div key={item.label} onClick={() => navigate(item.path)} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'10px', marginBottom:'4px', backgroundColor: active ? t.accentBg : 'transparent', color: active ? t.accent : t.textSub, cursor:'pointer', fontSize:'14px', fontWeight: active ? '600' : '400', transition:'all 0.15s' }}>
                {item.icon} {item.label}
              </div>
            );
          })}

          <div style={{ flex:1 }}/>

          <div style={{ borderTop:`1px solid ${t.border}`, paddingTop:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
              <div style={{ width:'34px', height:'34px', borderRadius:'50%', backgroundColor:t.accentBg, color:t.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'700', flexShrink:0 }}>
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight:'600', color:t.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.username}</div>
                <div style={{ fontSize:'11px', color:t.textMuted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
              </div>
            </div>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ width:'100%', display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', borderRadius:'8px', border:`1px solid ${t.border}`, backgroundColor:'transparent', color:t.textSub, cursor:'pointer', fontSize:'13px', fontWeight:'500', marginBottom:'8px' }}>
              {theme === 'dark' ? <Icon.sun/> : <Icon.moon/>} {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <button onClick={handleLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', borderRadius:'8px', border:'none', backgroundColor:'transparent', color:t.danger, cursor:'pointer', fontSize:'13px', fontWeight:'500' }}>
              <Icon.logout/> Log out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex:1, minWidth:0 }}>

          {/* Top nav */}
          <header style={{ backgroundColor:t.surface, borderBottom:`1px solid ${t.border}`, padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
            <div style={{ fontSize:'16px', fontWeight:'800', letterSpacing:'0.1em', color:t.accent }}>VYVRA</div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
              {navItems.map(item => (
                <button key={item.label} onClick={() => navigate(item.path)} style={{ padding:'6px 10px', borderRadius:'8px', border:'none', backgroundColor:'transparent', color: window.location.pathname===item.path ? t.accent : t.textSub, cursor:'pointer', fontSize:'12px', fontWeight:'500' }}>
                  {item.label}
                </button>
              ))}
              <button onClick={() => setTheme(theme==='dark'?'light':'dark')} style={{ width:'36px', height:'36px', borderRadius:'10px', border:`1px solid ${t.border}`, backgroundColor:t.surface, color:t.textSub, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {theme==='dark' ? <Icon.sun/> : <Icon.moon/>}
              </button>
              <button onClick={() => setShowForm(f => !f)} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'10px', backgroundColor: showForm ? t.surface : t.accent, border: showForm ? `1px solid ${t.border}` : 'none', color: showForm ? t.textSub : '#fff', cursor:'pointer', fontSize:'13px', fontWeight:'600', transition:'all 0.2s' }}>
                {showForm ? <Icon.close/> : <Icon.plus/>} {showForm ? 'Cancel' : 'Log Today'}
              </button>
            </div>
          </header>

          {/* Page content */}
          <div style={{ padding:'28px 24px', maxWidth:'1000px' }}>

            {/* Greeting */}
            <div style={{ marginBottom:'24px' }}>
              <h1 style={{ fontSize:'22px', fontWeight:'700', color:t.text, marginBottom:'4px', letterSpacing:'-0.02em' }}>Good {greeting}, {user.username} 👋</h1>
              <p style={{ color:t.textSub, fontSize:'14px' }}>{todayDate}</p>
            </div>

            {/* Form */}
            {showForm && (
              <div style={{ backgroundColor:t.surface, border:`1px solid ${t.border}`, borderRadius:'16px', padding:'24px', marginBottom:'24px', boxShadow:t.cardShadow, animation:'slideDown 0.2s ease' }}>
                <h2 style={{ fontSize:'16px', fontWeight:'700', color:t.text, marginBottom:'4px' }}>Log today's activity</h2>
                <p style={{ fontSize:'13px', color:t.textSub, marginBottom:'20px' }}>Fill in what you tracked today</p>
                <form onSubmit={handleSubmit}>
                  <div className="form-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px', marginBottom:'20px' }}>
                    {formFields.map(f => (
                      <div key={f.name}>
                        <label style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', fontWeight:'500', color:t.textSub, marginBottom:'8px' }}>
                          <span style={{ color:f.color }}>{f.icon}</span> {f.label}
                        </label>
                        <input type="number" name={f.name} value={formData[f.name]} onChange={e => setFormData({...formData,[e.target.name]:e.target.value})} placeholder={f.placeholder} min={f.min} step={f.step} style={{ width:'100%', padding:'10px 14px', backgroundColor:t.bg, border:`1px solid ${t.border}`, borderRadius:'10px', color:t.text, fontSize:'15px' }}/>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                    <button type="button" onClick={() => setShowForm(false)} style={{ padding:'10px 20px', borderRadius:'10px', border:`1px solid ${t.border}`, backgroundColor:'transparent', color:t.textSub, cursor:'pointer', fontSize:'14px' }}>Cancel</button>
                    <button type="submit" disabled={saving} style={{ padding:'10px 24px', borderRadius:'10px', backgroundColor:t.accent, border:'none', color:'#fff', cursor: saving?'not-allowed':'pointer', fontSize:'14px', fontWeight:'600', opacity: saving?0.7:1 }}>
                      {saving ? 'Saving…' : 'Save Entry'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Stat cards */}
            <div className="stat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
              {statCards.map(c => <StatCard key={c.label} {...c} t={t}/>)}
            </div>

            {/* Chart */}
            <div style={{ backgroundColor:t.surface, border:`1px solid ${t.border}`, borderRadius:'16px', padding:'24px', boxShadow:t.cardShadow }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
                <div>
                  <h2 style={{ fontSize:'16px', fontWeight:'700', color:t.text }}>Weekly Overview</h2>
                  <p style={{ fontSize:'13px', color:t.textSub, marginTop:'2px' }}>Last 7 days</p>
                </div>
                <div style={{ display:'flex', gap:'4px', backgroundColor:t.bg, padding:'4px', borderRadius:'10px', border:`1px solid ${t.border}` }}>
                  {['steps','calories'].map(tab => (
                    <button key={tab} onClick={() => setActiveChart(tab)} style={{ padding:'6px 14px', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'500', backgroundColor: activeChart===tab ? t.surface : 'transparent', color: activeChart===tab ? t.text : t.textSub, boxShadow: activeChart===tab ? t.cardShadow : 'none', transition:'all 0.15s', textTransform:'capitalize' }}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {hasData ? (
                <>
                  {activeChart === 'steps' && (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} vertical={false}/>
                        <XAxis dataKey="date" stroke="none" tick={{ fill:t.textSub, fontSize:12 }}/>
                        <YAxis stroke="none" tick={{ fill:t.textSub, fontSize:12 }}/>
                        <Tooltip content={<CustomTooltip unit="steps" color={t.accent} t={t}/>}/>
                        <Line type="monotone" dataKey="steps" stroke={t.accent} strokeWidth={2.5} dot={{ fill:t.accent, r:4, strokeWidth:0 }} activeDot={{ r:6, strokeWidth:0 }}/>
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  {activeChart === 'calories' && (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} vertical={false}/>
                        <XAxis dataKey="date" stroke="none" tick={{ fill:t.textSub, fontSize:12 }}/>
                        <YAxis stroke="none" tick={{ fill:t.textSub, fontSize:12 }}/>
                        <Tooltip content={<CustomTooltip unit="kcal" color="#f97316" t={t}/>}/>
                        <Bar dataKey="calories" fill="#f97316" radius={[6,6,0,0]} maxBarSize={40}/>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </>
              ) : (
                <div style={{ height:'220px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px', border:`1px dashed ${t.border}`, borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px' }}>📊</div>
                  <p style={{ color:t.textSub, fontSize:'14px', fontWeight:'500' }}>No chart data yet</p>
                  <p style={{ color:t.textMuted, fontSize:'13px' }}>Log your first entry using the "Log Today" button</p>
                </div>
              )}
            </div>

            {/* Goals */}
            {today && (
              <div style={{ marginTop:'20px', backgroundColor:t.surface, border:`1px solid ${t.border}`, borderRadius:'16px', padding:'24px', boxShadow:t.cardShadow }}>
                <h2 style={{ fontSize:'16px', fontWeight:'700', color:t.text, marginBottom:'20px' }}>Today's Goals</h2>
                {[
                  { label:'Steps',    value:today.steps,        max:10000, color:t.accent,  unit:'steps' },
                  { label:'Calories', value:today.calories,     max:2500,  color:'#f97316', unit:'kcal'  },
                  { label:'Sleep',    value:today.sleep_hours,  max:9,     color:'#8b5cf6', unit:'hrs'   },
                  { label:'Water',    value:today.water_litres, max:3,     color:'#06b6d4', unit:'L'     },
                ].map(g => {
                  const pct = Math.min((g.value/g.max)*100, 100);
                  return (
                    <div key={g.label} style={{ marginBottom:'16px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                        <span style={{ fontSize:'13px', fontWeight:'500', color:t.textSub }}>{g.label}</span>
                        <span style={{ fontSize:'13px', fontWeight:'600', color:t.text }}>
                          {g.value} <span style={{ color:t.textMuted, fontWeight:'400' }}>/ {g.max} {g.unit}</span>
                        </span>
                      </div>
                      <div style={{ height:'6px', backgroundColor:t.bg, borderRadius:'99px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, backgroundColor:g.color, borderRadius:'99px', transition:'width 0.8s ease' }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Insights */}
            <InsightsCard t={t} navigate={navigate}/>

            <div style={{ height:'32px' }}/>
          </div>
        </main>
      </div>
    </div>
  );
}