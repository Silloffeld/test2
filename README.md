# Building Walkthrough App

A full-stack building walkthrough system built with **ASP.NET Core 10** (C#) and **React + Vite**.

## Features

### Admin
- Create named routes with an optional description
- Upload a floor-plan image as the background map
- Click anywhere on the map to place numbered waypoints (with label + description)
- Edit or delete individual waypoints
- All data persisted in SQLite via Entity Framework Core

### User
- Browse the list of available routes
- Scan a **QR code** to open a route directly on mobile
- Step-by-step walkthrough: progress bar, current waypoint highlighted on the map
- Completed waypoints shown in green; upcoming ones shown with a dashed line

## Project structure

```
/
├── backend/   – ASP.NET Core 10 Web API
│   ├── Models/      Route.cs, Waypoint.cs
│   ├── Data/        AppDbContext.cs (EF Core + SQLite)
│   └── Controllers/ RoutesController.cs, WaypointsController.cs
└── frontend/  – React + Vite SPA
    └── src/
        ├── api/         API client (fetch wrappers)
        ├── components/  MapEditor, MapViewer
        └── pages/       RoutesPage, AdminPage, WalkthroughPage
```

## Getting started

### Backend (requires .NET 10 SDK)

```bash
cd backend
dotnet run
# Listens on http://localhost:5000
# SQLite database created automatically as walkthrough.db
```

### Frontend (requires Node 18+)

```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:5173
```

## API overview

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/routes` | List all routes |
| POST | `/api/routes` | Create a route |
| GET | `/api/routes/{id}` | Get route with waypoints |
| PUT | `/api/routes/{id}` | Update route name/description |
| DELETE | `/api/routes/{id}` | Delete route (cascade) |
| POST | `/api/routes/{id}/map` | Upload floor-plan image |
| GET | `/api/routes/{id}/waypoints` | List waypoints |
| POST | `/api/routes/{id}/waypoints` | Add a waypoint |
| PUT | `/api/routes/{id}/waypoints/{wid}` | Update waypoint |
| DELETE | `/api/routes/{id}/waypoints/{wid}` | Delete waypoint |
| PUT | `/api/routes/{id}/waypoints/reorder` | Reorder waypoints |

Map images are served as static files from `backend/wwwroot/maps/`.
