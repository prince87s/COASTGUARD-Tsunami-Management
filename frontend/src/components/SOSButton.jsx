import { useState } from 'react';
import axios from 'axios';

export default function SOSButton({ userLocation }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userLocation) {
      setError('Still detecting your location — try again in a moment.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await axios.post(   (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/help-requests', {
        name: name || 'Anonymous',
        message,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setOpen(false);
    setSubmitted(false);
    setName('');
    setMessage('');
    setError('');
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={fabStyle}>🆘 Need Help</button>

      {open && (
        <div style={overlayStyle}>
          <div style={panelStyle}>
            {submitted ? (
              <>
                <h2 className="display" style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--teal)' }}>Request sent</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
                  Your location and message have been sent to the emergency response team.
                </p>
                <button onClick={close} style={{ ...btnStyle, background: 'var(--teal)', color: '#0A1420', marginTop: '10px' }}>Close</button>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="display" style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--red)' }}>Request Help</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: '0 0 14px 0' }}>
                  This sends your current location to emergency responders instantly.
                </p>
                <input placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                <textarea placeholder="What's happening?" value={message} onChange={(e) => setMessage(e.target.value)} style={{ ...inputStyle, height: '80px', resize: 'none' }} required />
                {error && <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={close} style={{ ...btnStyle, background: 'transparent', color: 'var(--text-dim)' }}>Cancel</button>
                  <button type="submit" disabled={busy} style={{ ...btnStyle, background: 'var(--red)', color: '#fff', flex: 1 }}>
                    {busy ? 'Sending…' : 'Send SOS'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const fabStyle = { position: 'fixed', bottom: '24px', right: '24px', zIndex: 900, background: 'var(--red)', color: '#fff', border: 'none', borderRadius: '30px', padding: '14px 22px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,75,62,0.5)' };
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(10,20,32,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const panelStyle = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '10px', padding: '24px', width: '340px' };
const inputStyle = { width: '100%', padding: '9px 10px', marginBottom: '12px', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' };
const btnStyle = { padding: '9px 0', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' };