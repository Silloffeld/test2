import { mapImageUrl } from '../api';

/**
 * Read-only map viewer for the user walkthrough.
 * Shows the full route and highlights the current waypoint.
 */
export default function MapViewer({ mapImage, waypoints, currentIndex }) {
  if (!mapImage) {
    return (
      <div className="map-placeholder">
        <p>No map available for this route.</p>
      </div>
    );
  }

  return (
    <div className="map-container map-container--viewer">
      <img
        src={mapImageUrl(mapImage)}
        alt="Building map"
        className="map-image"
        draggable={false}
      />
      <svg className="map-overlay">
        {/* Route lines – completed in solid, upcoming dashed */}
        {waypoints.length > 1 &&
          waypoints.slice(0, -1).map((wp, i) => (
            <line
              key={`line-${wp.id}`}
              x1={`${waypoints[i].x}%`}
              y1={`${waypoints[i].y}%`}
              x2={`${waypoints[i + 1].x}%`}
              y2={`${waypoints[i + 1].y}%`}
              stroke={i < currentIndex ? '#22c55e' : '#94a3b8'}
              strokeWidth="2.5"
              strokeDasharray={i < currentIndex ? undefined : '6 4'}
            />
          ))}

        {/* Waypoint dots */}
        {waypoints.map((wp, idx) => {
          const isCurrent = idx === currentIndex;
          const isDone    = idx < currentIndex;
          return (
            <g key={wp.id}>
              {isCurrent && (
                <circle
                  cx={`${wp.x}%`}
                  cy={`${wp.y}%`}
                  r="22"
                  fill="#f59e0b"
                  opacity="0.3"
                />
              )}
              <circle
                cx={`${wp.x}%`}
                cy={`${wp.y}%`}
                r={isCurrent ? 16 : 11}
                fill={isCurrent ? '#f59e0b' : isDone ? '#22c55e' : '#94a3b8'}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={`${wp.x}%`}
                y={`${wp.y}%`}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={isCurrent ? 12 : 10}
                fontWeight="bold"
              >
                {isDone ? '✓' : idx + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
