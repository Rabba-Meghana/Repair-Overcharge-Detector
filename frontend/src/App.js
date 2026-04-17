import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import WorkOrderInput from './components/WorkOrderInput';
import SampleOrders from './components/SampleOrders';
import ResultsDashboard from './components/ResultsDashboard';
import BenchmarkTable from './components/BenchmarkTable';

function App() {
  const [theme, setTheme] = useState('dark');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="app">
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main className="main-content">
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
          {['analyze', 'benchmarks'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem 0',
                fontSize: '0.95rem',
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--accent-blue)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab ? '2px solid var(--accent-blue)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
                marginBottom: '-1px',
              }}
            >
              {tab === 'analyze' ? '🔍 Analyze Work Order' : '📊 Benchmark Rates'}
            </button>
          ))}
        </div>

        {activeTab === 'analyze' && (
          <>
            <SampleOrders />
            <WorkOrderInput
              setResults={setResults}
              loading={loading}
              setLoading={setLoading}
            />
            {results && <ResultsDashboard results={results} />}
          </>
        )}

        {activeTab === 'benchmarks' && <BenchmarkTable />}
      </main>
    </div>
  );
}

export default App;
