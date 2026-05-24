import { 
  subscribers, streamStats, siteSettings,
  type Subscriber, type StreamStats, type SiteSettings,
  type InsertSubscriber, type UpdateStreamStats, type UpdateSiteSettings
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber | null>;
  getStreamStats(): Promise<StreamStats>;
  updateStreamStats(stats: UpdateStreamStats): Promise<StreamStats>;
  initializeStreamStats(): Promise<void>;
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: UpdateSiteSettings): Promise<SiteSettings>;
  initializeSiteSettings(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber | null> {
    const [existing] = await db.select().from(subscribers).where(eq(subscribers.email, subscriber.email));
    if (existing) {
      return existing;
    }
    const [newSubscriber] = await db
      .insert(subscribers)
      .values(subscriber)
      .returning();
    return newSubscriber;
  }

  async getStreamStats(): Promise<StreamStats> {
    const [stats] = await db.select().from(streamStats).where(eq(streamStats.id, "main"));
    return stats || { id: "main", spotifyStreams: 0, appleMusicStreams: 0, youtubeMusicStreams: 0, updatedAt: new Date() };
  }

  async updateStreamStats(stats: UpdateStreamStats): Promise<StreamStats> {
    const [updated] = await db
      .insert(streamStats)
      .values({ id: "main", ...stats, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: streamStats.id,
        set: { ...stats, updatedAt: new Date() }
      })
      .returning();
    return updated;
  }

  async initializeStreamStats(): Promise<void> {
    await db.insert(streamStats).values({
      id: "main",
      spotifyStreams: 0,
      appleMusicStreams: 0,
      youtubeMusicStreams: 0,
    }).onConflictDoNothing();
  }

  async getSiteSettings(): Promise<SiteSettings> {
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, "main"));
    return settings || {
      id: "main",
      songTitle: "RAINBOW",
      songSubtitle: "New single out now on all platforms",
      spotifyLink: "",
      appleMusicLink: "",
      youtubeMusicLink: "",
      presaveEnabled: false,
      presaveTitle: "",
      presaveLink: "",
      updatedAt: new Date()
    };
  }

  async updateSiteSettings(settings: UpdateSiteSettings): Promise<SiteSettings> {
    const [updated] = await db
      .insert(siteSettings)
      .values({ id: "main", ...settings, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { ...settings, updatedAt: new Date() }
      })
      .returning();
    return updated;
  }

  async initializeSiteSettings(): Promise<void> {
    await db.insert(siteSettings).values({
      id: "main",
      songTitle: "RAINBOW",
      songSubtitle: "New single out now on all platforms",
      spotifyLink: "",
      appleMusicLink: "",
      youtubeMusicLink: "",
    }).onConflictDoNothing();
  }
}

export const storage = new DatabaseStorage();
