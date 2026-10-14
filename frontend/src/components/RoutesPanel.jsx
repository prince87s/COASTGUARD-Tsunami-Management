import { useEffect, useState } from 'react';

export default function RoutesPanel({ shelters, userLocation, onClose }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLocation || shelters.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchAll() {
      const results = await Promise.all(
        shelters.map(async (s) => {
          if (s.status === 'full') {
            return { ...s, unreachable: true };
          }
          try {
            const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${s.longitude},${s.latitude}?overview=false`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
              return {
                ...s,
                roadKm: (data.routes[0].distance / 1000).toFixed(1),
                minutes: Math.round(data.routes[0].duration / 60),
              };
            }
            return { ...s, roadKm: null };
          } catch {
            return { ...s, roadKm: null };
          }
        })
      );
      results.sort((a, b) => (a.minutes ?? 999) - (b.minutes ?? 999));
      setRoutes(results);
      setLoading(false);
    }
    fetchAll();
  }, [shelters, userLocation]);

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 className="display" style={{ margin: 0, fontSize: '16px' }}>Evacuation Routes</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: 0 }}>
          Real road-based routes from your location, calculated via OSRM. Ranked by fastest drive time.
        </p>

        {loading ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '13px', padding: '16px 0' }}>Calculating routes…</div>
        ) : routes.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '13px', padding: '16px 0' }}>No shelters nearby to route to.</div>
        ) : (
          routes.map((r) => (
            <div key={r._id} style={rowStyle}>
              <div>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{r.status} · {r.occupied}/{r.capacity}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {r.unreachable ? (
                  <span style={{ color: 'var(--red)', fontSize: '12px' }}>Full — unavailable</span>
                ) : r.roadKm ? (
                  <>
                    <div style={{ color: 'var(--teal)', fontWeight: 700, fontSize: '14px' }}>{r.minutes} min</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{r.roadKm} km by road</div>
                  </>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>~{r.distanceKm.toFixed(1)} km (straight line)</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(10,20,32,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const panelStyle = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '10px', padding: '24px', width: '460px', maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto' };
const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--line)', color: 'var(--text)', fontSize: '13px' };
const closeBtnStyle = { background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '16px', cursor: 'pointer' };