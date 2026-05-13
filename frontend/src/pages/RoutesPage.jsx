import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRoutes, deleteRoute } from '../api';

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    fetchRoutes()
      .then(setRoutes)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this route?')) return;
    try {
      await deleteRoute(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="loading">Loading routes…</div>;
  if (error)   return <div className="error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Building Walkthrough Routes</h1>
        <Link to="/admin/new" className="btn btn-primary">+ New Route</Link>
      </div>

      {routes.length === 0 ? (
        <div className="empty-state">
          <p>No routes yet.</p>
          <Link to="/admin/new" className="btn btn-primary">Create your first route</Link>
        </div>
      ) : (
        <div className="route-grid">
          {routes.map(route => (
            <div key={route.id} className="route-card">
              <div className="route-card-body">
                <h2 className="route-name">{route.name}</h2>
                {route.description && <p className="route-desc">{route.description}</p>}
                <p className="route-meta">
                  {route.waypoints.length} waypoint{route.waypoints.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="route-card-actions">
                <Link to={`/walk/${route.id}`} className="btn btn-success">▶ Walk</Link>
                <Link to={`/admin/${route.id}`} className="btn btn-secondary">✏ Edit</Link>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(route.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
