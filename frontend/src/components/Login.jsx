import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      onLogin(res.data.username);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,20,32,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: '10px',
          padding: '28px',
          width: '320px',
        }}
      >
        <h2 className="display" style={{ margin: '0 0 4px 0', fontSize: '18px' }}>
          Admin Login
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: '0 0 18px 0' }}>
          Sign in to manage shelters and broadcast alerts.
        </p>

        <label style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
          autoFocus
        />

        <label style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '10px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ ...btnStyle, background: 'transparent', color: 'var(--text-dim)' }}
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} style={{ ...btnStyle, background: 'var(--teal)', color: '#0A1420' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '9px 10px',
  marginTop: '4px',
  marginBottom: '14px',
  background: 'var(--ink)',
  border: '1px solid var(--line)',
  borderRadius: '6px',
  color: 'var(--text)',
  fontSize: '13px',
  outline: 'none',
};

const btnStyle = {
  flex: 1,
  padding: '9px 0',
  borderRadius: '6px',
  border: 'none',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};