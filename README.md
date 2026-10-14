# COASTGUARD — Tsunami Alert & Evacuation Management System

A location-aware disaster-management web application designed to support coastal risk awareness and evacuation coordination. COASTGUARD brings an interactive map, registered shelter information, and public earthquake data into one dashboard.

> **Safety note:** COASTGUARD is an academic/project system. Earthquake information is not confirmation of a tsunami. Always follow official warnings and instructions from the relevant disaster-management authorities.

## Project Objectives

- Detect the user's current location when browser permission is granted.
- Display an interactive map using Leaflet and OpenStreetMap.
- Retrieve registered shelters from a backend API.
- Show shelter coordinates, capacity, occupancy, and availability status.
- Display public earthquake information from the USGS GeoJSON feed.
- Help users understand nearby registered shelters using geographic distance calculations.
- Provide a centralized interface for disaster-awareness and shelter coordination.

## Main Features

- **Location-aware map:** Requests browser geolocation and centers the map on the detected location.
- **Shelter management:** Stores and retrieves shelter records through an Express REST API and MongoDB.
- **Shelter status display:** Presents shelter capacity, occupancy, and status such as `open`, `limited`, or `full`.
- **Distance calculation:** Calculates approximate great-circle distance between the user's coordinates and registered shelters.
- **Earthquake awareness:** Retrieves public earthquake data from USGS and displays event locations and magnitudes.
- **Fallback handling:** Can display a fallback map location if geolocation is unavailable or permission is denied.
- **Responsive operations dashboard:** Organizes map, shelter information, and event information in one interface.

> Shelter results depend on the shelters registered in the database. The application does not automatically have a complete directory of shelters worldwide.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, JavaScript, CSS |
| Map | Leaflet, OpenStreetMap |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, MongoDB driver/Mongoose if configured |
| API requests | Fetch API or Axios, depending on the component |
| Earthquake data | USGS public GeoJSON feed |
| Development tools | VS Code, npm, Git, GitHub, Postman |

## Project Structure

```text
tsunami-alert-system/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── ...
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

The exact structure may vary as the project develops.

## Prerequisites

- [Node.js and npm](https://nodejs.org/)
- [Git](https://git-scm.com/)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account or another MongoDB instance
- A modern browser with geolocation support
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/prince87s/COASTGUARD-Tsunami-Management.git
cd COASTGUARD-Tsunami-Management
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` using the variable names expected by your backend code. For example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Replace the placeholder with your own MongoDB connection string. Do not commit `.env` or share database credentials publicly. Check `server.js` and your database configuration to confirm the exact environment variable names used by your current implementation.

Start the backend:

```bash
node server.js
```

The backend should start on the configured port, commonly `5000`. Confirm the terminal reports a successful database connection if MongoDB is configured.

### 3. Configure the frontend

Open a second terminal at the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal, commonly `http://localhost:5173`.

If the frontend API helper uses a fixed backend URL, make sure it points to your running backend. For local development, this may be `http://localhost:5000/api`.

## Shelter API

The backend shelter endpoint used by the frontend is expected to be:

```text
GET  /api/shelters
POST /api/shelters
```

The precise routes and accepted fields depend on the current backend implementation. Confirm them in the files under `backend/routes/` before testing.

Example shelter request body, if these fields match your API schema:

```json
{
  "name": "Community Hall",
  "zone": "Zone B",
  "latitude": 13.05,
  "longitude": 80.25,
  "capacity": 300,
  "occupied": 243,
  "status": "limited"
}
```

Send the request to the running backend using Postman or another API client. Use `GET /api/shelters` to verify that the record was saved and returned.

### Shelter data notes

- Latitude must be between `-90` and `90`.
- Longitude must be between `-180` and `180`.
- Occupancy should not exceed capacity.
- Use status values accepted by your backend, such as `open`, `limited`, and `full`.
- Only add real, verified shelter locations. Sample records should be clearly identified as demo data.

## Location and Map Behavior

1. The browser asks the user for location permission.
2. If permission is granted, the map can center on the user's coordinates.
3. The application calculates distances to shelters returned by the backend.
4. The map can prioritize nearby shelters based on the distance filter implemented in the frontend.
5. If location permission is denied or unavailable, the app may use a configured fallback location.

Geolocation generally requires a secure context such as HTTPS, or localhost during development. Users can deny location access and may need to enable location permissions in their browser settings.

## Earthquake Data and Limitations

COASTGUARD can use the USGS public earthquake feed:

- [USGS Earthquake GeoJSON feeds](https://earthquake.usgs.gov/earthquakemap/feed/v1.0/geojson.php)
- Example feed for magnitude 2.5+ earthquakes during the past day:  
  `https://earthquake.usgs.gov/earthquakemap/feed/v1.0/summary/2.5_day.geojson`

The feed provides earthquake event information, not direct tsunami confirmation. A tsunami-warning capability would require appropriate authoritative warning sources, validated integration, and careful handling of official alerts. Do not present this project as an official emergency-warning service.

## Testing Checklist

- [ ] Backend starts without errors.
- [ ] MongoDB connection succeeds.
- [ ] `GET /api/shelters` returns the expected response.
- [ ] A shelter can be created if the POST endpoint is implemented.
- [ ] Frontend starts successfully.
- [ ] Map tiles load.
- [ ] Browser location permission is handled correctly.
- [ ] Shelter markers and occupancy information match API data.
- [ ] Earthquake feed loading and failure states are handled.
- [ ] No `.env` files or credentials are tracked by Git.

## Security

- Keep `.env`, access tokens, passwords, and private keys out of Git.
- Store production secrets in your hosting provider's environment settings.
- Restrict database network access and use a least-privilege database user.
- Validate and sanitize API inputs on the backend.
- Add authentication and authorization before allowing public users to modify shelter records.
- Do not rely on this academic application as the sole source of emergency information.

If a credential has ever been committed to a repository, rotate it immediately; deleting the file in a later commit does not remove it from Git history.

## Current Project Scope

The project focuses on location-aware mapping, registered shelter data, and earthquake awareness. Global map coverage does not automatically mean global shelter coverage: shelter locations must be entered or obtained from a reliable data source. Authentication, administrative controls, authoritative tsunami-warning integration, and other planned features should be described as complete only after they have been implemented and tested.

## Future Enhancements

- Integrate verified shelter datasets from authorized sources.
- Add secure administrator login and role-based access.
- Add shelter create, update, and delete workflows with validation.
- Improve nearby-shelter search with server-side geographic queries.
- Integrate authoritative warning sources where access and terms permit.
- Add automated tests, deployment configuration, monitoring, and accessibility improvements.
- Add multilingual guidance and accessible emergency information.

## Author

**Prince Jacob S**  
Project: COASTGUARD — Tsunami Alert & Evacuation Management System  
Roll Number: 310624205203

## License

No license has been specified yet. Unless a license is added, reuse and redistribution are subject to the default copyright rules. Add an appropriate open-source license if you intend to permit reuse.
