// frontend/src/App.js
import React, { useState } from 'react';
import AnalysisResult from './components/AnalysisResult';

import './App.css';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult({
        ...data,
        repoUrl,
        repoName: repoUrl.split('/').pop().replace('.git', ''),
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>GitHub Repository Analyzer</h1>
        <p>Get AI-powered insights about any GitHub repository</p>
      </header>

      <main className="app-main">
        <form onSubmit={handleSubmit} className="analysis-form">
          <div className="input-group">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="Enter GitHub repository URL (e.g., https://github.com/facebook/react.git)"
              required
            />
            <button 
              type="submit" 
              disabled={isLoading}
              aria-label={isLoading ? "Analyzing..." : "Analyze Repository"}
            >
              {isLoading ? (
                <>
                  <span className="spinner mini"></span> Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <AnalysisResult result={result} isLoading={isLoading} />
      </main>

      <footer className="app-footer">
        <p>Powered by DeepSeek AI and GitHub API</p>
      </footer>
    </div>
  );
}

export default App;