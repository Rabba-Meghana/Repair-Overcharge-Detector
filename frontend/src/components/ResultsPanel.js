import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const VERDICT_META = {
  FAIR: { color: 'var(--green)', bg: 'var(--green-dim)', border: 'rgba(0,208,132,0.2)', label: 'FAIR' },
  INFLATED: { color: 'var(--yellow)', bg: 'var(--yellow-dim)', border: 'rgba(245,166,35,0.2)', label: 'INFLATED' },
  SEVERELY_OVERCHARGED: { color: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(255,68,68,0.2)', label: 'SEVERELY OVERCHARGED' },
};

const STATUS_COLOR = {
  FAIR: 'var(--green)',
  SLIGHTLY_HIGH: 'var(--orange)',
  OVERPRICED: 'var(--yellow)',
  SEVERELY_OVERPRICED: 'var(--red)',
};

function fmt(n) { return `$${Number(n || 0).toFixed(2)}`; }
function pct(n) { return `${Number(n || 0).toFixed(1)}%`; }

export default function ResultsPanel({ results }) {
  const [showModels, setShowModels] = useState(false);
  const meta = VERDICT_META[results.verdict] || VERDICT_META.FAIR;

  const chartData = (results.line_items || []).map(item => ({
    name: item.description.length > 22 ? item.description.slice(0, 22) + '…' : item.description,
    Charged: item.charged,
    'Fair Avg': item.fair_avg,
    status: item.status,
  }));

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Verdict bar */}
      <div style={{
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto auto',
        alignItems: 'center',
        gap: 24,
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: meta.color, letterSpacing: '0.1em' }}>
          {meta.label}
        </div>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)' }}>
          {results.summary}
        </div>

        <Stat label="CHARGED" value={fmt(results.total_charged)} color="var(--text)" />
        <Stat label="FAIR VALUE" value={fmt(results.total_fair)} color="var(--green)" />
        <Stat label="OVERCHARGE" value={fmt(results.overcharge_amount)} sub={pct(results.overcharge_percent)} color={meta.color} />
      </div>

      {/* Consensus + model info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: 8,
      }}>
        <MetaCard label="CONSENSUS" value={results.consensus ? 'AGREEMENT' : 'DIVERGENT'} color={results.consensus ? 'var(--green)' : 'var(--yellow)'} />
        <MetaCard label="CONFIDENCE" value={pct((results.confidence || 0) * 100)} color="var(--blue)" />
        <MetaCard label="MODELS RUN" value={results.model_results?.length || 1} color="var(--text-2)" />
        <MetaCard label="CACHED" value={results.cached ? 'YES' : 'NO'} color="var(--text-3)" />
      </div>

      {/* Chart + line items grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Bar chart */}
        <div style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '16px',
        }}>
          <SectionLabel>CHARGED VS FAIR MARKET</SectionLabel>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                angle={-40}
                textAnchor="end"
                interval={0}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                tickFormatter={v => `$${v}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-2)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'IBM Plex Mono',
                  fontSize: 11,
                }}
                labelStyle={{ color: 'var(--text)', marginBottom: 4 }}
                formatter={(val, name) => [`$${Number(val).toFixed(2)}`, name]}
              />
              <Bar dataKey="Charged" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLOR[entry.status] || 'var(--text-3)'} fillOpacity={0.85} />
                ))}
              </Bar>
              <Bar dataKey="Fair Avg" fill="var(--bg-3)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line items */}
        <div style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '16px',
          overflow: 'auto',
          maxHeight: 300,
        }}>
          <SectionLabel>LINE-BY-LINE BREAKDOWN</SectionLabel>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
            <thead>
              <tr>
                {['SERVICE', 'CHARGED', 'FAIR AVG', 'DELTA', 'STATUS'].map(h => (
                  <th key={h} style={{
                    textAlign: h === 'SERVICE' ? 'left' : 'right',
                    padding: '4px 8px',
                    color: 'var(--text-3)',
                    fontWeight: 600,
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: 8,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(results.line_items || []).map((item, i) => {
                const c = STATUS_COLOR[item.status] || 'var(--text-3)';
                const delta = item.charged - item.fair_avg;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '7px 8px', color: 'var(--text-2)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.description}
                    </td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', color: 'var(--text)' }}>{fmt(item.charged)}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', color: 'var(--text-3)' }}>{fmt(item.fair_avg)}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', color: delta > 0 ? 'var(--red)' : 'var(--green)' }}>
                      {delta > 0 ? '+' : ''}{fmt(delta)}
                    </td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', color: c, fontSize: 9, letterSpacing: '0.05em' }}>
                      {item.status.replace(/_/g, ' ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      {results.recommendations?.length > 0 && (
        <div style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '16px',
        }}>
          <SectionLabel>RECOMMENDATIONS</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {results.recommendations.map((rec, i) => (
              <div key={i} style={{
                padding: '8px 12px',
                background: 'var(--bg-2)',
                borderRadius: 'var(--radius)',
                borderLeft: '2px solid var(--blue)',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--text-2)',
                lineHeight: 1.6,
              }}>
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model details toggle */}
      <div style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}>
        <button
          onClick={() => setShowModels(!showModels)}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <SectionLabel style={{ margin: 0 }}>MODEL RESULTS ({results.model_results?.length || 0} models)</SectionLabel>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)' }}>
            {showModels ? 'COLLAPSE' : 'EXPAND'}
          </span>
        </button>
        {showModels && (
          <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(results.model_results || []).map((m, i) => (
              <div key={i} style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '12px',
                fontFamily: 'var(--mono)',
                fontSize: 11,
              }}>
                <div style={{ color: 'var(--blue)', marginBottom: 8, fontSize: 10, letterSpacing: '0.05em' }}>{m.model}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <KV k="verdict" v={m.verdict} color={VERDICT_META[m.verdict]?.color} />
                  <KV k="confidence" v={pct((m.confidence || 0) * 100)} />
                  <KV k="total charged" v={fmt(m.total_charged)} />
                  <KV k="fair value" v={fmt(m.total_fair)} />
                  <KV k="overcharge" v={fmt(m.overcharge_amount)} />
                  <KV k="latency" v={`${m.latency_ms}ms`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis ID + export */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'var(--mono)',
        fontSize: 10,
        color: 'var(--text-3)',
        padding: '4px 0',
      }}>
        <span>ID: {results.id}</span>
        <a
          href={`/api/v1/reports/${results.id}/export`}
          download
          style={{ color: 'var(--blue)', textDecoration: 'none', letterSpacing: '0.05em' }}
        >
          EXPORT JSON
        </a>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, color }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 600, color: color || 'var(--text)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)' }}>{sub}</div>}
    </div>
  );
}

function MetaCard({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '10px 14px',
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: color || 'var(--text)' }}>{value}</div>
    </div>
  );
}

function SectionLabel({ children, style }) {
  return (
    <div style={{
      fontFamily: 'var(--mono)',
      fontSize: 10,
      fontWeight: 600,
      color: 'var(--text-3)',
      letterSpacing: '0.1em',
      marginBottom: 12,
      ...style,
    }}>{children}</div>
  );
}

function KV({ k, v, color }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{k}</div>
      <div style={{ color: color || 'var(--text-2)', marginTop: 1 }}>{v}</div>
    </div>
  );
}
