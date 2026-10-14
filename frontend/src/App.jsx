import AlertHistoryPanel from './components/AlertHistoryPanel';
import RoutesPanel from './components/RoutesPanel';
import SOSButton from './components/SOSButton';
import HelpRequestsPanel from './components/HelpRequestsPanel';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/Topbar';
import MapPanel from './components/MapPanel';
import LiveFeed from './components/LiveFeed';
import ShelterStrip from './components/ShelterStrip';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { getShelters } from './api';
import { haversineKm } from './utils/geo';

const FALLBACK_LOCATION = { lat: 13.0827, lng: 80.2707 };
function App() {
  const [level, setLevel] = useState('normal');
  const [shelters, setShelters] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Requesting location…');
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [adminUser, setAdminUser] = useState(localStorage.getItem('username') || null);
  const refreshShelters = useCallback(() => {
    getShelters()
      .then((data) => setShelters(data))
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    refreshShelters();
  }, [refreshShelters]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported');
      setUserLocation(FALLBACK_LOCATION);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('Location detected');
      },
      () => {
        setLocationStatus('Location permission denied — using default region');
        setUserLocation(FALLBACK_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const nearbyShelters = useMemo(() => {
    if (!userLocation || shelters.length === 0) return [];
    const withDist = shelters.map((s) => ({
      ...s,
      distanceKm: haversineKm(userLocation.lat, userLocation.lng, s.latitude, s.longitude),
    }));
    withDist.sort((a, b) => a.distanceKm - b.distanceKm);
    const within150 = withDist.filter((s) => s.distanceKm <= 150);
    return within150.length > 0 ? within150 : withDist.slice(0, 5);
  }, [shelters, userLocation]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAdminUser(null);
  }

  function handleManageShelters() {
    if (!adminUser) {
      setShowLogin(true);
    } else {
      setShowAdminPanel(true);
    }
  }
  function handleManageHelp() {
  if (!adminUser) {
    setShowLogin(true);
  } else {
    setShowHelpPanel(true);
  }
}

  return (
    <div className="shell">
      <Sidebar
  onManageShelters={handleManageShelters}
  onManageHelp={handleManageHelp}
  onViewHistory={() => setShowHistory(true)}
  onViewRoutes={() => setShowRoutes(true)}
/>
      <TopBar
        level={level}
        setLevel={setLevel}
        adminUser={adminUser}
        onRequestLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
      />
      <div className="main">
        <MapPanel
          shelters={nearbyShelters}
          userLocation={userLocation}
          locationStatus={locationStatus}
          loadError={loadError}
          hasSheltersInDb={shelters.length > 0}
        />
        <LiveFeed userLocation={userLocation} />
        <ShelterStrip shelters={nearbyShelters} hasSheltersInDb={shelters.length > 0} />
      </div>

      {showLogin && (
        <Login
          onLogin={(username) => {
            setAdminUser(username);
            setShowLogin(false);
            setShowAdminPanel(true);
          }}
          onCancel={() => setShowLogin(false)}
        />
      )}

      {showAdminPanel && (
        <AdminPanel
          shelters={shelters}
          onClose={() => setShowAdminPanel(false)}
          onRefresh={refreshShelters}
        />
      )}
      {showHelpPanel && <HelpRequestsPanel onClose={() => setShowHelpPanel(false)} />}
      {showHistory && <AlertHistoryPanel onClose={() => setShowHistory(false)} />}
      {showRoutes && <RoutesPanel shelters={nearbyShelters} userLocation={userLocation} onClose={() => setShowRoutes(false)} />}


       <SOSButton userLocation={userLocation} />
    </div>
  );
}

export default App;