import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function BenchmarkTable() {
  const [data, setData] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/benchmarks`)
      .then(r => setData(r.data.benchmarks || {}))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  const filtered = Object.entries(data).filter(([k]) =>
    k.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
      Loading benchmark data...
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>📊 Market Rate Benchmark Database</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{Object.keys(data).length} repairs · US national averages</div>
        </div>
        <input
          type="text"
          placeholder="🔍 Search repairs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.875rem',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            width: '220px',
          }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              {['Repair / Service', 'Min', 'Average', 'Max', 'Unit'].map(h => (
                <th key={h} style={{
                  padding: '0.6rem 0.875rem',
                  textAlign: h === 'Repair / Service' ? 'left' : 'right',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(([key, val], i) => (
              <tr key={key} style={{
                borderBottom: '1px solid var(--border)',
                background: i % 2 === 0 ? 'transparent' : 'var(--bg-hover)',
                transition: 'background 0.15s',
              }}>
                <td style={{ padding: '0.6rem 0.875rem', color: 'var(--text-primary)', textTransform: 'capitalize', fontWeight: 500 }}>
                  {key}
                </td>
                <td style={{ padding: '0.6rem 0.875rem', textAlign: 'right', color: '#10b981' }}>${val.min}</td>
                <td style={{ padding: '0.6rem 0.875rem', textAlign: 'right', color: 'var(--accent-blue)', fontWeight: 600 }}>${val.avg}</td>
                <td style={{ padding: '0.6rem 0.875rem', textAlign: 'right', color: '#f59e0b' }}>${val.max}</td>
                <td style={{ padding: '0.6rem 0.875rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{val.unit}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No repairs found for "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BenchmarkTable;
