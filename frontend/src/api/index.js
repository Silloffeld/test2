const BASE = 'http://localhost:5000/api';

export async function fetchRoutes() {
  const res = await fetch(`${BASE}/routes`);
  if (!res.ok) throw new Error('Failed to fetch routes');
  return res.json();
}

export async function fetchRoute(id) {
  const res = await fetch(`${BASE}/routes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch route');
  return res.json();
}

export async function createRoute(data) {
  const res = await fetch(`${BASE}/routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create route');
  return res.json();
}

export async function updateRoute(id, data) {
  const res = await fetch(`${BASE}/routes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update route');
  return res.json();
}

export async function deleteRoute(id) {
  const res = await fetch(`${BASE}/routes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete route');
}

export async function uploadMap(routeId, file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${BASE}/routes/${routeId}/map`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) throw new Error('Failed to upload map');
  return res.json();
}

export async function createWaypoint(routeId, data) {
  const res = await fetch(`${BASE}/routes/${routeId}/waypoints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create waypoint');
  return res.json();
}

export async function updateWaypoint(routeId, waypointId, data) {
  const res = await fetch(`${BASE}/routes/${routeId}/waypoints/${waypointId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update waypoint');
  return res.json();
}

export async function deleteWaypoint(routeId, waypointId) {
  const res = await fetch(`${BASE}/routes/${routeId}/waypoints/${waypointId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete waypoint');
}

export async function reorderWaypoints(routeId, orderedIds) {
  const res = await fetch(`${BASE}/routes/${routeId}/waypoints/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderedIds),
  });
  if (!res.ok) throw new Error('Failed to reorder waypoints');
  return res.json();
}

export function mapImageUrl(fileName) {
  return `http://localhost:5000/maps/${fileName}`;
}
