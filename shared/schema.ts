import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const charities = pgTable("charities", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
  voteCount: integer("vote_count").notNull().default(0),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  charityId: varchar("charity_id", { length: 50 }).notNull(),
  email: text("email").notNull(),
  marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const streamStats = pgTable("stream_stats", {
  id: varchar("id", { length: 50 }).primaryKey().default("main"),
  spotifyStreams: integer("spotify_streams").notNull().default(0),
  appleMusicStreams: integer("apple_music_streams").notNull().default(0),
  youtubeMusicStreams: integer("youtube_music_streams").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: varchar("id", { length: 50 }).primaryKey().default("main"),
  songTitle: text("song_title").notNull().default("RAINBOW"),
  songSubtitle: text("song_subtitle").notNull().default("New single out now on all platforms"),
  spotifyLink: text("spotify_link").default(""),
  appleMusicLink: text("apple_music_link").default(""),
  youtubeMusicLink: text("youtube_music_link").default(""),
  presaveEnabled: boolean("presave_enabled").notNull().default(false),
  presaveTitle: text("presave_title").default(""),
  presaveSpotifyLink: text("presave_spotify_link").default(""),
  presaveAppleMusicLink: text("presave_apple_music_link").default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const updateStreamStatsSchema = z.object({
  spotifyStreams: z.number().int().min(0),
  appleMusicStreams: z.number().int().min(0),
  youtubeMusicStreams: z.number().int().min(0),
});

export const updateSiteSettingsSchema = z.object({
  songTitle: z.string().min(1),
  songSubtitle: z.string().optional(),
  spotifyLink: z.string().optional(),
  appleMusicLink: z.string().optional(),
  youtubeMusicLink: z.string().optional(),
  presaveEnabled: z.boolean().optional(),
  presaveTitle: z.string().optional(),
  presaveSpotifyLink: z.string().optional(),
  presaveAppleMusicLink: z.string().optional(),
});

// Regex for safe charity IDs: alphanumeric, hyphens, underscores only
const safeIdRegex = /^[a-z0-9_-]+$/;

export const updateCharitiesSchema = z.object({
  charities: z.array(z.object({
    id: z.string().min(1).max(50).regex(safeIdRegex, "ID must contain only lowercase letters, numbers, hyphens, and underscores"),
    name: z.string().min(1).max(100),
  })).min(1).max(5),
});

// Proper email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const insertVoteSchema = z.object({
  charityId: z.string().min(1).max(50).regex(safeIdRegex),
  email: z.string().email().max(255).regex(emailRegex, "Invalid email format"),
  marketingOptIn: z.boolean().default(false),
});

export const insertSubscriberSchema = z.object({
  email: z.string().email().max(255).regex(emailRegex, "Invalid email format"),
  marketingOptIn: z.boolean().default(false),
});

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;
export type Charity = typeof charities.$inferSelect;
export type StreamStats = typeof streamStats.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type UpdateStreamStats = z.infer<typeof updateStreamStatsSchema>;
export type UpdateSiteSettings = z.infer<typeof updateSiteSettingsSchema>;
export type UpdateCharities = z.infer<typeof updateCharitiesSchema>;
