// frontend/src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFitnessInsights } from '../services/api';

const THEMES = {
  dark:  { bg: '#0d0d0f', surface: '#17171a', border: '#2a2a30', text: '#f0f0f4', textSub: '#8888a0', textMuted: '#44444e', accent: '#6366f1', accentBg: '#1e1e3a', cardShadow: '0 1px 3px rgba(0,0,0,0.4)' },
  light: { bg: '#f4f4f8', surface: '#ffffff',  border: '#e4e4ec', text: '#111118', textSub: '#6b6b80', textMuted: '#b0b0c0', accent: '#4f46e5', accentBg: '#eff0ff', cardShadow: '0 1px 3px rgba(0,0,0,0.08)' },
};

export default function Profile() {
  const navigate  = useNavigate();
  const theme     = localStorage.getItem('vyvra_theme') || 'dark';
  const t         = THEMES[theme];
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    getFitnessInsights()
      .then(res => setInsights(res.data))
      .catch(() => {});
  }, []);

  const stats = insights?.averages;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", padding: '24px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;}`}</style>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Back button */}
        <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '24px', padding: '8px 18px', borderRadius: '10px', border: `1px solid ${t.border}`, backgroundColor: 'transparent', color: t.textSub, cursor: 'pointer', fontSize: '14px' }}>
          ← Dashboard
        </button>

        {/* Avatar + name */}
        <div style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: '20px', padding: '32px', textAlign: 'center', marginBottom: '16px', boxShadow: t.cardShadow }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: t.accentBg, color: t.accent, fontSize: '28px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: t.text, marginBottom: '4px' }}>{user.username}</h1>
          <p style={{ color: t.textSub, fontSize: '14px', marginBottom: '4px' }}>{user.email}</p>
          <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '99px', backgroundColor: t.accentBg, color: t.accent, fontSize: '12px', fontWeight: '600', marginTop: '8px' }}>
            Free Plan
          </span>
        </div>

        {/* Stats summary */}
        {insights?.has_data && stats && (
          <div style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: t.cardShadow }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: t.text, marginBottom: '20px' }}>Your 30-day averages</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { emoji: '👟', label: 'Avg steps/day',    value: stats.steps.toLocaleString()        },
                { emoji: '🔥', label: 'Avg calories/day', value: `${stats.calories} kcal`             },
                { emoji: '😴', label: 'Avg sleep/night',  value: `${stats.sleep_hours} hrs`           },
                { emoji: '💧', label: 'Avg water/day',    value: `${stats.water_litres} L`            },
              ].map((s, i) => (
                <div key={i} style={{ backgroundColor: t.bg, borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '20px', marginBottom: '6px' }}>{s.emoji}</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: t.text, marginBottom: '2px' }}>{s.value}</p>
                  <p style={{ fontSize: '12px', color: t.textSub }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account info */}
        <div style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: t.cardShadow }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: t.text, marginBottom: '16px' }}>Account details</h2>
          {[
            { label: 'Username',   value: user.username },
            { label: 'Email',      value: user.email    },
            { label: 'User ID',    value: `#${user.id}` },
            { label: 'Plan',       value: 'Free'        },
            { label: 'Entries logged', value: insights?.total_entries ?? '—' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 4 ? `1px solid ${t.border}` : 'none' }}>
              <span style={{ fontSize: '14px', color: t.textSub }}>{row.label}</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: t.text }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}
          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ef444440', backgroundColor: '#ef444410', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
          Log Out
        </button>
      </div>
    </div>
  );
}