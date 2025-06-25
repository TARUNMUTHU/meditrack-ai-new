// C:\Users\ASUS\meditrack-ai\frontend\src\components\ReportUploadForm.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ReportUploadForm() {
  const { currentUser, addReport } = useAuth(); // Destructure addReport
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setAnalysisResult(null);
    setError(null);
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleSubmitReports = async (event) => {
    event.preventDefault();
    setError(null);
    setAnalysisResult(null);

    if (!currentUser) {
      setError('You must be logged in to analyze reports.');
      setLoading(false);
      return;
    }
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const idToken = await currentUser.getIdToken();
      console.log('Firebase ID Token being sent:', idToken ? 'Token exists' : 'Token is missing!');

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('reportFiles', file);
      });

      const response = await fetch('http://localhost:3001/api/analyze-reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);

      // --- NEW: Add the successful analysis result to AuthContext's reports ---
      addReport({
        // Capture relevant data for the history view
        fileName: selectedFiles.map(f => f.name).join(', '), // Or just the first file name if multiple
        shortFeedback: data.aiFeedback.substring(0, 150) + '...', // Short snippet for history
        fullFeedback: data.aiFeedback, // Store full feedback if needed later
        extractedTexts: data.extractedTexts,
        uploadedUrls: data.uploadedUrls
      });
      // --- END NEW ---

      console.log('Analysis successful:', data);
      setSelectedFiles([]);

    } catch (err) {
      console.error('Error analyzing reports:', err);
      setError(`Failed to analyze reports: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '40px',
      background: '#fdfdfd',
      borderRadius: '15px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
      border: '1px solid #e0e0e0'
    }}>
      <h3 style={{
        fontSize: '2em',
        marginBottom: '25px',
        fontWeight: 700,
        background: 'linear-gradient(45deg, #007bff, #28a745)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Upload Your Medical Reports
      </h3>
      <p style={{ color: '#666', marginBottom: '35px', fontSize: '1.05em' }}>
        Securely upload image files (JPG, PNG, etc.) for AI-powered analysis. Max 5MB per file.
      </p>

      <form onSubmit={handleSubmitReports} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <label htmlFor="file-upload" className="file-input-wrapper">
            <span>Select Files</span>
            <input id="file-upload" type="file" accept="image/*" multiple onChange={handleFileChange} disabled={loading} />
          </label>
          {selectedFiles.length > 0 && (
            <span style={{ fontSize: '1em', color: '#444', fontWeight: 500 }}>
              {selectedFiles.length} file(s) selected
            </span>
          )}
        </div>

        {selectedFiles.length > 0 && (
          <div style={{
            marginTop: '10px',
            fontSize: '0.9em',
            color: '#555',
            background: '#f9f9f9',
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid #e5e5e5'
          }}>
            <p style={{ marginBottom: '10px', fontWeight: 600 }}>Selected Files:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '25px', margin: 0 }}>
              {selectedFiles.map((file, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" disabled={loading || selectedFiles.length === 0} className="primary-button">
          {loading ? 'Analyzing Reports...' : 'Analyze Reports'}
        </button>
      </form>

      {error && (
        <div style={{
          color: '#dc3545',
          marginTop: '30px',
          fontWeight: 500,
          border: '1px solid #dc3545',
          padding: '15px',
          borderRadius: '10px',
          backgroundColor: '#ffe0e0',
          boxShadow: '0 2px 8px rgba(220, 53, 69, 0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Error:</p>
          <p style={{ margin: '5px 0 0 0' }}>{error}</p>
        </div>
      )}

      {loading && (
        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '20px',
          background: 'linear-gradient(45deg, #e0f7fa, #cbe0f8)',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}>
          <p style={{ fontSize: '1.2em', color: '#2c3e50', fontWeight: 600 }}>Analyzing... Please wait.</p>
          <div className="spinner" style={{
            border: '4px solid rgba(0, 0, 0, 0.1)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            borderLeftColor: '#6a11cb',
            animation: 'spin 1s ease infinite',
            margin: '15px auto'
          }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {analysisResult && (
        <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid #e0e0e0' }}>
          <h4 style={{
            fontSize: '2em',
            marginBottom: '25px',
            fontWeight: 700,
            background: 'linear-gradient(45deg, #28a745, #66bb6a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AI Analysis Report
          </h4>
          <div style={{
            background: 'linear-gradient(135deg, #e8f5e9 0%, #dcf0e2 100%)',
            padding: '30px',
            borderRadius: '15px',
            border: '1px solid #a8d5b7',
            fontSize: '1.05em',
            lineHeight: '1.8',
            color: '#2e7d32',
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)',
            marginBottom: '30px'
          }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {analysisResult.aiFeedback}
            </ReactMarkdown>
          </div>

          {analysisResult.extractedTexts && analysisResult.extractedTexts.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h5 style={{
                fontSize: '1.8em',
                marginBottom: '20px',
                fontWeight: 600,
                color: '#333'
              }}>
                Extracted Text from Images:
              </h5>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {analysisResult.extractedTexts.map((item, index) => (
                  <li key={index} style={{ marginBottom: '25px', background: '#f5f5f5', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <strong style={{ color: '#2575fc', fontSize: '1.2em' }}>File: {item.fileName}</strong>
                      {item.cloudinaryUrl && (
                        <a href={item.cloudinaryUrl} target="_blank" rel="noopener noreferrer" style={{
                          color: '#6a11cb', textDecoration: 'none', fontSize: '0.9em', fontWeight: 600,
                          padding: '8px 15px', borderRadius: '8px', background: '#f0f0ff', border: '1px solid #d0d0ff'
                        }}>
                          View Original Image
                        </a>
                      )}
                    </div>
                    <pre style={{
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.95em',
                      color: '#444',
                      marginTop: '10px',
                      background: '#eceff1',
                      padding: '15px',
                      borderRadius: '10px',
                      border: '1px solid #cfd8dc',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {item.text}
                    </pre>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysisResult.uploadedUrls && analysisResult.uploadedUrls.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h5 style={{
                  fontSize: '1.8em',
                  marginBottom: '20px',
                  fontWeight: 600,
                  color: '#333'
                }}>
                  Uploaded Image Links:
                </h5>
                <ul style={{ listStyleType: 'disc', paddingLeft: '30px', fontSize: '0.95em', color: '#555' }}>
                  {analysisResult.uploadedUrls.map((url, index) => (
                    <li key={index} style={{ marginBottom: '10px' }}>
                      <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#2575fc', wordBreak: 'break-all', textDecoration: 'underline' }}>
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReportUploadForm;