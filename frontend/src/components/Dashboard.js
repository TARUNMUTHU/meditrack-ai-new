// C:\Users\ASUS\meditrack-ai\frontend\src\components/Dashboard.js
import React, { useState } from 'react'; // Import useState
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReportUploadForm from './ReportUploadForm';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function Dashboard() {
  const { currentUser, userProfile, logout, loading, userReports } = useAuth();
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState(null); // New state to hold the report to view

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  // Function to handle viewing a specific report
  const handleViewReportDetails = (report) => {
    setSelectedReport(report);
  };

  // Function to close the detailed report view
  const handleCloseReportDetails = () => {
    setSelectedReport(null);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '1.4em', color: '#555', fontWeight: 500 }}>Loading dashboard...</div>;
  }

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{
      maxWidth: '1300px',
      margin: '40px auto',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      overflow: 'hidden'
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '25px 40px',
        background: 'linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)',
        color: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ margin: 0, fontSize: '2em', fontWeight: 700, letterSpacing: '0.5px' }}>
          Welcome, {userProfile ? userProfile.name : currentUser.email.split('@')[0]}!
        </h2>
        <button onClick={handleLogout} className="danger-button">
          Logout
        </button>
      </nav>

      <div style={{ padding: '40px' }}>
        <h3 style={{
          fontSize: '2.2em',
          marginBottom: '35px',
          fontWeight: 700,
          background: 'linear-gradient(45deg, #007bff, #00c6ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Your Personalized Meditrack Dashboard
        </h3>
        <p style={{ fontSize: '1.1em', color: '#555', lineHeight: '1.7', marginBottom: '40px' }}>
          Effortlessly upload your medical reports and receive intelligent AI analysis. Your health insights, simplified.
        </p>

        {/* Conditionally render ReportUploadForm or the detailed report view */}
        {!selectedReport ? (
          <>
            <ReportUploadForm />

            <div style={{ marginTop: '60px', borderTop: '1px solid #e0e0e0', paddingTop: '40px' }}>
              <h4 style={{
                fontSize: '1.8em',
                marginBottom: '20px',
                fontWeight: 600,
                color: '#333'
              }}>
                Recent Activities & Health Records
              </h4>

              {userReports.length === 0 ? (
                <p style={{ color: '#777', fontSize: '1em', fontStyle: 'italic', padding: '15px', background: '#f5f5f5', borderRadius: '10px', border: '1px dashed #ccc' }}>
                  No past records to display yet. Start by uploading your first report!
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                  {userReports.map(report => (
                    <div key={report.id} style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%)',
                      padding: '25px',
                      borderRadius: '15px',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '200px', // Ensure consistent height
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer' // Indicate clickable
                    }}
                    onClick={() => handleViewReportDetails(report)} // Click to view details
                    >
                      <h5 style={{
                        margin: '0 0 15px 0',
                        fontSize: '1.4em',
                        fontWeight: 600,
                        color: '#2c3e50',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <span role="img" aria-label="report icon">📄</span> {report.fileName.length > 30 ? report.fileName.substring(0, 27) + '...' : report.fileName}
                      </h5>
                      <p style={{
                        fontSize: '0.9em',
                        color: '#777',
                        marginBottom: '15px',
                        wordBreak: 'break-word'
                      }}>
                        Uploaded: {new Date(report.timestamp).toLocaleString()}
                      </p>
                      <div style={{
                        fontSize: '0.95em',
                        color: '#444',
                        lineHeight: '1.6',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3, // Limit to 3 lines
                        WebkitBoxOrient: 'vertical',
                        marginBottom: '15px'
                      }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {report.shortFeedback}
                        </ReactMarkdown>
                      </div>
                      <button
                         onClick={(e) => { e.stopPropagation(); handleViewReportDetails(report); }} // Stop propagation to prevent parent div click
                         className="secondary-button"
                         style={{ marginTop: 'auto', alignSelf: 'flex-start' }} // Align button to start
                      >
                         View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          // --- Detailed Report View ---
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '15px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            marginTop: '20px'
          }}>
            <button
              onClick={handleCloseReportDetails}
              className="secondary-button"
              style={{ marginBottom: '30px', background: 'linear-gradient(to right, #ff7e5f 0%, #feb47b 100%)', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} // A warm "back" button
            >
              ← Back to Dashboard
            </button>

            <h4 style={{
              fontSize: '2em',
              marginBottom: '25px',
              fontWeight: 700,
              background: 'linear-gradient(45deg, #28a745, #66bb6a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Full Analysis for: {selectedReport.fileName}
            </h4>
            <p style={{ fontSize: '1em', color: '#777', marginBottom: '30px' }}>
              Uploaded: {new Date(selectedReport.timestamp).toLocaleString()}
            </p>

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
                {selectedReport.fullFeedback}
              </ReactMarkdown>
            </div>

            {selectedReport.extractedTexts && selectedReport.extractedTexts.length > 0 && (
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
                  {selectedReport.extractedTexts.map((item, index) => (
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

            {selectedReport.uploadedUrls && selectedReport.uploadedUrls.length > 0 && (
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
                    {selectedReport.uploadedUrls.map((url, index) => (
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
    </div>
  );
}

export default Dashboard;