import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const VEHICLE_TYPES = [
  { value: 'standard', label: '🚗 Standard' },
  { value: 'luxury', label: '💎 Luxury' },
  { value: 'commercial', label: '🚚 Commercial' },
  { value: 'fleet', label: '🚌 Fleet' },
  { value: 'heavy_duty', label: '🏗️ Heavy Duty' },
  { value: 'electric', label: '⚡ Electric' },
];

function WorkOrderInput({ setResults, loading, setLoading }) {
  const [workOrder, setWorkOrder] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [vehicleType, setVehicleType] = useState('standard');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e) => setWorkOrder(e.detail);
    window.addEventListener('loadSample', handler);
    return () => window.removeEventListener('loadSample', handler);
  }, []);

  const analyze = async () => {
    if (!workOrder.trim()) { setError('Please enter a work order.'); return; }
    if (!apiKey.trim()) { setError('Please enter your Groq API key.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/analyze`, {
        work_order: workOrder,
        api_key: apiKey,
        vehicle_type: vehicleType,
      });
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Check your API key and backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>🧾</span>
        <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>Paste Your Work Order</span>
      </div>

      <textarea
        value={workOrder}
        onChange={e => setWorkOrder(e.target.value)}
        placeholder="Paste your auto repair invoice or work order here...&#10;&#10;Include: service names, parts, labor charges, fees, and totals."
        rows={10}
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          resize: 'vertical',
          outline: 'none',
          lineHeight: 1.6,
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* API Key */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
            🔑 Groq API Key <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', fontSize: '0.75rem' }}>Get free key →</a>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="gsk_..."
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 2.5rem 0.6rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer',
              }}
            >{showKey ? '🙈' : '👁️'}</button>
          </div>
        </div>

        {/* Vehicle Type */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
            🚘 Vehicle Type
          </label>
          <select
            value={vehicleType}
            onChange={e => setVehicleType(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem 0.75rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {VEHICLE_TYPES.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          color: '#ef4444',
          fontSize: '0.875rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={analyze}
        disabled={loading}
        className="btn-primary"
        style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem' }}
      >
        {loading ? (
          <><div className="spinner" /> Analyzing with AI...</>
        ) : (
          <><span>🔍</span> Detect Overcharges</>
        )}
      </button>
    </div>
  );
}

export default WorkOrderInput;
