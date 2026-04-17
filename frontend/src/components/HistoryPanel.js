import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VERDICT_COLOR = {
  FAIR: 'var(--green)',
  INFLATED: 'var(--yellow)',
  SEVERELY_OVERCHARGED: 'var(--red)',
};

function fmt(n) { return `$${Number(n || 0).toFixed(2)}`; }

export default function HistoryPanel() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/v1/history/'),
      axios.get('/api/v1/history/stats'),
    ]).then(([h, s]) => {
      setRows(h.data.results || []);
      setStats(s.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)', padding: 24 }}>
      LOADING...
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Stats row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { label: 'TOTAL ANALYSES', value: stats.total_analyses },
            { label: 'OVERCHARGED', value: stats.overcharged_count },
            { label: 'AVG OVERCHARGE', value: `${stats.avg_overcharge_percent}%` },
            { label: 'DETECTION RATE', value: `${stats.detection_rate}%` },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '12px 16px',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.1em' }}>
            ANALYSIS HISTORY
          </span>
        </div>
        {rows.length === 0 ? (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)', padding: '32px 16px', textAlign: 'center' }}>
            NO ANALYSES YET
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
            <thead>
              <tr style={{ background: 'var(--bg-2)' }}>
                {['TIMESTAMP', 'ID', 'VERDICT', 'CHARGED', 'OVERCHARGE', 'VEHICLE'].map(h => (
                  <th key={h} style={{
                    padding: '8px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: 10,
                    color: 'var(--text-3)',
                    letterSpacing: '0.08em',
                    borderBottom: '1px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} style={{
                  borderBottom: '1px solid var(--border)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg-2)',
                }}>
                  <td style={{ padding: '8px 14px', color: 'var(--text-3)' }}>
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 14px', color: 'var(--text-3)' }}>
                    {row.id.slice(0, 8)}
                  </td>
                  <td style={{ padding: '8px 14px', color: VERDICT_COLOR[row.verdict] || 'var(--text)', letterSpacing: '0.05em' }}>
                    {row.verdict}
                  </td>
                  <td style={{ padding: '8px 14px', color: 'var(--text)' }}>{fmt(row.total_charged)}</td>
                  <td style={{ padding: '8px 14px', color: row.overcharge_amount > 0 ? 'var(--red)' : 'var(--green)' }}>
                    {fmt(row.overcharge_amount)}
                  </td>
                  <td style={{ padding: '8px 14px', color: 'var(--text-3)', textTransform: 'uppercase' }}>
                    {row.vehicle_type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
