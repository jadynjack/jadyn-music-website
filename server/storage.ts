import { 
  charities, votes, subscribers, streamStats,
  type Charity, type Vote, type Subscriber, type StreamStats,
  type InsertVote, type InsertSubscriber, type UpdateStreamStats
} from "@shared/schema";
import { db } from "./db";
import { pool } from "./db";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

export interface IStorage {
  getCharities(): Promise<Charity[]>;
  getCharity(id: string): Promise<Charity | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  hasVoted(email: string): Promise<boolean>;
  getVoteCounts(): Promise<{ charityId: string; count: number }[]>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber | null>;
  initializeCharities(): Promise<void>;
  getStreamStats(): Promise<StreamStats>;
  updateStreamStats(stats: UpdateStreamStats): Promise<StreamStats>;
  initializeStreamStats(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCharities(): Promise<Charity[]> {
    return await db.select().from(charities);
  }

  async getCharity(id: string): Promise<Charity | undefined> {
    const [charity] = await db.select().from(charities).where(eq(charities.id, id));
    return charity || undefined;
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const txDb = drizzle(client);
      const [newVote] = await txDb.insert(votes).values(vote).returning();
      await txDb.update(charities)
        .set({ voteCount: sql`${charities.voteCount} + 1` })
        .where(eq(charities.id, vote.charityId));
      await client.query('COMMIT');
      return newVote;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async hasVoted(email: string): Promise<boolean> {
    const [existingVote] = await db.select().from(votes).where(eq(votes.email, email));
    return !!existingVote;
  }

  async getVoteCounts(): Promise<{ charityId: string; count: number }[]> {
    const results = await db.select({
      charityId: charities.id,
      count: charities.voteCount
    }).from(charities);
    return results.map(r => ({ charityId: r.charityId, count: r.count }));
  }

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

  async initializeCharities(): Promise<void> {
    const existing = await db.select().from(charities);
    if (existing.length === 0) {
      await db.insert(charities).values([
        { id: "music-cares", name: "Music Cares", voteCount: 45 },
        { id: "save-the-music", name: "Save The Music", voteCount: 30 },
        { id: "girls-rock", name: "Girls Rock Camp", voteCount: 25 },
      ]);
    }
  }

  async getStreamStats(): Promise<StreamStats> {
    const [stats] = await db.select().from(streamStats).where(eq(streamStats.id, "main"));
    return stats || { id: "main", spotifyStreams: 0, appleMusicStreams: 0, youtubeMusicStreams: 0, updatedAt: new Date() };
  }

  async updateStreamStats(stats: UpdateStreamStats): Promise<StreamStats> {
    const [updated] = await db
      .update(streamStats)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(streamStats.id, "main"))
      .returning();
    return updated;
  }

  async initializeStreamStats(): Promise<void> {
    const existing = await db.select().from(streamStats).where(eq(streamStats.id, "main"));
    if (existing.length === 0) {
      await db.insert(streamStats).values({
        id: "main",
        spotifyStreams: 0,
        appleMusicStreams: 0,
        youtubeMusicStreams: 0,
      });
    }
  }
}

export const storage = new DatabaseStorage();
