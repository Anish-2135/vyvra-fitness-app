import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from '../services/api';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await signupUser(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || 'Signup failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>VYVRA</h1>
        <h2 style={styles.subtitle}>Create your account</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="yourname"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f0f', fontFamily: 'system-ui, sans-serif' },
  card: { backgroundColor: '#1a1a1a', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #2a2a2a' },
  title: { color: '#ffffff', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px', letterSpacing: '4px' },
  subtitle: { color: '#888', fontSize: '16px', textAlign: 'center', marginBottom: '28px', fontWeight: 'normal' },
  field: { marginBottom: '16px' },
  label: { display: 'block', color: '#ccc', fontSize: '14px', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', backgroundColor: '#0f0f0f', border: '1px solid #333', borderRadius: '8px', color: '#ffffff', fontSize: '15px', boxSizing: 'border-box', outline: 'none' },
  button: { width: '100%', padding: '12px', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '500', cursor: 'pointer', marginTop: '8px' },
  error: { backgroundColor: '#2d1b1b', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #7f1d1d' },
  switchText: { textAlign: 'center', color: '#666', fontSize: '14px', marginTop: '20px' },
  link: { color: '#818cf8', textDecoration: 'none' },
};

export default Signup;