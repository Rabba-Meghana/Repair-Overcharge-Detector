import React, { useState } from 'react';

const SAMPLES = [
  {
    label: '✅ Fair Invoice',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.08)',
    text: `Auto Service Center - Work Order #2024-1891
Date: March 15, 2024

Vehicle: 2019 Honda Civic
Mileage: 52,340

SERVICES PERFORMED:
1. Full synthetic oil change (5W-30) - $89.99
2. Tire rotation - $29.99
3. Engine air filter replacement - $39.99
4. Multi-point inspection - $0.00 (complimentary)

Parts:
- Mobil 1 Synthetic Oil (5 qts) - $45.00
- Fram Air Filter - $18.99

Labor:
- Oil change labor - $20.00
- Tire rotation labor - $15.00

Shop supplies fee - $8.50
Tax (8%) - $20.35

TOTAL: $267.81`
  },
  {
    label: '⚠️ Inflated Invoice',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.08)',
    text: `Quick Lube & More - Invoice #8834
Date: March 15, 2024

Vehicle: 2019 Honda Civic
Mileage: 52,340

SERVICES:
1. Synthetic oil change - $149.99
2. Tire rotation - $79.99
3. Engine air filter - $89.99
4. Cabin air filter - $119.99
5. "BG Products" fuel system service - $189.99

Labor charges: $185.00
Environmental disposal fee: $45.00
Shop supplies: $35.00

TOTAL: $895.95`
  },
  {
    label: '🚨 Severe Overcharge',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.08)',
    text: `Elite Auto Care - Work Order #445521
Date: March 15, 2024

Vehicle: 2018 Toyota Camry
Mileage: 67,210

REPAIRS:
1. Brake pad replacement (front) - $689.00
2. Brake rotor resurfacing - $450.00
3. Brake fluid flush - $299.00
4. Alignment - $329.00
5. Wheel balance (4 wheels) - $249.00
6. Cabin filter replacement - $189.00
7. Engine filter replacement - $159.00

Parts markup: 45% added to all parts
Labor rate: $185/hour (4.5 hours billed)
Diagnostic fee: $195.00
Shop consumables: $89.00

TOTAL: $3,481.50`
  }
];

function SampleOrders() {
  const [open, setOpen] = useState(null);

  const loadSample = (text) => {
    // Store in sessionStorage for WorkOrderInput to pick up
    window._sampleText = text;
    window.dispatchEvent(new CustomEvent('loadSample', { detail: text }));
    setOpen(null);
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1rem' }}>📋</span>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sample Work Orders</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>— click to load</span>
      </div>
      
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {SAMPLES.map((s, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                background: open === i ? s.bg : 'var(--bg-hover)',
                border: `1px solid ${open === i ? s.color : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem 0.875rem',
                color: open === i ? s.color : 'var(--text-secondary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: open === i ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {s.label} {open === i ? '▲' : '▼'}
            </button>
            
            {open === i && (
              <div style={{
                position: 'absolute',
                zIndex: 50,
                marginTop: '0.5rem',
                background: 'var(--bg-secondary)',
                border: `1px solid ${s.color}`,
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                maxWidth: '480px',
                boxShadow: 'var(--shadow-lg)',
              }}>
                <pre style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  marginBottom: '0.75rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}>{s.text}</pre>
                <button
                  onClick={() => loadSample(s.text)}
                  style={{
                    background: s.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.4rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Load This Sample →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SampleOrders;
