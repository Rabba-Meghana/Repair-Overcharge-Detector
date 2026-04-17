import React, { useState } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import HistoryPanel from './components/HistoryPanel';
import BenchmarkPanel from './components/BenchmarkPanel';

export default function App() {
  const [tab, setTab] = useState('analyze');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header tab={tab} setTab={setTab} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 48px' }}>
        {tab === 'analyze' && (
          <>
            <InputPanel
              apiKey={apiKey}
              setApiKey={setApiKey}
              setResults={setResults}
              loading={loading}
              setLoading={setLoading}
            />
            {results && <ResultsPanel results={results} />}
          </>
        )}
        {tab === 'history' && <HistoryPanel />}
        {tab === 'benchmarks' && <BenchmarkPanel />}
      </div>
    </div>
  );
}
