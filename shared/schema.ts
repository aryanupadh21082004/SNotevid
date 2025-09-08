import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Video processing results
export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  youtubeId: varchar("youtube_id").notNull(),
  title: text("title").notNull(),
  duration: varchar("duration"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User's processed videos
export const userVideos = pgTable("user_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  videoId: varchar("video_id").notNull(),
  language: varchar("language").notNull().default("en"),
  notes: text("notes"),
  keyFrames: jsonb("key_frames").$type<string[]>().default([]),
  processedAt: timestamp("processed_at").defaultNow(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  youtubeId: true,
  title: true,
  duration: true,
  thumbnailUrl: true,
});

export const insertUserVideoSchema = createInsertSchema(userVideos).pick({
  userId: true,
  videoId: true,
  language: true,
  notes: true,
  keyFrames: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertUserVideo = z.infer<typeof insertUserVideoSchema>;
export type UserVideo = typeof userVideos.$inferSelect;

// Combined types for API responses
export type VideoWithNotes = Video & {
  notes?: string;
  keyFrames?: string[];
  language?: string;
  processedAt?: Date;
};

export type UserHistory = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  language: string;
  duration: string | null;
  processedAt: Date | null;
  youtubeId: string;
};
