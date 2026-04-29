// frontend/src/pages/History.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFitnessHistory, updateFitnessEntry, deleteFitnessEntry } from '../services/api';

const THEMES = {
  dark:  { bg: '#0d0d0f', surface: '#17171a', border: '#2a2a30', text: '#f0f0f4', textSub: '#8888a0', accent: '#6366f1', danger: '#ef4444', success: '#22c55e', cardShadow: '0 1px 3px rgba(0,0,0,0.4)' },
  light: { bg: '#f4f4f8', surface: '#ffffff',  border: '#e4e4ec', text: '#111118', textSub: '#6b6b80', accent: '#4f46e5', danger: '#dc2626', success: '#16a34a', cardShadow: '0 1px 3px rgba(0,0,0,0.08)' },
};

export default function History() {
  const navigate = useNavigate();
  const theme = localStorage.getItem('vyvra_theme') || 'dark';
  const t = THEMES[theme];

  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editId,   setEditId]   = useState(null);
  const [editData, setEditData] = useState({});
  const [toast,    setToast]    = useState(null);

  useEffect(() => { loadHistory(); }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const loadHistory = async () => {
    try {
      const res = await getFitnessHistory();
      setEntries(res.data.entries);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (entry) => {
    setEditId(entry.id);
    setEditData({
      steps:        entry.steps,
      calories:     entry.calories,
      sleep_hours:  entry.sleep_hours,
      water_litres: entry.water_litres,
    });
  };

  const saveEdit = async (id) => {
    try {
      await updateFitnessEntry(id, {
        steps:        parseInt(editData.steps)        || 0,
        calories:     parseInt(editData.calories)     || 0,
        sleep_hours:  parseFloat(editData.sleep_hours)  || 0,
        water_litres: parseFloat(editData.water_litres) || 0,
      });
      setToast({ msg: 'Entry updated!', type: 'success' });
      setEditId(null);
      loadHistory();
    } catch {
      setToast({ msg: 'Update failed.', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    try {
      await deleteFitnessEntry(id);
      setToast({ msg: 'Entry deleted.', type: 'success' });
      loadHistory();
    } catch {
      setToast({ msg: 'Delete failed.', type: 'error' });
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
      <p style={{ color: t.textSub }}>Loading history…</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", padding: '24px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;} input:focus{outline:none;border-color:${t.accent}!important;}`}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, backgroundColor: toast.type === 'success' ? t.success : t.danger, color: '#fff', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '500' }}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: t.text, letterSpacing: '-0.02em' }}>Entry History</h1>
            <p style={{ color: t.textSub, fontSize: '14px', marginTop: '4px' }}>Last 30 days of logged data</p>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 18px', borderRadius: '10px', border: `1px solid ${t.border}`, backgroundColor: 'transparent', color: t.textSub, cursor: 'pointer', fontSize: '14px' }}>
            ← Dashboard
          </button>
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: t.surface, borderRadius: '16px', border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
            <p style={{ color: t.textSub, fontSize: '16px' }}>No entries yet</p>
            <p style={{ color: t.textSub, fontSize: '14px', marginTop: '4px' }}>Log your first entry from the dashboard</p>
          </div>
        )}

        {/* Entry list */}
        {entries.map(entry => (
          <div key={entry.id} style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: '14px', padding: '20px', marginBottom: '12px', boxShadow: t.cardShadow }}>

            {editId === entry.id ? (
              /* ── Edit mode ── */
              <div>
                <p style={{ color: t.textSub, fontSize: '13px', marginBottom: '14px', fontWeight: '500' }}>
                  Editing: {new Date(entry.entry_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  {[
                    { key: 'steps',        label: '👟 Steps',          step: '1'   },
                    { key: 'calories',     label: '🔥 Calories',       step: '1'   },
                    { key: 'sleep_hours',  label: '😴 Sleep (hrs)',    step: '0.5' },
                    { key: 'water_litres', label: '💧 Water (L)',      step: '0.1' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: '12px', color: t.textSub, display: 'block', marginBottom: '4px' }}>{f.label}</label>
                      <input
                        type="number" value={editData[f.key]} step={f.step}
                        onChange={e => setEditData({ ...editData, [f.key]: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', backgroundColor: t.bg, border: `1px solid ${t.border}`, borderRadius: '8px', color: t.text, fontSize: '14px' }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => saveEdit(entry.id)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: t.accent, color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Save</button>
                  <button onClick={() => setEditId(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: `1px solid ${t.border}`, backgroundColor: 'transparent', color: t.textSub, cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: t.text, marginBottom: '8px' }}>
                    {new Date(entry.entry_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {[
                      { emoji: '👟', value: entry.steps.toLocaleString(),        label: 'steps'  },
                      { emoji: '🔥', value: `${entry.calories} kcal`,            label: ''       },
                      { emoji: '😴', value: `${entry.sleep_hours} hrs`,          label: ''       },
                      { emoji: '💧', value: `${entry.water_litres} L`,           label: ''       },
                    ].map((item, i) => (
                      <span key={i} style={{ fontSize: '13px', color: t.textSub }}>
                        {item.emoji} <span style={{ color: t.text, fontWeight: '500' }}>{item.value}</span> {item.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startEdit(entry)} style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${t.border}`, backgroundColor: 'transparent', color: t.textSub, cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                  <button onClick={() => handleDelete(entry.id)} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#ef444420', color: t.danger, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}