import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';

const API = 'http://localhost:5000/api/shelters';
const emptyForm = { name: '', zone: '', latitude: '', longitude: '', capacity: '', occupied: '', status: 'open' };

export default function AdminPanel({ shelters, onClose, onRefresh }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize the mini picker map once
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(mapDivRef.current).setView([13.0827, 80.2707], 10);
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
      setForm((prev) => ({
        ...prev,
        latitude: e.latlng.lat.toFixed(6),
        longitude: e.latlng.lng.toFixed(6),
      }));
    });

    // Fix rendering inside a modal (Leaflet needs a nudge when container size settles)
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  function placeMarker(lat, lng) {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) map.removeLayer(markerRef.current);
    markerRef.current = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], map.getZoom() < 10 ? 12 : map.getZoom());
  }

  function authHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  function startEdit(s) {
    setEditingId(s._id);
    setForm({
      name: s.name, zone: s.zone, latitude: s.latitude, longitude: s.longitude,
      capacity: s.capacity, occupied: s.occupied, status: s.status,
    });
    placeMarker(s.latitude, s.longitude);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.latitude || !form.longitude) {
      setError('Please click on the map to set a location before saving.');
      return;
    }
    if (!form.name || !form.zone || !form.capacity) {
      setError('Please fill in name, zone, and capacity.');
      return;
    }

    setBusy(true);
    const payload = {
      name: form.name,
      zone: form.zone,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      capacity: parseInt(form.capacity, 10),
      occupied: parseInt(form.occupied, 10) || 0,
      status: form.status,
    };

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, payload, authHeaders());
      } else {
        await axios.post(API, payload, authHeaders());
      }
      resetForm();
      onRefresh();
    } catch (err) {
      console.error('Save shelter failed:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Save failed — check console for details');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this shelter?')) return;
    try {
      await axios.delete(`${API}/${id}`, authHeaders());
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 className="display" style={{ margin: 0, fontSize: '16px' }}>Manage Shelters</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px' }}>
            Click on the map to set the shelter's location
          </div>
          <div ref={mapDivRef} style={mapPickerStyle}></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input placeholder="Zone / description" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} style={inputStyle} />
            <input placeholder="Latitude (click map)" value={form.latitude} readOnly style={{ ...inputStyle, opacity: 0.7 }} />
            <input placeholder="Longitude (click map)" value={form.longitude} readOnly style={{ ...inputStyle, opacity: 0.7 }} />
            <input placeholder="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} style={inputStyle} />
            <input placeholder="Occupied" type="number" value={form.occupied} onChange={(e) => setForm({ ...form, occupied: e.target.value })} style={inputStyle} />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
  <option value="open">Auto (based on occupancy)</option>
  <option value="closed">Force Closed</option>
</select>
         </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button type="submit" disabled={busy} style={{ ...btnStyle, background: 'var(--teal)', color: '#0A1420', flex: 1 }}>
              {busy ? 'Saving…' : editingId ? 'Update Shelter' : 'Add Shelter'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ ...btnStyle, background: 'transparent', color: 'var(--text-dim)' }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}

        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {shelters.map((s) => (
            <div key={s._id} style={rowStyle}>
              <div>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{s.zone} · {s.occupied}/{s.capacity} · {s.status}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => startEdit(s)} style={smallBtnStyle}>Edit</button>
                <button onClick={() => handleDelete(s._id)} style={{ ...smallBtnStyle, color: 'var(--red)' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(10,20,32,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const panelStyle = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '10px', padding: '24px', width: '560px', maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto' };
const mapPickerStyle = { height: '220px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--line)' };
const inputStyle = { padding: '9px 10px', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--text)', fontSize: '13px', outline: 'none' };
const btnStyle = { padding: '9px 0', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' };
const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)', color: 'var(--text)', fontSize: '13px' };
const smallBtnStyle = { fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--line)', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer' };
const closeBtnStyle = { background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '16px', cursor: 'pointer' };