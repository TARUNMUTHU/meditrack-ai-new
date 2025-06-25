// C:\Users\ASUS\meditrack-ai\frontend\src\components\Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword } from '../firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is not valid.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError(err.message);
      }
      console.error('Error logging in:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '60px auto 40px auto',
      padding: '40px',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '35px',
        fontSize: '2.5em',
        fontWeight: 700,
        background: 'linear-gradient(45deg, #2575fc, #6a11cb)', /* Reversed gradient for subtle difference */
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Welcome Back!
      </h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="primary-button">
          {loading ? 'Logging In...' : 'Login'}
        </button>
      </form>
      {error && <p style={{ color: '#dc3545', marginTop: '25px', textAlign: 'center', fontWeight: 500, background: '#ffe0e0', padding: '10px', borderRadius: '8px', border: '1px solid #ffb3b3' }}>{error}</p>}
      <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.95em', color: '#555' }}>
        Don't have an account? {' '}
        <button onClick={() => navigate('/signup')} className="secondary-button" style={{ background: 'none', boxShadow: 'none', padding: '0', fontSize: '0.95em', color: '#6a11cb' }}>
          Sign Up
        </button>
      </p>
    </div>
  );
}

export default Login;