# Brown University ELI Platform - TODO

## Phase 1: Foundation
- [x] Database schema (buildings, floors, cameras, events, incidents, tracked_entities, location_events, alerts, config)
- [x] Dark command center theme with Brown University branding
- [x] Global styling and design system
- [x] Switch to Neon PostgreSQL database
- [x] Update schema for PostgreSQL compatibility
- [x] Seed database with mock data (10 buildings, 34 floors, 666 cameras, 500 entities, 50 alerts, 15 incidents)

## Phase 2: Authentication & Landing
- [x] Landing page with hero section, features, and demo login
- [x] Demo authentication (admin/admin credentials)
- [x] Protected routes and role-based access
- [x] Dashboard layout with sidebar navigation

## Phase 3: Floor Plan Generation
- [x] Generate Barus & Holley floor plan image
- [x] Generate Sciences Library (SciLi) floor plan image
- [x] Generate Keeney Quad floor plan image
- [x] Generate Main Green floor plan image
- [x] Generate Faunce House floor plan image
- [x] Generate Wilson Hall floor plan image
- [x] Generate Sayles Hall floor plan image
- [x] Generate MacMillan Hall floor plan image
- [x] Generate Pembroke Hall floor plan image

## Phase 4: Real-Time Location Tracking Dashboard
- [x] Interactive 2D floor plan viewer with zoom/pan
- [x] Real-time entity position rendering
- [x] Building/floor selector
- [x] History trail toggle (30min default, configurable)
- [x] Color-coded icons by role (staff, students, visitors, unknown, alerts)
- [x] Layer toggles (entities, cameras, sensors, zones)
- [x] Search by name functionality
- [x] Role filter dropdown
- [ ] WebSocket connection for live updates (using polling currently)
- [ ] Entity details panel on click

## Phase 5: Camera Monitoring Dashboard
- [x] Camera grid view (virtualized for ~800 cameras)
- [x] Camera status indicators (online/offline/maintenance)
- [x] AI-enabled camera badges
- [x] Grid size options (2x2, 3x3, 4x4)
- [x] Search and filter by building/status
- [x] Pagination for camera feeds
- [ ] Single camera full-screen view
- [ ] Mock HLS video streams
- [ ] Alert overlay on camera feeds

## Phase 6: Alerts & Activity Dashboard
- [x] Real-time alert feed with severity badges
- [x] Filtering by severity and type
- [x] Status tabs (All, Active, Acknowledged, Resolved)
- [x] AI confidence display
- [x] Location and timestamp display
- [x] Acknowledge/Resolve action buttons
- [ ] Correlation clusters view
- [ ] One-click incident creation from alerts

## Phase 7: Incident Management
- [x] Incident list with status and priority
- [x] Building location display
- [ ] Incident detail view
- [ ] Timeline visualization
- [ ] Response team assignment
- [ ] Escalation workflows

## Phase 8: Entity Management
- [x] Entity list with role and risk score
- [x] Watchlist indicator
- [x] Last seen location and time
- [ ] Entity detail view with movement history
- [ ] Watchlist management

## Phase 9: Dashboard Overview
- [x] Stats cards (entities, alerts, cameras, incidents)
- [x] Recent alerts feed
- [x] Entity breakdown by role
- [x] Quick action buttons
- [x] Recent incidents list
- [x] Auto-refresh every 10 seconds

## Phase 10: Mock Data & Integration
- [x] Mock data generation script
- [x] Database seeding with realistic data
- [ ] Simulated entity movements (real-time)
- [ ] Camera event simulation
- [ ] Door access event simulation
- [ ] Wi-Fi location update simulation
- [ ] Alert trigger simulation

## Phase 11: API & Integration Endpoints
- [ ] Webhook endpoint for IREX cameras
- [ ] Access control integration endpoint
- [ ] Motion sensor integration endpoint
- [ ] Cisco Catalyst Center integration endpoint
- [ ] Facial recognition integration endpoint
- [ ] Phone signature integration endpoint

## Future Enhancements (Post-Demo)
- [ ] WebSocket real-time updates (replace polling)
- [ ] Neo4j topology graph integration
- [ ] Cloudinary image storage
- [ ] Google AI Vision integration
- [ ] Predictive analytics
- [ ] 800 MHz radio dispatch integration
- [ ] CALEA compliance reporting
- [ ] Mobile app companion
- [ ] B-roll video integration on landing page
- [ ] Presentation/documentation section
- [ ] Sales materials download
