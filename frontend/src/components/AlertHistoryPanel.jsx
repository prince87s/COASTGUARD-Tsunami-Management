import { useEffect, useState } from 'react';
import axios from 'axios';

const levelValue = { normal: 1, watch: 2, warning: 3 };
const levelColor = { normal: '#2FE6C7', watch: '#FFB020', warning: '#FF4B3E' };

export default function AlertHistoryPanel({ onClose }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/alerts').then((res) => {
      setAlerts(res.data.slice().reverse()); // oldest first for the timeline
    });
  }, []);

  const counts = alerts.reduce(
    (acc, a) => ({ ...acc, [a.level]: (acc[a.level] || 0) + 1 }),
    { normal: 0, watch: 0, warning: 0 }
  );

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="display" style={{ margin: 0, fontSize: '16px' }}>Alert History</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {['normal', 'watch', 'warning'].map((lvl) => (
            <div key={lvl} style={{ flex: 1, background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: levelColor[lvl] }}>{counts[lvl]}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lvl}</div>
            </div>
          ))}
        </div>

        {alerts.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '13px' }}>No alert history yet.</div>
        ) : (
          <>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px' }}>Timeline (oldest → newest)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '90px', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '4px', overflowX: 'auto' }}>
              {alerts.map((a, i) => (
                <div
                  key={i}
                  title={`${a.level} — ${new Date(a.createdAt).toLocaleString()}`}
                  style={{
                    minWidth: '10px',
                    width: '10px',
                    height: `${levelValue[a.level] * 28}px`,
                    background: levelColor[a.level],
                    borderRadius: '2px 2px 0 0',
                    opacity: 0.85,
                  }}
                ></div>
              ))}
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {alerts.slice().reverse().map((a) => (
                <div key={a._id} style={rowStyle}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: levelColor[a.level], flexShrink: 0 }}></span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim-2)', minWidth: '130px' }}>
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                  <span style={{ fontSize: '12px' }}>{a.message}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(10,20,32,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const panelStyle = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '10px', padding: '24px', width: '560px', maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto' };
const rowStyle = { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--line)', color: 'var(--text)' };
const closeBtnStyle = { background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '16px', cursor: 'pointer' };