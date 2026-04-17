import React from 'react';

const stats = [
  { label: 'Repairs Analyzed', value: '37B+' },
  { label: 'Avg Overcharge Rate', value: '68%' },
  { label: 'Detection Accuracy', value: '85%' },
];

function Header({ theme, toggleTheme }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        gap: '1rem',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
          }}>🔍</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Repair Overcharge Detector
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Powered by LLaMA 3.3 70B</div>
          </div>
        </div>

        {/* Live Stats */}
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {stats.map(stat => (
            <div key={stat.label} style={{ textAlign: 'center', display: window.innerWidth < 600 ? 'none' : 'block' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.4rem 0.75rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'} {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>
    </header>
  );
}

export default Header;
