import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
import axios from 'axios';
import { haversineKm } from '../utils/geo';

export default function LiveFeed({ userLocation }) {
  const [items, setItems] = useState([]);
  const seenQuakeIds = useRef(new Set());
  const firstPoll = useRef(true);

  function addItem(item) {
    setItems((prev) => [item, ...prev].slice(0, 30));
  }

  // Load past alerts + listen for real-time broadcasts
  useEffect(() => {
    axios.get('http://localhost:5000/api/alerts').then((res) => {
      const initial = res.data.map((a) => ({
        id: `alert-${a._id}`,
        time: new Date(a.createdAt).toLocaleTimeString('en-GB'),
        tag: a.level === 'warning' ? 'dispatch' : a.level === 'watch' ? 'advisory' : 'system',
        text: a.message,
      }));
      setItems(initial);
    });

    socket.on('newAlert', (alert) => {
      addItem({
        id: `alert-${alert._id}`,
        time: new Date(alert.createdAt).toLocaleTimeString('en-GB'),
        tag: alert.level === 'warning' ? 'dispatch' : alert.level === 'watch' ? 'advisory' : 'system',
        text: alert.message,
      });
    });

    return () => socket.off('newAlert');
  }, []);

  // Poll real earthquake data (USGS) and surface genuinely new events
  useEffect(() => {
    if (!userLocation) return;

    async function pollQuakes() {
      try {
        const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson');
        const data = await res.json();

        const quakes = data.features
          .map((f) => ({
            id: f.id,
            mag: f.properties.mag,
            place: f.properties.place,
            time: f.properties.time,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          }))
          .map((q) => ({ ...q, distanceKm: haversineKm(userLocation.lat, userLocation.lng, q.lat, q.lng) }))
          .sort((a, b) => a.distanceKm - b.distanceKm);

        const newOnes = quakes.filter((q) => !seenQuakeIds.current.has(q.id));

        // On the very first poll, just mark everything as seen (don't flood the feed with history)
        if (firstPoll.current) {
          quakes.forEach((q) => seenQuakeIds.current.add(q.id));
          firstPoll.current = false;
          // still show the single nearest one so the feed isn't empty
          if (quakes.length > 0) {
            const q = quakes[0];
            addItem({
              id: `quake-${q.id}`,
              time: new Date(q.time).toLocaleTimeString('en-GB'),
              tag: 'sensor',
              text: `Nearest tracked seismic event: M${q.mag.toFixed(1)} — ${q.place || 'unspecified'} (${q.distanceKm.toFixed(0)} km away)`,
            });
          }
          return;
        }

        newOnes.forEach((q) => {
          seenQuakeIds.current.add(q.id);
          addItem({
            id: `quake-${q.id}`,
            time: new Date(q.time).toLocaleTimeString('en-GB'),
            tag: 'sensor',
            text: `New seismic event detected: M${q.mag.toFixed(1)} — ${q.place || 'unspecified'} (${q.distanceKm.toFixed(0)} km away)`,
          });
        });
      } catch (err) {
        // Silently skip — network hiccups shouldn't spam the feed with error messages
      }
    }

    pollQuakes();
    const id = setInterval(pollQuakes, 60000);
    return () => clearInterval(id);
  }, [userLocation]);

  return (
    <div className="card">
      <div className="card-head">
        <h2>Live Feed</h2>
        <span className="tag">Auto-updating</span>
      </div>
      <div className="feed-list">
        {items.length === 0 ? (
          <div style={{ padding: '20px 16px', color: 'var(--text-dim)', fontSize: '13px' }}>
            No activity yet.
          </div>
        ) : (
          items.map((item) => (
            <div className="feed-item" key={item.id}>
              <span className="feed-time mono">{item.time}</span>
              <span className="feed-body">
                <span className={`feed-tag ${item.tag}`}>{item.tag}</span>
                {item.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}