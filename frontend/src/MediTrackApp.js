import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MediTrackApp.css';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

function MediTrackApp() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [aiFeedback, setAiFeedback] = useState('');
  const [extractedTexts, setExtractedTexts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
    setAiFeedback('');
    setExtractedTexts([]);
    setError(null);
    setAnalysisCompleted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to analyze reports.');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select image files to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setAiFeedback('');
    setExtractedTexts([]);
    setAnalysisCompleted(false);

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('reportFiles', file));

    try {
      const res = await fetch('http://localhost:3001/api/analyze-reports', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setAiFeedback(data.aiFeedback);
      setExtractedTexts(data.extractedTexts);
      setAnalysisCompleted(true);
    } catch (err) {
      setError(`Failed to fetch analysis: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medi-track-app">
      <header className="app-header">
        <h1>MediTrack AI</h1>
        <p>Your intelligent assistant for analyzing medical reports.</p>
        {user ? (
          <div>
            <p>Welcome, {user.email}</p>
            <button onClick={handleLogout} className="auth-button">Logout</button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="auth-form">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            <button type="submit" className="auth-button">{isLogin ? 'Login' : 'Sign Up'}</button>
            <p onClick={() => setIsLogin(!isLogin)} className="auth-toggle">
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </p>
          </form>
        )}
      </header>

      {user && (
        <main className="app-main">
          <section className="upload-section">
            <h2>Upload Medical Reports</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-controls">
                <label htmlFor="file-upload" className="file-input-wrapper">
                  <span>Choose Files</span>
                  <input id="file-upload" type="file" multiple accept="image/*" onChange={handleFileChange} />
                </label>
                <button type="submit" disabled={loading || selectedFiles.length === 0} className="analyze-button">
                  {loading ? 'Analyzing...' : 'Analyze Reports'}
                </button>
              </div>
              {selectedFiles.length > 0 && (
                <div className="selected-files-display">
                  <ul>{selectedFiles.map((f, i) => <li key={i}>{f.name}</li>)}</ul>
                </div>
              )}
            </form>
            {error && <p className="error-message">{error}</p>}
          </section>

          {loading && <div className="loading-section">Analyzing... <div className="spinner"></div></div>}

          {analysisCompleted && !error && (
            <section className="results-section">
              <div className="extracted-text-display">
                <h2>Extracted Text:</h2>
                {extractedTexts.map((item, idx) => (
                  <div key={idx}>
                    <h3>{item.fileName}</h3>
                    <pre>{item.text}</pre>
                  </div>
                ))}
              </div>
              <div className="ai-feedback-display">
                <h2>AI Feedback</h2>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiFeedback}
                </ReactMarkdown>
              </div>
            </section>
          )}
        </main>
      )}

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} MediTrack AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default MediTrackApp;
