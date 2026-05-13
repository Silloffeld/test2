import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { fetchRoute } from '../api';
import MapViewer from '../components/MapViewer';

export default function WalkthroughPage() {
  const { id } = useParams();
  const [route, setRoute] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchRoute(id)
      .then(setRoute)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading…</div>;
  if (error)   return <div className="error">Error: {error}</div>;
  if (!route)  return <div className="error">Route not found.</div>;

  const waypoints = route.waypoints || [];
  const isComplete = currentIndex >= waypoints.length;
  const current = waypoints[currentIndex];
  const walkthroughUrl = window.location.href;

  const next = () => setCurrentIndex(i => Math.min(i + 1, waypoints.length));
  const prev = () => setCurrentIndex(i => Math.max(i - 1, 0));
  const restart = () => setCurrentIndex(0);

  return (
    <div className="page walkthrough-page">
      <div className="page-header">
        <Link to="/" className="btn btn-secondary">← Routes</Link>
        <h1 className="route-title">{route.name}</h1>
        <button
          className="btn btn-secondary"
          onClick={() => setShowQR(v => !v)}
          title="Show QR code"
        >
          QR
        </button>
      </div>

      {route.description && <p className="route-desc walkthrough-desc">{route.description}</p>}

      {/* QR code modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Scan to open this walkthrough</h2>
            <QRCodeSVG value={walkthroughUrl} size={220} />
            <p className="qr-url">{walkthroughUrl}</p>
            <button className="btn btn-secondary" onClick={() => setShowQR(false)}>Close</button>
          </div>
        </div>
      )}

      {waypoints.length === 0 ? (
        <div className="empty-state">
          <p>This route has no waypoints yet.</p>
          <Link to={`/admin/${id}`} className="btn btn-primary">Edit Route</Link>
        </div>
      ) : (
        <div className="walkthrough-layout">
          {/* Map */}
          <div className="walkthrough-map">
            <MapViewer
              mapImage={route.mapImagePath}
              waypoints={waypoints}
              currentIndex={isComplete ? waypoints.length : currentIndex}
            />
          </div>

          {/* Step panel */}
          <div className="walkthrough-panel">
            {/* Progress bar */}
            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{ width: `${(currentIndex / waypoints.length) * 100}%` }}
              />
            </div>
            <p className="progress-text">
              {isComplete ? 'Complete!' : `Step ${currentIndex + 1} of ${waypoints.length}`}
            </p>

            {/* Current step info */}
            {isComplete ? (
              <div className="step-card step-card--done">
                <div className="step-icon">🎉</div>
                <h2>You finished the walkthrough!</h2>
                <button className="btn btn-primary" onClick={restart}>Start Over</button>
              </div>
            ) : (
              <div className="step-card">
                <div className="step-number">#{currentIndex + 1}</div>
                <h2 className="step-label">{current.label}</h2>
                {current.description && (
                  <p className="step-desc">{current.description}</p>
                )}
              </div>
            )}

            {/* Navigation */}
            {!isComplete && (
              <div className="step-nav">
                <button
                  className="btn btn-secondary"
                  onClick={prev}
                  disabled={currentIndex === 0}
                >
                  ← Previous
                </button>
                <button className="btn btn-primary" onClick={next}>
                  {currentIndex === waypoints.length - 1 ? 'Finish ✓' : 'Next →'}
                </button>
              </div>
            )}

            {/* Waypoint list */}
            <div className="wp-list wp-list--walk">
              <h3>All stops</h3>
              {waypoints.map((wp, idx) => (
                <div
                  key={wp.id}
                  className={`wp-item ${idx === currentIndex && !isComplete ? 'wp-item--selected' : ''} ${idx < currentIndex ? 'wp-item--done' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="wp-badge">
                    {idx < currentIndex ? '✓' : idx + 1}
                  </span>
                  <span className="wp-label">{wp.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
