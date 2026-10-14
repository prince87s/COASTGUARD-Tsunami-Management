import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export default function MapPanel({ shelters, userLocation, locationStatus, loadError, hasSheltersInDb }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const shelterLayerRef = useRef(null);
  const [senseStatus, setSenseStatus] = useState('Waiting for location…');
  const [senseQuake, setSenseQuake] = useState('—');

  function shelterIcon(status) {
    return L.divIcon({ className: '', html: `<div class="shelter-pin ${status}"></div>`, iconSize: [13, 13] });
  }
  function userIcon() {
    return L.divIcon({ className: '', html: '<div class="user-marker"></div>', iconSize: [16, 16] });
  }
  function quakeIcon(mag) {
    const size = Math.max(10, Math.min(46, mag * 8));
    return L.divIcon({ className: '', html: `<div class="quake-marker" style="width:${size}px;height:${size}px;"></div>`, iconSize: [size, size] });
  }

  // Init map once
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(mapDivRef.current, { zoomControl: true }).setView([13.0827, 80.2707], 9);
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    shelterLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Recenter + fetch quakes whenever userLocation is detected/changes
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;
    const map = mapRef.current;
    map.setView([userLocation.lat, userLocation.lng], 11);

    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon() })
      .addTo(map)
      .bindPopup('<b>Your location</b>');

    async function fetchEarthquakes() {
      setSenseStatus('Fetching live seismic data…');
      try {
        const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
        const data = await res.json();
        let nearest = null, nearestDist = Infinity;
        data.features.forEach((f) => {
          const [lng, lat, depth] = f.geometry.coordinates;
          const mag = f.properties.mag || 0;
          if (mag < 2.5) return;
          L.marker([lat, lng], { icon: quakeIcon(mag) })
            .addTo(map)
            .bindPopup(`<b>M ${mag.toFixed(1)} earthquake</b><br>${f.properties.place || 'Unknown'}<br>Depth: ${depth.toFixed(0)} km`);
          const R = 6371;
          const dLat = ((lat - userLocation.lat) * Math.PI) / 180;
          const dLon = ((lng - userLocation.lng) * Math.PI) / 180;
          const a = Math.sin(dLat/2)**2 + Math.cos(userLocation.lat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLon/2)**2;
          const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          if (dist < nearestDist) { nearestDist = dist; nearest = { mag, place: f.properties.place }; }
        });
        if (nearest) {
          setSenseStatus(`Nearest activity: ${nearestDist.toFixed(0)} km away`);
          setSenseQuake(`M ${nearest.mag.toFixed(1)} — ${nearest.place || 'unspecified'}`);
        } else {
          setSenseStatus('No significant activity within feed');
          setSenseQuake('Clear — no quakes ≥ M2.5 in past 24h');
        }
      } catch {
        setSenseStatus('Live feed unavailable');
        setSenseQuake('Could not reach USGS (offline or blocked)');
      }
    }
    fetchEarthquakes();
  }, [userLocation]);

  // Redraw shelter markers whenever the nearby-shelters list changes
    // Redraw shelter markers + real road-based evacuation routes whenever the list changes
  useEffect(() => {
    if (!mapRef.current || !shelterLayerRef.current || !userLocation) return;
    const map = mapRef.current;
    shelterLayerRef.current.clearLayers();

    if (shelters.length === 0) return;

    async function drawRoute(shelter) {
      const marker = L.marker([shelter.latitude, shelter.longitude], { icon: shelterIcon(shelter.status) })
        .addTo(shelterLayerRef.current);

      if (shelter.status === 'full') {
        marker.bindPopup(`<b>${shelter.name}</b><br>${shelter.zone || ''}<br>Status: full — not accepting evacuees`);
        return;
      }

      // Straight-line fallback shown immediately, replaced if OSRM responds
      const fallbackLine = L.polyline(
        [[userLocation.lat, userLocation.lng], [shelter.latitude, shelter.longitude]],
        { color: '#FFB020', weight: 2, dashArray: '6 6', opacity: 0.6 }
      ).addTo(shelterLayerRef.current);

      marker.bindPopup(`<b>${shelter.name}</b><br>${shelter.zone || ''}<br>Status: ${shelter.status}<br>Occupancy: ${shelter.occupied}/${shelter.capacity}<br>~${shelter.distanceKm.toFixed(1)} km (straight line)`);

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${shelter.longitude},${shelter.latitude}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          shelterLayerRef.current.removeLayer(fallbackLine);

          L.polyline(coords, { color: '#FFB020', weight: 3, opacity: 0.85 }).addTo(shelterLayerRef.current);

          const km = (route.distance / 1000).toFixed(1);
          const mins = Math.round(route.duration / 60);
          marker.setPopupContent(
            `<b>${shelter.name}</b><br>${shelter.zone || ''}<br>Status: ${shelter.status}<br>Occupancy: ${shelter.occupied}/${shelter.capacity}<br><b>${km} km by road · ~${mins} min drive</b>`
          );
        }
      } catch (err) {
        // OSRM unreachable — keep the straight-line fallback already drawn
      }
    }

    shelters.forEach(drawRoute);

    const bounds = L.latLngBounds([
      [userLocation.lat, userLocation.lng],
      ...shelters.map((s) => [s.latitude, s.longitude]),
    ]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [shelters, userLocation]);

  const shelterNote = !hasSheltersInDb
    ? 'No shelters registered yet — add some via the API to see them here.'
    : shelters.length > 0
    ? `Showing ${shelters.length} shelter(s) near your location`
    : 'No shelters within range of your location';

  return (
    <div className="card map-panel">
      <div className="card-head">
        <h2>Shelter &amp; Evacuation Map</h2>
        <span className="tag">{loadError ? 'Backend offline' : 'Live'}</span>
      </div>
      <div className="map-canvas">
        <div ref={mapDivRef} id="leafletMap"></div>

        <div className="sense-panel">
          <div className="sp-title"><span className="live-dot"></span>Live seismic feed · USGS</div>
          <div className="sp-row">{locationStatus}</div>
          <div className="sp-row">{senseStatus}</div>
          <div className="sp-row">{senseQuake}</div>
          <div className="sp-foot">{shelterNote}</div>
        </div>

        <div className="map-legend">
          <span><i style={{ background: 'var(--teal)' }}></i>Shelter open</span>
          <span><i style={{ background: 'var(--amber)' }}></i>Limited</span>
          <span><i style={{ background: 'var(--red)' }}></i>Full</span>
          <span><i style={{ background: 'var(--state-color)' }}></i>Your location</span>
          <span><i style={{ background: 'rgba(255,75,62,0.5)', border: '1px solid var(--red)' }}></i>Recent quake</span>
        </div>
      </div>
    </div>
  );
}