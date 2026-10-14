export default function Sidebar({ onManageShelters, onManageHelp, onViewHistory, onViewRoutes }) {
  return (
    <div className="rail">
      <div className="rail-logo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--state-color)" strokeWidth="1.8">
          <path d="M2 16c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0" strokeLinecap="round" />
          <path d="M12 3v8M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="rail-btn active" title="Console">🖥️</div>
      <div className="rail-btn" title="Alert History" onClick={onViewHistory} style={{ cursor: 'pointer' }}>⚠️</div>
      <div className="rail-btn" title="Manage Shelters" onClick={onManageShelters} style={{ cursor: 'pointer' }}>🏠</div>
      <div className="rail-btn" title="Evacuation Routes" onClick={onViewRoutes} style={{ cursor: 'pointer' }}>🛣️</div>
      <div className="rail-btn" title="Help Requests" onClick={onManageHelp} style={{ cursor: 'pointer' }}>💬</div>
      <div className="rail-spacer"></div>
      <div className="rail-btn" title="Settings">⚙️</div>
    </div>
  );
}