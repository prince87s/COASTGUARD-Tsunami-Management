export default function ShelterStrip({ shelters, hasSheltersInDb }) {
  const hasData = shelters && shelters.length > 0;

  return (
    <div className="card shelter-strip">
      <div className="card-head">
        <h2>Shelter Status</h2>
        <span className="tag">{hasData ? `${shelters.length} near you` : 'No data'}</span>
      </div>
      {!hasData ? (
        <div style={{ padding: '24px 16px', color: 'var(--text-dim)', fontSize: '13px' }}>
          {!hasSheltersInDb
            ? <>No shelters in the database yet. Add some via Postman (POST to <code>/api/shelters</code>).</>
            : 'Detecting your location to find nearby shelters…'}
        </div>
      ) : (
        <div className="shelter-grid">
          {shelters.map((s) => {
            const pct = Math.round((s.occupied / s.capacity) * 100);
            return (
              <div className="shelter-card" key={s._id}>
                <div className="row1">
                  <div>
                    <h3>{s.name}</h3>
                    <div className="zone">{s.distanceKm.toFixed(1)} km away</div>
                  </div>
                  <span className={`status-chip ${s.status}`}>{s.status}</span>
                </div>
                <div className="capacity-bar">
                  <div className={`capacity-fill ${s.status}`} style={{ width: `${pct}%` }}></div>
                </div>
                <div className="capacity-text">
                  <span>{s.occupied} / {s.capacity}</span>
                  <span>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}