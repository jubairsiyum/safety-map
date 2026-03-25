# Community Safety Map

A web application for reporting and tracking safety incidents in your community. Users can mark locations on an interactive map and submit incident reports including details like incident type, severity, and descriptions.

## Features

- 🗺️ **Interactive Map**: Click anywhere on the map to select incident locations
- 📍 **Location-based Reporting**: Pinpoint exact incident locations with lat/long coordinates
- 🎨 **Color-coded Markers**: Different severity levels shown with distinct colors:
  - 🔴 Critical (Red)
  - 🟠 High (Orange)
  - 🟡 Medium (Yellow)
  - 🟢 Low (Green)
- 📋 **Incident Categories**: Robbery, Accident, Assault, Harassment, Other
- 🔍 **Filtering**: Filter incidents by type and severity
- 📊 **Statistics**: Real-time stats showing incident counts by severity
- 💾 **Database Storage**: All incidents stored in MongoDB
- 🔐 **Admin Login (Minimal)**: Simple credential-based login for submission review
- 🧾 **Admin Portal**: View submitted form responses in a protected dashboard

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Maps**: Leaflet.js with OpenStreetMap tiles
- **Database**: MongoDB with Mongoose
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas cloud instance)

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd safety-map
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set values:
```
MONGODB_URI=mongodb://localhost:27017/safety-map
MONGODB_FALLBACK_URI=mongodb://localhost:27017/safety-map
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### MongoDB Setup

#### Option 1: Local MongoDB
Install MongoDB Community Edition locally and start the service:
```bash
# On Windows
net start MongoDB

# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

#### Option 2: MongoDB Atlas (Cloud)
1. Create an account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string from the dashboard
4. Update `.env.local` with the connection string

## Admin Portal Setup (Step-by-Step)

1. Ensure all admin environment variables are set:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=strong-password-here
ADMIN_SESSION_SECRET=very-long-random-secret-min-32-chars
```

2. Start the app:
```bash
npm run dev
```

3. Open admin login:
- `http://localhost:3000/admin/login`

4. Sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

5. After login, submissions are loaded from protected backend route:
- `GET /api/admin/incidents`

6. Optional reliability fallback (recommended during Atlas TLS/network instability):
- Set `MONGODB_FALLBACK_URI` to a local MongoDB URI.
- If Atlas TLS handshake fails, the app automatically falls back to this URI.

### Backend Security Notes

- Admin session is stored in a signed `HttpOnly` cookie.
- Cookie is configured with `SameSite=Lax`, `Path=/`, and expiry.
- `secure` cookie flag is automatically enabled in production.
- Admin API routes validate session cookie before returning submission data.
- Keep `ADMIN_SESSION_SECRET` private and rotate it periodically.

## Usage

1. **View Incidents**: The map displays all reported incidents with color-coded markers
2. **Filter**: Use the dropdowns to filter by incident type and severity
3. **Report an Incident**:
   - Click on the map to select the location
   - Fill out the form with incident details
   - Submit the report
4. **Click Markers**: View full details of any incident by clicking on its marker
5. **Admin Review**:
  - Open `/admin/login`
  - Authenticate with admin credentials
  - Review submissions in the admin dashboard

## Project Structure

```
safety-map/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── incidents/
│   │   │       ├── route.ts          # GET/POST all incidents
│   │   │       └── [id]/
│   │   │           └── route.ts      # GET/PATCH/DELETE single incident
│   │   │   └── admin/
│   │   │       ├── login/route.ts    # Admin login route
│   │   │       ├── logout/route.ts   # Admin logout route
│   │   │       ├── session/route.ts  # Admin session status route
│   │   │       └── incidents/route.ts # Protected admin incidents route
│   │   ├── admin/
│   │   │   ├── login/page.tsx        # Admin login page
│   │   │   └── page.tsx              # Protected admin portal page
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Main application page
│   ├── components/
│   │   ├── AdminPortal.tsx           # Admin submissions dashboard
│   │   ├── IncidentForm.tsx          # Incident submission form
│   │   └── SafetyMap.tsx             # Interactive map component
│   ├── lib/
│   │   ├── adminAuth.ts              # Admin session and auth helpers
│   │   └── db.ts                     # MongoDB connection
│   └── models/
│       └── Incident.ts               # Mongoose schema
├── .env.local                        # Environment variables
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | Get all incidents |
| POST | `/api/incidents` | Create new incident |
| GET | `/api/incidents/:id` | Get single incident |
| PATCH | `/api/incidents/:id` | Update incident |
| DELETE | `/api/incidents/:id` | Delete incident |
| POST | `/api/admin/login` | Create admin session |
| POST | `/api/admin/logout` | Clear admin session |
| GET | `/api/admin/session` | Check admin auth status |
| GET | `/api/admin/incidents` | Get all incidents (admin only) |

## Data Model

```typescript
{
  title: string           // Incident title
  description: string      // Detailed description
  incidentType: enum       // robbery | accident | assault | harassment | other
  severity: enum           // low | medium | high | critical
  location: {
    lat: number           // Latitude
    lng: number           // Longitude
    address?: string       // Optional address
  }
  dateTime: Date          // When incident occurred
  reporterName?: string   // Optional reporter name
  reporterContact?: string // Optional contact info
  verified: boolean       // Verified status
  upvotes: number         // Community confirmations
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Make sure to:
1. Set `MONGODB_URI` environment variable
2. Run `npm run build` to create production build
3. Start with `npm start`

## Future Enhancements

- [ ] Image uploads for incident reports
- [ ] Email notifications for new incidents
- [ ] Mobile app (React Native/Flutter)
- [ ] Heatmap visualization of incident density
- [ ] SMS alerts for critical incidents
- [ ] Multi-language support (Bengali for Bangladesh)

## License

MIT License - Created for Final Year Project
