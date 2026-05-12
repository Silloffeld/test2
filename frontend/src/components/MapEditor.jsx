import { useEffect, useRef, useState } from 'react';
import { mapImageUrl } from '../api';

/**
 * Admin map editor – click to place waypoints.
 * Props:
 *   mapImage (string|null) – file name served from backend
 *   waypoints (array)
 *   onAddWaypoint({ x, y }) – parent provides label dialog
 *   onDeleteWaypoint(id)
 *   onSelectWaypoint(id)
 *   selectedId (int|null)
 */
export default function MapEditor({
  mapImage,
  waypoints,
  onAddWaypoint,
  onDeleteWaypoint,
  onSelectWaypoint,
  selectedId,
}) {
  const containerRef = useRef(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const handleImageLoad = (e) => {
    setImgSize({ w: e.target.clientWidth, h: e.target.clientHeight });
  };

  const handleClick = (e) => {
    if (!mapImage) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onAddWaypoint({ x, y });
  };

  if (!mapImage) {
    return (
      <div className="map-placeholder">
        <p>Upload a building map to start placing waypoints.</p>
      </div>
    );
  }

  return (
    <div
      className="map-container"
      ref={containerRef}
      onClick={handleClick}
      title="Click to add a waypoint"
    >
      <img
        src={mapImageUrl(mapImage)}
        alt="Building map"
        className="map-image"
        onLoad={handleImageLoad}
        draggable={false}
      />
      <svg className="map-overlay">
        {/* Draw lines between waypoints */}
        {waypoints.length > 1 &&
          waypoints.slice(0, -1).map((wp, i) => (
            <line
              key={`line-${wp.id}`}
              x1={`${waypoints[i].x}%`}
              y1={`${waypoints[i].y}%`}
              x2={`${waypoints[i + 1].x}%`}
              y2={`${waypoints[i + 1].y}%`}
              stroke="#4f46e5"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          ))}
        {/* Draw dots */}
        {waypoints.map((wp, idx) => (
          <g
            key={wp.id}
            onClick={(e) => { e.stopPropagation(); onSelectWaypoint(wp.id); }}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={`${wp.x}%`}
              cy={`${wp.y}%`}
              r={selectedId === wp.id ? 16 : 12}
              fill={selectedId === wp.id ? '#f59e0b' : '#4f46e5'}
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={`${wp.x}%`}
              y={`${wp.y}%`}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="11"
              fontWeight="bold"
            >
              {idx + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
