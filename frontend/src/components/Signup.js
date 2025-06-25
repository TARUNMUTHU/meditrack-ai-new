// C:\Users\ASUS\meditrack-ai\frontend\src\components\Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, createUserWithEmailAndPassword, doc, setDoc } from '../firebase';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        createdAt: new Date(),
      });

      console.log('User signed up successfully and profile created in Firestore:', user);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please try logging in or use a different email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is not valid.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password (at least 6 characters).');
      } else {
        setError(err.message);
      }
      console.error('Error signing up:', err);
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
        background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Create Account
      </h2>
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
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
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="primary-button">
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      {error && <p style={{ color: '#dc3545', marginTop: '25px', textAlign: 'center', fontWeight: 500, background: '#ffe0e0', padding: '10px', borderRadius: '8px', border: '1px solid #ffb3b3' }}>{error}</p>}
      <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.95em', color: '#555' }}>
        Already have an account? {' '}
        <button onClick={() => navigate('/login')} className="secondary-button" style={{ background: 'none', boxShadow: 'none', padding: '0', fontSize: '0.95em', color: '#2575fc' }}>
          Login
        </button>
      </p>
    </div>
  );
}

export default Signup;