import React, { useState } from 'react';
import axios from 'axios';

const SAMPLES = {
  fair: `AUTO SERVICE CENTER
Work Order #2024-1891 | 2019 Honda Civic | 52,340 mi

Synthetic oil change (5W-30)      $89.99
Tire rotation                     $29.99
Engine air filter                 $39.99
Labor (1.5 hrs @ $85/hr)         $127.50
Shop supplies                     $8.50
Tax (8%)                          $23.67

TOTAL                             $319.64`,

  inflated: `QUICK LUBE & MORE
Invoice #8834 | 2019 Honda Civic | 52,340 mi

Synthetic oil change              $149.99
Tire rotation                     $79.99
Engine air filter                 $89.99
Cabin air filter                  $119.99
BG Fuel System Service            $189.99
Labor                             $185.00
Environmental fee                 $45.00
Shop supplies                     $35.00

TOTAL                             $895.95`,

  severe: `ELITE AUTO CARE
Work Order #445521 | 2018 Toyota Camry | 67,210 mi

Brake pad replacement (front)     $689.00
Brake rotor resurfacing           $450.00
Brake fluid flush                 $299.00
Four-wheel alignment              $329.00
Wheel balance (4)                 $249.00
Cabin filter                      $189.00
Engine filter                     $159.00
Diagnostic fee                    $195.00
Labor (4.5 hrs @ $185/hr)        $832.50
Shop consumables                  $89.00

TOTAL                             $3,481.50`,
};

const VEHICLE_TYPES = [
  ['standard', 'Standard'],
  ['luxury', 'Luxury'],
  ['commercial', 'Commercial'],
  ['fleet', 'Fleet'],
  ['heavy_duty', 'Heavy Duty'],
  ['electric', 'Electric'],
];

export default function InputPanel({ apiKey, setApiKey, setResults, loading, setLoading }) {
  const [workOrder, setWorkOrder] = useState('');
  const [vehicleType, setVehicleType] = useState('standard');
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!workOrder.trim()) { setError('Work order required.'); return; }
    if (!apiKey.trim()) { setError('Groq API key required.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/v1/analysis/', {
        work_order: workOrder,
        vehicle_type: vehicleType,
      }, {
        headers: { 'X-API-Key': apiKey },
      });
      setResults(data);
    } catch (e) {
      setError(e.response?.data?.detail || e.response?.data?.error || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 24 }}>

      {/* Left: work order */}
      <div>
        <Label>WORK ORDER</Label>
        <textarea
          value={workOrder}
          onChange={e => setWorkOrder(e.target.value)}
          placeholder="Paste repair invoice text here..."
          rows={14}
          style={{
            width: '100%',
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
            color: 'var(--text)',
            fontFamily: 'var(--mono)',
            fontSize: 12.5,
            resize: 'vertical',
            outline: 'none',
            lineHeight: 1.7,
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--border-2)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        {/* Sample loaders */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', alignSelf: 'center' }}>LOAD SAMPLE:</span>
          {Object.entries(SAMPLES).map(([key, text]) => (
            <button
              key={key}
              onClick={() => setWorkOrder(text)}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '3px 10px',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--text-3)',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.color = 'var(--text)'; e.target.style.borderColor = 'var(--border-2)'; }}
              onMouseLeave={e => { e.target.style.color = 'var(--text-3)'; e.target.style.borderColor = 'var(--border)'; }}
            >{key}</button>
          ))}
        </div>
      </div>

      {/* Right: config */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div>
          <Label>GROQ API KEY</Label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="gsk_..."
            style={inputStyle}
          />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
            console.groq.com/keys
          </div>
        </div>

        <div>
          <Label>VEHICLE CLASS</Label>
          <select
            value={vehicleType}
            onChange={e => setVehicleType(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {VEHICLE_TYPES.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '12px 14px',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--text-3)',
          lineHeight: 1.8,
          flex: 1,
        }}>
          <div style={{ color: 'var(--text-2)', marginBottom: 6, fontWeight: 500 }}>ENGINE</div>
          <div>LLaMA-3.3-70B-Versatile</div>
          <div>Mixtral-8x7B-32768</div>
          <div style={{ marginTop: 8, color: 'var(--text-2)', fontWeight: 500 }}>MODE</div>
          <div>Parallel consensus</div>
          <div>Cross-model validation</div>
          <div style={{ marginTop: 8, color: 'var(--text-2)', fontWeight: 500 }}>BENCHMARK DB</div>
          <div>29 repair types</div>
          <div>US national averages</div>
        </div>

        {error && (
          <div style={{
            background: 'var(--red-dim)',
            border: '1px solid rgba(255,68,68,0.25)',
            borderRadius: 'var(--radius)',
            padding: '10px 12px',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: 'var(--red)',
          }}>{error}</div>
        )}

        <button
          onClick={analyze}
          disabled={loading}
          style={{
            background: loading ? 'var(--bg-3)' : 'var(--blue)',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '11px 0',
            color: loading ? 'var(--text-3)' : '#fff',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.15s',
          }}
        >
          {loading ? (
            <><div className="spinner" /> ANALYZING...</>
          ) : 'RUN ANALYSIS'}
        </button>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{
      fontFamily: 'var(--mono)',
      fontSize: 10,
      fontWeight: 600,
      color: 'var(--text-3)',
      letterSpacing: '0.1em',
      marginBottom: 6,
    }}>{children}</div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg-1)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '9px 12px',
  color: 'var(--text)',
  fontFamily: 'var(--mono)',
  fontSize: 12,
  outline: 'none',
};
