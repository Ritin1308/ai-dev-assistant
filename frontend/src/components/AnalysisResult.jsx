// frontend/src/components/AnalysisResult.jsx
import React from 'react';

const AnalysisResult = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Analyzing repository...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="analysis-container">
      {result.error ? (
        <div className="error-message">
          <h3>❌ Error Analyzing Repository</h3>
          <p>{result.error}</p>
          {result.details && (
            <details>
              <summary>Technical Details</summary>
              <pre>{result.details}</pre>
            </details>
          )}
        </div>
      ) : (
        <div className="success-results">
          <div className="repo-header">
            <h2>
              <span className="success-icon">✅</span> Analysis of:{" "}
              <a href={result.repoUrl} target="_blank" rel="noopener noreferrer">
                {result.repoName || "Repository"}
              </a>
            </h2>
            <p className="timestamp">
              Analyzed at: {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
          
          <div className="ai-response">
            <h3>AI Analysis Summary</h3>
            {result.analysis.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph || <br />}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;