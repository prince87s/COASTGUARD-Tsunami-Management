import { useEffect, useState } from 'react';
import axios from 'axios';
import { socket } from '../socket';

export default function HelpRequestsPanel({ onClose }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/help-requests').then((res) => setRequests(res.data));
    socket.on('newHelpRequest', (req) => setRequests((prev) => [req, ...prev]));
    socket.on('resolvedHelpRequest', (req) => setRequests((prev) => prev.filter((r) => r._id !== req._id)));
    return () => {
      socket.off('newHelpRequest');
      socket.off('resolvedHelpRequest');
    };
  }, []);

  async function resolve(id) {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/help-requests/${id}/resolve`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resolve');
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 className="display" style={{ margin: 0, fontSize: '16px' }}>Help Requests ({requests.length} pending)</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
        {error && <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
        {requests.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '13px', padding: '20px 0' }}>No pending requests right now.</div>
        ) : (
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {requests.map((r) => (
              <div key={r._id} style={rowStyle}>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text)', margin: '4px 0' }}>{r.message}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim-2)' }}>
                    {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)} · {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
                <button onClick={() => resolve(r._id)} style={resolveBtnStyle}>Mark Resolved</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(10,20,32,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const panelStyle = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '10px', padding: '24px', width: '480px', maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto' };
const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--line)', color: 'var(--text)', fontSize: '13px' };
const resolveBtnStyle = { fontSize: '11px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--teal)', background: 'transparent', color: 'var(--teal)', cursor: 'pointer', whiteSpace: 'nowrap' };
const closeBtnStyle = { background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '16px', cursor: 'pointer' };