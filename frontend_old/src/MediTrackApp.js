import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm';         // Import GitHub Flavored Markdown plugin
import './MediTrackApp.css';

function MediTrackApp() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [aiFeedback, setAiFeedback] = useState('');
  const [extractedTexts, setExtractedTexts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
    setAiFeedback('');
    setExtractedTexts([]);
    setError(null);
    setAnalysisCompleted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selectedFiles.length === 0) {
      setError('Please select one or more image files to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setAiFeedback('');
    setExtractedTexts([]);
    setAnalysisCompleted(false);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('reportFiles', file);
    });

    try {
      const response = await fetch('http://localhost:3001/api/analyze-reports', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Frontend received data:", data);

      setAiFeedback(data.aiFeedback);
      setExtractedTexts(data.extractedTexts);
      setAnalysisCompleted(true);

    } catch (err) {
      console.error("Error fetching analysis:", err);
      setError(`Failed to fetch analysis: ${err.message}`);
      setAiFeedback('');
      setExtractedTexts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medi-track-app">
      <header className="app-header">
        <h1>MediTrack AI</h1>
        <p>Your intelligent assistant for analyzing medical reports.</p>
      </header>

      <main className="app-main">
        <section className="upload-section">
          <h2>Upload Medical Reports</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-controls">
              <label htmlFor="file-upload" className="file-input-wrapper">
                <span>Choose Files</span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>

              <button type="submit" disabled={loading || selectedFiles.length === 0} className="analyze-button">
                {loading ? 'Analyzing...' : 'Analyze Reports'}
              </button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="selected-files-display">
                <p>Selected files:</p>
                <ul>
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </form>
          {error && <p className="error-message">{error}</p>}
        </section>

        {loading && (
          <section className="loading-section">
            <p>Analyzing your reports. Please wait...</p>
            <div className="spinner"></div>
          </section>
        )}

        {analysisCompleted && !loading && !error && (
          <section className="results-section">
            <div className="extracted-text-display">
              <h2>Extracted Text from Reports:</h2>
              {extractedTexts.length > 0 ? (
                extractedTexts.map((item, index) => (
                  <div key={index} className="extracted-file-block">
                    <h3>{item.fileName}</h3>
                    <pre className="extracted-text-content">{item.text}</pre>
                  </div>
                ))
              ) : (
                <p>No text was extracted or provided.</p>
              )}
            </div>

            <div className="ai-feedback-display">
              <h2>AI Feedback from Gemini:</h2>
              {aiFeedback ? (
                // Use ReactMarkdown to render the feedback
                <div className="ai-feedback-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiFeedback}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>No AI feedback generated.</p>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} MediTrack AI. All rights reserved.</p>
        <p>Disclaimer: This AI feedback is for informational purposes only and not a substitute for professional medical advice.</p>
      </footer>
    </div>
  );
}

export default MediTrackApp;