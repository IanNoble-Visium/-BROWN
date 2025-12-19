# Brown University ELI Platform - Local Setup Guide

## Prerequisites

- Node.js 18+ (recommended: 22.x)
- pnpm (install with `npm install -g pnpm`)
- PostgreSQL database (or use the included Neon connection)

## Quick Start

1. **Extract the zip file:**
   ```bash
   unzip brown-eli-platform.zip
   cd brown-eli
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   # Database (use your own PostgreSQL or the provided Neon connection)
   NEON_DATABASE_URL=postgresql://neondb_owner:npg_D42lIEBRjvHq@ep-little-hat-ahtfclxj-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   
   # JWT Secret for session management
   JWT_SECRET=your-secret-key-here
   
   # App configuration
   VITE_APP_TITLE=Brown University ELI Platform
   ```

4. **Push database schema (if using a new database):**
   ```bash
   pnpm db:push
   ```

5. **Seed the database with mock data:**
   ```bash
   npx tsx server/seed.ts
   ```

6. **Start the development server:**
   ```bash
   pnpm dev
   ```

7. **Open in browser:**
   Navigate to `http://localhost:3000`

## Demo Login

- **Username:** admin
- **Password:** admin

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests |
| `pnpm db:push` | Push schema changes to database |

## Project Structure

```
brown-eli/
├── client/           # React frontend
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # Reusable UI components
│   │   └── lib/      # Utilities and tRPC client
│   └── public/       # Static assets (floor plans)
├── server/           # Express + tRPC backend
│   ├── routers.ts    # API endpoints
│   ├── db.ts         # Database connection
│   └── seed.ts       # Mock data seeder
├── drizzle/          # Database schema
└── shared/           # Shared types and constants
```

## Features

- Real-time location tracking with interactive floor plans
- Camera monitoring dashboard (666 cameras)
- Alert management with severity filtering
- Incident tracking and management
- Entity tracking with watchlist support
- Dark command center theme with Brown University branding

## Database

The application uses PostgreSQL with Drizzle ORM. The schema includes:
- Buildings, Floors, Zones
- Cameras, Sensors, Access Readers, WiFi Access Points
- Tracked Entities, Location Events
- Alerts, Incidents, Events
- Audit Logs, Demo Scenarios

## Notes

- The floor plan images are located in `client/public/floorplans/`
- Mock data includes 10 Brown University buildings with realistic campus data
- All tests should pass with `pnpm test`
