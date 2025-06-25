// C:\Users\ASUS\meditrack-ai\frontend\src\components\Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { currentUser } = useAuth();

  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 40px',
      borderRadius: '15px',
      maxWidth: '900px',
      margin: '80px auto 40px auto',
      background: 'white', /* White card background */
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '25px'
    }}>
      <h2 style={{
        fontSize: '3em',
        marginBottom: '15px',
        fontWeight: 800,
        background: 'linear-gradient(45deg, #6a11cb, #2575fc)', /* Primary gradient */
        WebkitBackgroundClip: 'text', /* Clip background to text */
        WebkitTextFillColor: 'transparent', /* Make text transparent to show gradient */
        filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.1))' /* Subtle text shadow */
      }}>
        Empowering Health Insights with AI
      </h2>
      <p style={{ fontSize: '1.25em', color: '#555', lineHeight: '1.7', maxWidth: '700px' }}>
        MediTrack AI leverages advanced artificial intelligence to accurately analyze your medical reports, providing you with comprehensive and easy-to-understand feedback. Secure, insightful, and designed for your well-being.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', marginTop: '30px' }}>
        {currentUser ? (
          <Link to="/dashboard" className="primary-button" style={{ textDecoration: 'none' }}>Go to Dashboard</Link>
        ) : (
          <>
            <Link to="/signup" className="primary-button" style={{ textDecoration: 'none' }}>Join MediTrack AI</Link>
            <Link to="/login" className="secondary-button" style={{ textDecoration: 'none' }}>Login Now</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;