import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchRoute,
  createRoute,
  updateRoute,
  uploadMap,
  createWaypoint,
  updateWaypoint,
  deleteWaypoint,
} from '../api';
import MapEditor from '../components/MapEditor';

export default function AdminPage() {
  const { id } = useParams(); // undefined when creating new route
  const navigate = useNavigate();
  const isNew = !id;

  const [routeName, setRouteName] = useState('');
  const [routeDesc, setRouteDesc] = useState('');
  const [mapImage, setMapImage] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [routeId, setRouteId] = useState(id ? Number(id) : null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  // Waypoint edit form state
  const [wpLabel, setWpLabel] = useState('');
  const [wpDesc, setWpDesc] = useState('');
  const [pendingCoords, setPendingCoords] = useState(null); // { x, y } waiting for label

  useEffect(() => {
    if (!isNew) {
      fetchRoute(id).then(r => {
        setRouteName(r.name);
        setRouteDesc(r.description || '');
        setMapImage(r.mapImagePath || null);
        setWaypoints(r.waypoints || []);
      });
    }
  }, [id, isNew]);

  const selectedWp = waypoints.find(w => w.id === selectedId) || null;

  useEffect(() => {
    if (selectedWp) {
      setWpLabel(selectedWp.label);
      setWpDesc(selectedWp.description || '');
    } else {
      setWpLabel('');
      setWpDesc('');
    }
  }, [selectedId]);

  // ── Save route metadata ──────────────────────────────────────────────────
  const saveRoute = async () => {
    if (!routeName.trim()) { setStatus('Route name is required.'); return; }
    setSaving(true);
    try {
      if (isNew) {
        const r = await createRoute({ name: routeName, description: routeDesc });
        setRouteId(r.id);
        navigate(`/admin/${r.id}`, { replace: true });
        setStatus('Route created! You can now upload a map and add waypoints.');
      } else {
        await updateRoute(routeId, { name: routeName, description: routeDesc });
        setStatus('Route saved.');
      }
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Upload map ───────────────────────────────────────────────────────────
  const handleMapUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!routeId) {
      setStatus('Please save the route first before uploading a map.');
      return;
    }
    try {
      const res = await uploadMap(routeId, file);
      setMapImage(res.mapImagePath);
      setStatus('Map uploaded!');
    } catch (err) {
      setStatus(`Map upload failed: ${err.message}`);
    }
  };

  // ── Add waypoint (called from MapEditor click) ───────────────────────────
  const handleAddWaypoint = ({ x, y }) => {
    if (!routeId) {
      setStatus('Please save the route first before adding waypoints.');
      return;
    }
    setPendingCoords({ x, y });
    setWpLabel('');
    setWpDesc('');
    setSelectedId(null);
  };

  const confirmAddWaypoint = async () => {
    if (!wpLabel.trim()) { setStatus('Label is required.'); return; }
    try {
      const wp = await createWaypoint(routeId, {
        label: wpLabel,
        description: wpDesc,
        x: pendingCoords.x,
        y: pendingCoords.y,
      });
      setWaypoints(prev => [...prev, wp]);
      setPendingCoords(null);
      setWpLabel('');
      setWpDesc('');
      setStatus('Waypoint added.');
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  };

  const cancelPending = () => {
    setPendingCoords(null);
    setWpLabel('');
    setWpDesc('');
  };

  // ── Update selected waypoint ─────────────────────────────────────────────
  const handleUpdateWaypoint = async () => {
    if (!selectedWp) return;
    if (!wpLabel.trim()) { setStatus('Label is required.'); return; }
    try {
      const updated = await updateWaypoint(routeId, selectedWp.id, {
        label: wpLabel,
        description: wpDesc,
        x: selectedWp.x,
        y: selectedWp.y,
      });
      setWaypoints(prev => prev.map(w => w.id === updated.id ? updated : w));
      setStatus('Waypoint updated.');
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  };

  // ── Delete selected waypoint ─────────────────────────────────────────────
  const handleDeleteWaypoint = async (wpId) => {
    if (!window.confirm('Delete this waypoint?')) return;
    try {
      await deleteWaypoint(routeId, wpId);
      setWaypoints(prev => {
        const remaining = prev.filter(w => w.id !== wpId);
        return remaining.map((w, i) => ({ ...w, order: i }));
      });
      setSelectedId(null);
      setStatus('Waypoint deleted.');
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isNew ? 'New Route' : 'Edit Route'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>← Back</button>
      </div>

      {status && <div className="status-bar">{status}</div>}

      {/* Route metadata */}
      <section className="card">
        <h2>Route Details</h2>
        <label className="field-label">Name *</label>
        <input
          className="field-input"
          value={routeName}
          onChange={e => setRouteName(e.target.value)}
          placeholder="e.g. Museum main floor tour"
        />
        <label className="field-label">Description</label>
        <textarea
          className="field-input"
          rows={2}
          value={routeDesc}
          onChange={e => setRouteDesc(e.target.value)}
          placeholder="Optional description shown to users"
        />
        <button className="btn btn-primary" onClick={saveRoute} disabled={saving}>
          {saving ? 'Saving…' : isNew ? 'Create Route' : 'Save Details'}
        </button>
      </section>

      {/* Map upload */}
      {routeId && (
        <section className="card">
          <h2>Building Map</h2>
          <p className="hint">Upload a floor plan image. Supported: PNG, JPG, SVG, WEBP.</p>
          <input type="file" accept="image/*" onChange={handleMapUpload} />
        </section>
      )}

      {/* Map editor + waypoints panel */}
      {routeId && (
        <section className="card editor-section">
          <h2>Waypoints</h2>
          <p className="hint">
            {mapImage
              ? 'Click anywhere on the map to add a waypoint.'
              : 'Upload a map to start placing waypoints.'}
          </p>

          <div className="editor-layout">
            <div className="editor-map-wrap">
              <MapEditor
                mapImage={mapImage}
                waypoints={waypoints}
                onAddWaypoint={handleAddWaypoint}
                onDeleteWaypoint={handleDeleteWaypoint}
                onSelectWaypoint={id => setSelectedId(id === selectedId ? null : id)}
                selectedId={selectedId}
              />
            </div>

            {/* Side panel */}
            <div className="editor-panel">
              {/* Pending new waypoint form */}
              {pendingCoords && (
                <div className="wp-form">
                  <h3>New Waypoint</h3>
                  <label className="field-label">Label *</label>
                  <input
                    className="field-input"
                    value={wpLabel}
                    onChange={e => setWpLabel(e.target.value)}
                    placeholder="e.g. Entrance"
                    autoFocus
                  />
                  <label className="field-label">Description</label>
                  <textarea
                    className="field-input"
                    rows={2}
                    value={wpDesc}
                    onChange={e => setWpDesc(e.target.value)}
                    placeholder="Optional instructions"
                  />
                  <div className="btn-row">
                    <button className="btn btn-primary" onClick={confirmAddWaypoint}>Add</button>
                    <button className="btn btn-secondary" onClick={cancelPending}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Selected waypoint edit form */}
              {selectedWp && !pendingCoords && (
                <div className="wp-form">
                  <h3>Edit Waypoint #{selectedWp.order + 1}</h3>
                  <label className="field-label">Label *</label>
                  <input
                    className="field-input"
                    value={wpLabel}
                    onChange={e => setWpLabel(e.target.value)}
                  />
                  <label className="field-label">Description</label>
                  <textarea
                    className="field-input"
                    rows={2}
                    value={wpDesc}
                    onChange={e => setWpDesc(e.target.value)}
                  />
                  <div className="btn-row">
                    <button className="btn btn-primary" onClick={handleUpdateWaypoint}>Save</button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteWaypoint(selectedWp.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Waypoint list */}
              {!pendingCoords && (
                <div className="wp-list">
                  <h3>All Waypoints ({waypoints.length})</h3>
                  {waypoints.length === 0 && <p className="hint">None yet.</p>}
                  {waypoints.map((wp, idx) => (
                    <div
                      key={wp.id}
                      className={`wp-item ${selectedId === wp.id ? 'wp-item--selected' : ''}`}
                      onClick={() => setSelectedId(wp.id === selectedId ? null : wp.id)}
                    >
                      <span className="wp-badge">{idx + 1}</span>
                      <span className="wp-label">{wp.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
