import { useEffect, useState } from 'react';
import Waveform from './Waveform';
import { applyLevelVisuals, levelConfig } from '../utils/levels';
import { requestNotificationPermission, showAlertNotification } from '../utils/notifications';
import { socket } from '../socket';
import axios from 'axios';

export default function TopBar({ level, setLevel, adminUser, onRequestLogin, onLogout }) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-GB'));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    applyLevelVisuals(level);
  }, [level]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    socket.on('newAlert', (alert) => {
      setLevel(alert.level);
      showAlertNotification(alert.level, alert.message);
    });
    return () => socket.off('newAlert');
  }, [setLevel]);

  async function handleLevelChange(newLevel) {
    if (!adminUser) {
      onRequestLogin();
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await axios.post(
           (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/alerts',
        { level: newLevel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Your session expired. Please sign in again.');
        onLogout();
      } else {
        console.error('Failed to broadcast alert', err);
      }
    }
  }

  return (
    <div className="topbar">
      <div className="topbar-row1">
        <div className="brandline">
          <span className="eyebrow mono">Nilam Coast · Sector 4</span>
          <h1 className="display">Coastal Early Warning — Operations Console</h1>
        </div>
        <div className="status-cluster">
          <span className="clock mono">{clock}</span>
          <div className="level-switch">
            {['normal', 'watch', 'warning'].map((lvl) => (
              <button
                key={lvl}
                className={`level-btn on-${lvl} ${level === lvl ? 'selected' : ''}`}
                onClick={() => handleLevelChange(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
          <div className="alert-pill">
            <span className="dot"></span>
            <span>{levelConfig[level].text}</span>
          </div>

          {adminUser ? (
            <button onClick={onLogout} style={authBtnStyle}>
              {adminUser} · Sign out
            </button>
          ) : (
            <button onClick={onRequestLogin} style={authBtnStyle}>
              Admin Sign In
            </button>
          )}
        </div>
      </div>
      <Waveform level={level} />
    </div>
  );
}

const authBtnStyle = {
  fontSize: '11px',
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1px solid var(--line)',
  background: 'var(--panel)',
  color: 'var(--text-dim)',
  cursor: 'pointer',
};