CREATE TYPE "public"."access_reader_type" AS ENUM('entry', 'exit', 'bidirectional');--> statement-breakpoint
CREATE TYPE "public"."alert_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('active', 'acknowledged', 'investigating', 'resolved', 'false_alarm');--> statement-breakpoint
CREATE TYPE "public"."alert_type" AS ENUM('weapon', 'intrusion', 'anomaly', 'crowd', 'access_violation', 'system', 'person_down', 'fire');--> statement-breakpoint
CREATE TYPE "public"."camera_type" AS ENUM('dome', 'bullet', 'ptz', 'fisheye', 'thermal');--> statement-breakpoint
CREATE TYPE "public"."entity_role" AS ENUM('staff', 'student', 'visitor', 'contractor', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('person', 'device', 'vehicle', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."equipment_status" AS ENUM('online', 'offline', 'maintenance', 'error');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('camera_alert', 'access_entry', 'access_denied', 'motion_detect', 'wifi_probe', 'facial_match', 'weapon_detect', 'anomaly', 'crowd_gather', 'person_down', 'intrusion', 'system');--> statement-breakpoint
CREATE TYPE "public"."incident_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."incident_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."location_source" AS ENUM('wifi', 'rfid', 'facial', 'phone', 'motion', 'manual');--> statement-breakpoint
CREATE TYPE "public"."sensor_status" AS ENUM('online', 'offline', 'triggered', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."sensor_type" AS ENUM('motion', 'glass_break', 'smoke', 'temperature', 'occupancy');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('info', 'low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'operator', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."zone_type" AS ENUM('classroom', 'hallway', 'stairwell', 'entry', 'office', 'lab', 'common', 'restroom', 'other');--> statement-breakpoint
CREATE TABLE "access_readers" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" integer NOT NULL,
	"floor_id" integer,
	"name" varchar(255) NOT NULL,
	"type" "access_reader_type" DEFAULT 'bidirectional',
	"x" numeric(10, 4),
	"y" numeric(10, 4),
	"external_id" varchar(255),
	"status" "equipment_status" DEFAULT 'online',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "alert_type" NOT NULL,
	"severity" "alert_severity" DEFAULT 'medium',
	"status" "alert_status" DEFAULT 'active',
	"title" varchar(255) NOT NULL,
	"description" text,
	"building_id" integer,
	"floor_id" integer,
	"x" numeric(10, 4),
	"y" numeric(10, 4),
	"ai_confidence" numeric(5, 4),
	"source_event_id" integer,
	"assigned_to" integer,
	"acknowledged_by" integer,
	"acknowledged_at" timestamp,
	"resolved_by" integer,
	"resolved_at" timestamp,
	"resolution_notes" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" integer,
	"details" json,
	"ip_address" varchar(45),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"address" text,
	"floors_count" integer DEFAULT 1,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"description" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cameras" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" integer NOT NULL,
	"floor_id" integer,
	"name" varchar(255) NOT NULL,
	"type" "camera_type" DEFAULT 'dome',
	"rtsp_url" text,
	"hls_url" text,
	"snapshot_url" text,
	"x" numeric(10, 4),
	"y" numeric(10, 4),
	"fov_degrees" integer DEFAULT 90,
	"rotation" integer DEFAULT 0,
	"status" "equipment_status" DEFAULT 'online',
	"has_ai" boolean DEFAULT false,
	"last_health_check" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "config" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" json NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "demo_scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"duration" integer,
	"events" json,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "event_type" NOT NULL,
	"severity" "severity" DEFAULT 'info',
	"source_type" varchar(50),
	"source_id" integer,
	"building_id" integer,
	"floor_id" integer,
	"x" numeric(10, 4),
	"y" numeric(10, 4),
	"title" varchar(255),
	"description" text,
	"metadata" json,
	"incident_id" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" integer NOT NULL,
	"level" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"floorplan_url" text,
	"floorplan_width" integer,
	"floorplan_height" integer,
	"scale_px_per_meter" numeric(10, 4),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "incident_status" DEFAULT 'open',
	"priority" "incident_priority" DEFAULT 'medium',
	"title" varchar(255) NOT NULL,
	"description" text,
	"building_id" integer,
	"floor_id" integer,
	"commander_id" integer,
	"assigned_to" integer,
	"tags" json,
	"timeline" json,
	"linked_alert_ids" json,
	"linked_event_ids" json,
	"linked_entity_ids" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "location_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_id" integer NOT NULL,
	"floor_id" integer NOT NULL,
	"source_type" "location_source" NOT NULL,
	"x" numeric(10, 4) NOT NULL,
	"y" numeric(10, 4) NOT NULL,
	"confidence" numeric(5, 4) DEFAULT '0.8',
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE "sensors" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" integer NOT NULL,
	"floor_id" integer,
	"name" varchar(255) NOT NULL,
	"type" "sensor_type" DEFAULT 'motion',
	"x" numeric(10, 4),
	"y" numeric(10, 4),
	"external_id" varchar(255),
	"status" "sensor_status" DEFAULT 'online',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracked_entities" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "entity_type" DEFAULT 'unknown',
	"identifier_hash" varchar(255),
	"display_name" varchar(255),
	"role" "entity_role" DEFAULT 'unknown',
	"is_watchlist" boolean DEFAULT false,
	"risk_score" integer DEFAULT 0,
	"last_seen_at" timestamp,
	"last_floor_id" integer,
	"last_x" numeric(10, 4),
	"last_y" numeric(10, 4),
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"open_id" varchar(64) NOT NULL,
	"username" varchar(255),
	"name" text,
	"email" varchar(320),
	"login_method" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_open_id_unique" UNIQUE("open_id")
);
--> statement-breakpoint
CREATE TABLE "wifi_access_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" integer NOT NULL,
	"floor_id" integer,
	"name" varchar(255) NOT NULL,
	"bssid" varchar(17),
	"x" numeric(10, 4),
	"y" numeric(10, 4),
	"coverage_radius" integer DEFAULT 30,
	"status" "equipment_status" DEFAULT 'online',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"floor_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "zone_type" DEFAULT 'other',
	"polygon_points" json,
	"color" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL
);
