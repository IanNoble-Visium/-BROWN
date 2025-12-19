import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { 
  buildings, floors, cameras, sensors, accessReaders, wifiAccessPoints,
  trackedEntities, locationEvents, events, alerts, incidents, zones
} from "../drizzle/schema";

const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("Database URL not configured");
}

const client = neon(dbUrl);
const db = drizzle(client);

// Brown University Buildings
const buildingsData = [
  { name: "Barus & Holley", code: "BH", address: "184 Hope St", floorsCount: 4, latitude: "41.8268", longitude: "-71.4025", description: "Engineering building with labs and classrooms" },
  { name: "Sciences Library (SciLi)", code: "SL", address: "210 Thayer St", floorsCount: 14, latitude: "41.8272", longitude: "-71.4003", description: "Main science library, iconic brutalist tower" },
  { name: "Keeney Quadrangle", code: "KQ", address: "45 Charlesfield St", floorsCount: 4, latitude: "41.8235", longitude: "-71.4012", description: "Freshman dormitory complex" },
  { name: "Faunce House", code: "FH", address: "75 Waterman St", floorsCount: 3, latitude: "41.8267", longitude: "-71.4018", description: "Student center with dining and activities" },
  { name: "Main Green", code: "MG", address: "College St", floorsCount: 1, latitude: "41.8262", longitude: "-71.4028", description: "Central campus green space" },
  { name: "Wilson Hall", code: "WH", address: "69 Brown St", floorsCount: 4, latitude: "41.8258", longitude: "-71.4035", description: "Academic building" },
  { name: "Sayles Hall", code: "SH", address: "79 Waterman St", floorsCount: 3, latitude: "41.8265", longitude: "-71.4022", description: "Historic assembly hall" },
  { name: "MacMillan Hall", code: "MM", address: "167 Thayer St", floorsCount: 4, latitude: "41.8275", longitude: "-71.4008", description: "Engineering and physics building" },
  { name: "Pembroke Hall", code: "PH", address: "172 Meeting St", floorsCount: 3, latitude: "41.8280", longitude: "-71.4015", description: "Historic academic building" },
  { name: "John Hay Library", code: "JH", address: "20 Prospect St", floorsCount: 5, latitude: "41.8260", longitude: "-71.4040", description: "Special collections library" },
];

// Floor plans mapping
const floorPlanUrls: Record<string, string> = {
  "BH-1": "/floorplans/barus-holley-1.png",
  "BH-2": "/floorplans/barus-holley-2.png",
  "SL-1": "/floorplans/sciences-library-1.png",
  "KQ-1": "/floorplans/keeney-quad-1.png",
  "FH-1": "/floorplans/faunce-house-1.png",
  "MG-1": "/floorplans/main-green-1.png",
  "WH-1": "/floorplans/wilson-hall-1.png",
  "SH-1": "/floorplans/sayles-hall-1.png",
  "MM-1": "/floorplans/macmillan-hall-1.png",
  "PH-1": "/floorplans/pembroke-hall-1.png",
};

// Camera types
const cameraTypes = ["dome", "bullet", "ptz", "fisheye", "thermal"] as const;
const cameraStatuses = ["online", "offline", "maintenance", "error"] as const;

// Sensor types
const sensorTypes = ["motion", "glass_break", "smoke", "temperature", "occupancy"] as const;

// Entity roles
const entityRoles = ["staff", "student", "visitor", "contractor", "unknown"] as const;

// Alert types and severities
const alertTypes = ["weapon", "intrusion", "anomaly", "crowd", "access_violation", "system", "person_down", "fire"] as const;
const alertSeverities = ["low", "medium", "high", "critical"] as const;

function randomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number, decimals: number = 4): string {
  return (Math.random() * (max - min) + min).toFixed(decimals);
}

async function seed() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("Clearing existing data...");
  await db.delete(locationEvents);
  await db.delete(events);
  await db.delete(alerts);
  await db.delete(incidents);
  await db.delete(trackedEntities);
  await db.delete(zones);
  await db.delete(cameras);
  await db.delete(sensors);
  await db.delete(accessReaders);
  await db.delete(wifiAccessPoints);
  await db.delete(floors);
  await db.delete(buildings);

  // Insert buildings
  console.log("Inserting buildings...");
  const insertedBuildings = await db.insert(buildings).values(buildingsData).returning();
  console.log(`  ✓ Inserted ${insertedBuildings.length} buildings`);

  // Insert floors for each building
  console.log("Inserting floors...");
  const floorsData: Array<{
    buildingId: number;
    level: number;
    name: string;
    floorplanUrl: string | null;
    floorplanWidth: number;
    floorplanHeight: number;
    scalePxPerMeter: string;
  }> = [];
  
  for (const building of insertedBuildings) {
    const floorCount = building.floorsCount || 1;
    for (let level = 1; level <= Math.min(floorCount, 4); level++) {
      const floorKey = `${building.code}-${level}`;
      floorsData.push({
        buildingId: building.id,
        level,
        name: `${building.name} - Floor ${level}`,
        floorplanUrl: floorPlanUrls[floorKey] || `/floorplans/${building.code?.toLowerCase()}-${level}.png`,
        floorplanWidth: 1200,
        floorplanHeight: 800,
        scalePxPerMeter: "10.0000",
      });
    }
  }
  const insertedFloors = await db.insert(floors).values(floorsData).returning();
  console.log(`  ✓ Inserted ${insertedFloors.length} floors`);

  // Insert cameras (~800 total, distributed across buildings)
  console.log("Inserting cameras...");
  const camerasData: Array<{
    buildingId: number;
    floorId: number;
    name: string;
    type: typeof cameraTypes[number];
    status: typeof cameraStatuses[number];
    x: string;
    y: string;
    fovDegrees: number;
    rotation: number;
    hasAI: boolean;
    rtspUrl: string;
    hlsUrl: string;
  }> = [];
  
  let cameraIndex = 1;
  for (const floor of insertedFloors) {
    const camerasPerFloor = randomBetween(15, 25);
    for (let i = 0; i < camerasPerFloor; i++) {
      const status = Math.random() > 0.05 ? "online" as const : randomElement(["offline", "maintenance", "error"] as const);
      camerasData.push({
        buildingId: floor.buildingId,
        floorId: floor.id,
        name: `CAM-${String(cameraIndex).padStart(4, "0")}`,
        type: randomElement(cameraTypes),
        status,
        x: randomDecimal(50, 1150),
        y: randomDecimal(50, 750),
        fovDegrees: randomBetween(60, 120),
        rotation: randomBetween(0, 359),
        hasAI: Math.random() > 0.7,
        rtspUrl: `rtsp://cameras.brown.edu/cam${cameraIndex}`,
        hlsUrl: `/api/cameras/${cameraIndex}/stream.m3u8`,
      });
      cameraIndex++;
    }
  }
  const insertedCameras = await db.insert(cameras).values(camerasData).returning();
  console.log(`  ✓ Inserted ${insertedCameras.length} cameras`);

  // Insert sensors
  console.log("Inserting sensors...");
  const sensorsData: Array<{
    buildingId: number;
    floorId: number;
    name: string;
    type: typeof sensorTypes[number];
    status: "online" | "offline" | "triggered" | "maintenance";
    x: string;
    y: string;
    externalId: string;
  }> = [];
  
  let sensorIndex = 1;
  for (const floor of insertedFloors) {
    const sensorsPerFloor = randomBetween(8, 15);
    for (let i = 0; i < sensorsPerFloor; i++) {
      sensorsData.push({
        buildingId: floor.buildingId,
        floorId: floor.id,
        name: `SENSOR-${String(sensorIndex).padStart(4, "0")}`,
        type: randomElement(sensorTypes),
        status: Math.random() > 0.1 ? "online" : "offline",
        x: randomDecimal(50, 1150),
        y: randomDecimal(50, 750),
        externalId: `EXT-S-${sensorIndex}`,
      });
      sensorIndex++;
    }
  }
  const insertedSensors = await db.insert(sensors).values(sensorsData).returning();
  console.log(`  ✓ Inserted ${insertedSensors.length} sensors`);

  // Insert access readers
  console.log("Inserting access readers...");
  const accessReadersData: Array<{
    buildingId: number;
    floorId: number;
    name: string;
    type: "entry" | "exit" | "bidirectional";
    status: "online" | "offline" | "maintenance" | "error";
    x: string;
    y: string;
    externalId: string;
  }> = [];
  
  let readerIndex = 1;
  for (const floor of insertedFloors) {
    const readersPerFloor = randomBetween(2, 6);
    for (let i = 0; i < readersPerFloor; i++) {
      accessReadersData.push({
        buildingId: floor.buildingId,
        floorId: floor.id,
        name: `READER-${String(readerIndex).padStart(4, "0")}`,
        type: randomElement(["entry", "exit", "bidirectional"]),
        status: Math.random() > 0.05 ? "online" : "offline",
        x: randomDecimal(50, 1150),
        y: randomDecimal(50, 750),
        externalId: `EXT-R-${readerIndex}`,
      });
      readerIndex++;
    }
  }
  const insertedReaders = await db.insert(accessReaders).values(accessReadersData).returning();
  console.log(`  ✓ Inserted ${insertedReaders.length} access readers`);

  // Insert WiFi access points
  console.log("Inserting WiFi access points...");
  const wifiData: Array<{
    buildingId: number;
    floorId: number;
    name: string;
    bssid: string;
    status: "online" | "offline" | "maintenance" | "error";
    x: string;
    y: string;
    coverageRadius: number;
  }> = [];
  
  let wifiIndex = 1;
  for (const floor of insertedFloors) {
    const wifiPerFloor = randomBetween(3, 8);
    for (let i = 0; i < wifiPerFloor; i++) {
      wifiData.push({
        buildingId: floor.buildingId,
        floorId: floor.id,
        name: `AP-${String(wifiIndex).padStart(4, "0")}`,
        bssid: `00:1A:2B:${String(wifiIndex % 100).padStart(2, "0")}:${String(randomBetween(10, 99)).padStart(2, "0")}:${String(randomBetween(10, 99)).padStart(2, "0")}`.substring(0, 17),
        status: Math.random() > 0.05 ? "online" : "offline",
        x: randomDecimal(100, 1100),
        y: randomDecimal(100, 700),
        coverageRadius: randomBetween(20, 50),
      });
      wifiIndex++;
    }
  }
  const insertedWifi = await db.insert(wifiAccessPoints).values(wifiData).returning();
  console.log(`  ✓ Inserted ${insertedWifi.length} WiFi access points`);

  // Insert tracked entities
  console.log("Inserting tracked entities...");
  const firstNames = ["James", "Emma", "Michael", "Sophia", "William", "Olivia", "Alexander", "Ava", "Daniel", "Isabella", "David", "Mia", "Joseph", "Charlotte", "Andrew", "Amelia", "Ryan", "Harper", "John", "Evelyn"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
  
  const entitiesData: Array<{
    type: "person" | "device" | "vehicle" | "unknown";
    identifierHash: string;
    displayName: string;
    role: typeof entityRoles[number];
    isWatchlist: boolean;
    riskScore: number;
    lastSeenAt: Date;
    lastFloorId: number;
    lastX: string;
    lastY: string;
  }> = [];
  
  for (let i = 1; i <= 500; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const role = randomElement(entityRoles);
    const floor = randomElement(insertedFloors);
    
    entitiesData.push({
      type: "person",
      identifierHash: `HASH-${String(i).padStart(6, "0")}`,
      displayName: `${firstName} ${lastName}`,
      role,
      isWatchlist: Math.random() > 0.98,
      riskScore: Math.random() > 0.95 ? randomBetween(50, 100) : randomBetween(0, 30),
      lastSeenAt: new Date(Date.now() - randomBetween(0, 300000)), // Last 5 minutes
      lastFloorId: floor.id,
      lastX: randomDecimal(50, 1150),
      lastY: randomDecimal(50, 750),
    });
  }
  const insertedEntities = await db.insert(trackedEntities).values(entitiesData).returning();
  console.log(`  ✓ Inserted ${insertedEntities.length} tracked entities`);

  // Insert alerts
  console.log("Inserting alerts...");
  const alertTitles: Record<string, string[]> = {
    weapon: ["Potential weapon detected", "Suspicious object identified", "Security threat detected"],
    intrusion: ["Unauthorized access attempt", "Perimeter breach detected", "After-hours entry"],
    anomaly: ["Unusual behavior detected", "Pattern anomaly identified", "Suspicious activity"],
    crowd: ["Large gathering detected", "Crowd density alert", "Unusual congregation"],
    access_violation: ["Access denied - invalid credentials", "Tailgating detected", "Forced entry attempt"],
    system: ["Camera offline", "Sensor malfunction", "Network connectivity issue"],
    person_down: ["Person down detected", "Medical emergency possible", "Unresponsive individual"],
    fire: ["Smoke detected", "Fire alarm triggered", "Thermal anomaly"],
  };
  
  const alertsData: Array<{
    type: typeof alertTypes[number];
    severity: typeof alertSeverities[number];
    status: "active" | "acknowledged" | "investigating" | "resolved" | "false_alarm";
    title: string;
    description: string;
    buildingId: number;
    floorId: number;
    x: string;
    y: string;
    aiConfidence: string;
  }> = [];
  
  for (let i = 0; i < 50; i++) {
    const type = randomElement(alertTypes);
    const floor = randomElement(insertedFloors);
    const building = insertedBuildings.find(b => b.id === floor.buildingId);
    
    alertsData.push({
      type,
      severity: randomElement(alertSeverities),
      status: randomElement(["active", "active", "active", "acknowledged", "investigating", "resolved", "false_alarm"]),
      title: randomElement(alertTitles[type]),
      description: `Alert detected at ${building?.name}, Floor ${floor.level}`,
      buildingId: floor.buildingId,
      floorId: floor.id,
      x: randomDecimal(50, 1150),
      y: randomDecimal(50, 750),
      aiConfidence: randomDecimal(0.7, 0.99),
    });
  }
  const insertedAlerts = await db.insert(alerts).values(alertsData).returning();
  console.log(`  ✓ Inserted ${insertedAlerts.length} alerts`);

  // Insert incidents
  console.log("Inserting incidents...");
  const incidentsData: Array<{
    status: "open" | "in_progress" | "resolved" | "closed";
    priority: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    buildingId: number;
    floorId: number;
  }> = [];
  
  const incidentTitles = [
    "Security breach investigation",
    "Medical emergency response",
    "Fire alarm activation",
    "Suspicious package report",
    "Unauthorized access incident",
    "Vandalism report",
    "Theft investigation",
    "Disturbance report",
  ];
  
  for (let i = 0; i < 15; i++) {
    const floor = randomElement(insertedFloors);
    incidentsData.push({
      status: randomElement(["open", "open", "in_progress", "resolved", "closed"]),
      priority: randomElement(["low", "medium", "high", "critical"]),
      title: randomElement(incidentTitles),
      description: `Incident requiring investigation and response`,
      buildingId: floor.buildingId,
      floorId: floor.id,
    });
  }
  const insertedIncidents = await db.insert(incidents).values(incidentsData).returning();
  console.log(`  ✓ Inserted ${insertedIncidents.length} incidents`);

  // Insert recent events
  console.log("Inserting events...");
  const eventTypes = [
    "camera_alert", "access_entry", "access_denied", "motion_detect", 
    "wifi_probe", "facial_match", "anomaly", "system"
  ] as const;
  
  const eventsData: Array<{
    type: typeof eventTypes[number];
    severity: "info" | "low" | "medium" | "high" | "critical";
    sourceType: string;
    buildingId: number;
    floorId: number;
    x: string;
    y: string;
    title: string;
    description: string;
    timestamp: Date;
  }> = [];
  
  for (let i = 0; i < 200; i++) {
    const type = randomElement(eventTypes);
    const floor = randomElement(insertedFloors);
    
    eventsData.push({
      type,
      severity: randomElement(["info", "info", "info", "low", "medium", "high"]),
      sourceType: type === "camera_alert" ? "camera" : type === "access_entry" || type === "access_denied" ? "access_reader" : "sensor",
      buildingId: floor.buildingId,
      floorId: floor.id,
      x: randomDecimal(50, 1150),
      y: randomDecimal(50, 750),
      title: `${type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} Event`,
      description: `Automated event detection`,
      timestamp: new Date(Date.now() - randomBetween(0, 3600000)), // Last hour
    });
  }
  const insertedEvents = await db.insert(events).values(eventsData).returning();
  console.log(`  ✓ Inserted ${insertedEvents.length} events`);

  console.log("\n✅ Database seeding completed successfully!");
  console.log(`
Summary:
  - ${insertedBuildings.length} buildings
  - ${insertedFloors.length} floors
  - ${insertedCameras.length} cameras
  - ${insertedSensors.length} sensors
  - ${insertedReaders.length} access readers
  - ${insertedWifi.length} WiFi access points
  - ${insertedEntities.length} tracked entities
  - ${insertedAlerts.length} alerts
  - ${insertedIncidents.length} incidents
  - ${insertedEvents.length} events
  `);
}

seed().catch(console.error);
