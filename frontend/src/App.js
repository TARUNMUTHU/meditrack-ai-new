// C:\Users\ASUS\meditrack-ai\frontend\src\App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Home from './components/Home';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '1.4em', color: '#555', fontWeight: 500 }}>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header style={{
            textAlign: 'center',
            padding: '30px 20px',
            background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', /* Gradient header */
            color: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            fontSize: '1.8em',
            fontWeight: 700,
            letterSpacing: '1px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            <h1>MediTrack AI</h1>
            <p style={{ fontSize: '0.6em', opacity: 0.9, marginTop: '5px' }}>Your Intelligent Medical Report Assistant</p>
          </header>
          <main style={{ flexGrow: 1, padding: '30px 20px' }}> {/* Main content area takes available space */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer style={{
            textAlign: 'center',
            padding: '20px',
            background: '#2c3e50', /* Dark footer */
            color: '#ecf0f1',
            fontSize: '0.9em',
            marginTop: 'auto' /* Pushes footer to the bottom */
          }}>
            <p>&copy; {new Date().getFullYear()} MediTrack AI. All rights reserved.</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;