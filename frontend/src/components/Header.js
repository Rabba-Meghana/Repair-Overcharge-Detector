import React from 'react';

const TABS = [
  { id: 'analyze', label: 'Analysis' },
  { id: 'history', label: 'History' },
  { id: 'benchmarks', label: 'Benchmarks' },
];

export default function Header({ tab, setTab }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      marginBottom: 32,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: 52,
        gap: 32,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: 'var(--green)',
            boxShadow: '0 0 8px var(--green)',
          }} />
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text)',
            letterSpacing: '0.08em',
          }}>ROD</span>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--text-3)',
            letterSpacing: '0.05em',
          }}>v2.0</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--border-2)' }} />

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: 2 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--sans)',
                fontSize: 13,
                fontWeight: tab === t.id ? 500 : 400,
                color: tab === t.id ? 'var(--text)' : 'var(--text-3)',
                background: tab === t.id ? 'var(--bg-3)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.01em',
              }}
            >{t.label}</button>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Status */}
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--text-3)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span>MULTI-MODEL CONSENSUS</span>
          <span style={{ color: 'var(--border-2)' }}>|</span>
          <span>LLaMA-3.3-70B + Mixtral-8x7B</span>
        </div>
      </div>
    </header>
  );
}
