const Alert = require('../models/Alert');

// Reference point for your coastal sector — adjust to your actual location
const REFERENCE = { lat: 13.0827, lng: 80.2707 }; // Chennai coast

// Tracks which quakes we've already reacted to (resets on server restart)
const seenQuakeIds = new Set();

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function checkSeismicActivity(io) {
  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson');
    const data = await res.json();

    for (const f of data.features) {
      const id = f.id;
      if (seenQuakeIds.has(id)) continue;
      seenQuakeIds.add(id);

      const [lng, lat] = f.geometry.coordinates;
      const mag = f.properties.mag;
      const distanceKm = haversineKm(REFERENCE.lat, REFERENCE.lng, lat, lng);

      // Simplified demo thresholds — NOT a scientifically validated tsunami model
      let level = null;
      if (mag >= 7.0 && distanceKm <= 3000) level = 'warning';
      else if (mag >= 5.5 && distanceKm <= 2000) level = 'watch';

      if (level) {
        const message = `Automated sensor alert: M${mag.toFixed(1)} earthquake detected ${distanceKm.toFixed(
          0
        )} km from coast (${f.properties.place || 'unspecified'}). Auto-escalated to ${level.toUpperCase()}.`;
        const alert = new Alert({ level, message });
        const saved = await alert.save();
        io.emit('newAlert', saved);
        console.log(`[AUTO-MONITOR] Escalated to ${level.toUpperCase()}: ${f.properties.place}`);
      }
    }
  } catch (err) {
    console.log('[AUTO-MONITOR] Could not reach seismic feed:', err.message);
  }
}

function startAutoMonitor(io) {
  checkSeismicActivity(io); // run once on startup
  setInterval(() => checkSeismicActivity(io), 2 * 60 * 1000); // then every 2 minutes
}

module.exports = startAutoMonitor;