import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_CONFIG = {
  FAIR: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '✅' },
  SLIGHTLY_HIGH: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: '⚠️' },
  OVERPRICED: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '🔴' },
  SEVERELY_OVERPRICED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '🚨' },
};

const VERDICT_CONFIG = {
  FAIR: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)', label: '✅ Fair Pricing', sub: 'This invoice appears to be within normal market rates.' },
  INFLATED: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', label: '⚠️ Inflated Pricing', sub: 'You may be paying more than fair market rates.' },
  SEVERELY_OVERCHARGED: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', label: '🚨 Severe Overcharge', sub: 'This invoice contains significant overcharging.' },
};

function fmt(n) {
  return typeof n === 'number' ? `$${n.toFixed(2)}` : '$0.00';
}

function ResultsDashboard({ results }) {
  const verdict = VERDICT_CONFIG[results.verdict] || VERDICT_CONFIG.FAIR;

  const chartData = results.line_items?.slice(0, 8).map(item => ({
    name: item.description?.length > 18 ? item.description.slice(0, 18) + '…' : item.description,
    'Charged': item.charged,
    'Fair Average': item.fair_avg,
  })) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Verdict Card */}
      <div style={{
        background: verdict.bg,
        border: `2px solid ${verdict.border}`,
        borderRadius: 'var(--radius)',
        padding: '1.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: verdict.color }}>{verdict.label}</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{verdict.sub}</div>
            <div style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px' }}>
              {results.summary}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Overcharge Amount</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: verdict.color }}>{fmt(results.overcharge_amount)}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>({results.overcharge_percent?.toFixed(1)}% above fair)</div>
          </div>
        </div>

        {/* Summary Numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.25rem' }}>
          {[
            { label: 'Total Charged', value: fmt(results.total_charged), color: verdict.color },
            { label: 'Fair Market Value', value: fmt(results.total_fair), color: '#10b981' },
            { label: 'AI Confidence', value: `${((results.confidence || 0) * 100).toFixed(0)}%`, color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.875rem',
              textAlign: 'center',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '1rem' }}>📊 Charged vs Fair Market Rate</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                labelStyle={{ color: 'var(--text-primary)' }}
                formatter={(v) => [`$${v.toFixed(2)}`, '']}
              />
              <Legend />
              <Bar dataKey="Charged" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Fair Average" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Line Items */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ fontWeight: 600, marginBottom: '1rem' }}>🔎 Line-by-Line Analysis</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {results.line_items?.map((item, i) => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.FAIR;
            return (
              <div key={i} style={{
                background: cfg.bg,
                border: `1px solid ${cfg.color}40`,
                borderRadius: 'var(--radius-sm)',
                padding: '0.875rem',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '0.5rem',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem' }}>{cfg.icon}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.description}</span>
                    <span style={{
                      background: cfg.bg,
                      color: cfg.color,
                      border: `1px solid ${cfg.color}50`,
                      borderRadius: '999px',
                      padding: '0.1rem 0.6rem',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}>{item.status?.replace(/_/g, ' ')}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{item.notes}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Fair range: {fmt(item.fair_min)} – {fmt(item.fair_max)} (avg {fmt(item.fair_avg)})
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: cfg.color }}>{fmt(item.charged)}</div>
                  {item.charged > item.fair_avg && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{fmt(item.charged - item.fair_avg)} over avg</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {results.recommendations?.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>💡 Recommendations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {results.recommendations.map((rec, i) => (
              <div key={i} style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                padding: '0.6rem 0.875rem',
                background: 'rgba(59,130,246,0.08)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(59,130,246,0.2)',
              }}>
                <span style={{ color: '#3b82f6', flexShrink: 0 }}>→</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsDashboard;
