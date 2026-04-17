import React, { useEffect, useState } from 'react';
import axios from 'axios';

function fmt(n) { return `$${Number(n).toFixed(0)}`; }

export default function BenchmarkPanel() {
  const [data, setData] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/v1/benchmarks/')
      .then(r => setData(r.data.by_category || {}))
      .finally(() => setLoading(false));
  }, []);

  const filtered = Object.entries(data).reduce((acc, [cat, items]) => {
    const matched = items.filter(i =>
      i.repair.toLowerCase().includes(search.toLowerCase())
    );
    if (matched.length) acc[cat] = matched;
    return acc;
  }, {});

  if (loading) return (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)', padding: 24 }}>LOADING...</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.1em' }}>
          BENCHMARK RATES — US NATIONAL AVERAGES
        </div>
        <input
          type="text"
          placeholder="filter..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '6px 10px',
            color: 'var(--text)',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            outline: 'none',
            width: 200,
          }}
        />
      </div>

      {Object.entries(filtered).map(([cat, items]) => (
        <div key={cat} style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 16px',
            background: 'var(--bg-2)',
            borderBottom: '1px solid var(--border)',
            fontFamily: 'var(--mono)',
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--text-2)',
            letterSpacing: '0.08em',
          }}>{cat.toUpperCase()}</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
            <thead>
              <tr>
                {['REPAIR', 'MIN', 'AVG', 'MAX', 'UNIT'].map(h => (
                  <th key={h} style={{
                    padding: '6px 14px',
                    textAlign: h === 'REPAIR' ? 'left' : 'right',
                    fontWeight: 600, fontSize: 10,
                    color: 'var(--text-3)',
                    letterSpacing: '0.06em',
                    borderBottom: '1px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.repair} style={{
                  borderBottom: '1px solid var(--border)',
                  background: i % 2 ? 'var(--bg-2)' : 'transparent',
                }}>
                  <td style={{ padding: '7px 14px', color: 'var(--text-2)', textTransform: 'capitalize' }}>{item.repair}</td>
                  <td style={{ padding: '7px 14px', textAlign: 'right', color: 'var(--green)' }}>{fmt(item.min_price)}</td>
                  <td style={{ padding: '7px 14px', textAlign: 'right', color: 'var(--blue)', fontWeight: 600 }}>{fmt(item.avg_price)}</td>
                  <td style={{ padding: '7px 14px', textAlign: 'right', color: 'var(--yellow)' }}>{fmt(item.max_price)}</td>
                  <td style={{ padding: '7px 14px', textAlign: 'right', color: 'var(--text-3)', fontSize: 10 }}>{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
