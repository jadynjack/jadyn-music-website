import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVoteSchema, insertSubscriberSchema, updateStreamStatsSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await storage.initializeCharities();
  await storage.initializeStreamStats();

  app.get("/api/charities", async (req, res) => {
    try {
      const charities = await storage.getCharities();
      const voteCounts = await storage.getVoteCounts();
      const totalVotes = voteCounts.reduce((sum, c) => sum + c.count, 0);
      
      const charitiesWithPercentage = charities.map(charity => {
        const voteData = voteCounts.find(v => v.charityId === charity.id);
        const count = voteData?.count || 0;
        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        return {
          id: charity.id,
          name: charity.name,
          voteCount: count,
          percentage
        };
      });
      
      res.json(charitiesWithPercentage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch charities" });
    }
  });

  app.post("/api/votes", async (req, res) => {
    try {
      const result = insertVoteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid vote data" });
      }

      const hasVoted = await storage.hasVoted(result.data.email);
      if (hasVoted) {
        return res.status(400).json({ error: "Email has already voted" });
      }

      const vote = await storage.createVote(result.data);
      
      const charities = await storage.getCharities();
      const voteCounts = await storage.getVoteCounts();
      const totalVotes = voteCounts.reduce((sum, c) => sum + c.count, 0);
      
      const charitiesWithPercentage = charities.map(charity => {
        const voteData = voteCounts.find(v => v.charityId === charity.id);
        const count = voteData?.count || 0;
        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        return {
          id: charity.id,
          name: charity.name,
          voteCount: count,
          percentage
        };
      });

      res.json({ success: true, charities: charitiesWithPercentage });
    } catch (error) {
      res.status(500).json({ error: "Failed to record vote" });
    }
  });

  app.post("/api/subscribers", async (req, res) => {
    try {
      const result = insertSubscriberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid email" });
      }

      const subscriber = await storage.createSubscriber(result.data);
      res.json({ success: true, subscriber });
    } catch (error) {
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  app.get("/api/stream-stats", async (req, res) => {
    try {
      const stats = await storage.getStreamStats();
      const totalStreams = stats.spotifyStreams + stats.appleMusicStreams + stats.youtubeMusicStreams;
      const dollarsRaised = Math.floor(totalStreams / 100) * 5;
      res.json({ ...stats, totalStreams, dollarsRaised });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stream stats" });
    }
  });

  app.post("/api/stream-stats", async (req, res) => {
    try {
      const result = updateStreamStatsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid stream stats data" });
      }

      const stats = await storage.updateStreamStats(result.data);
      const totalStreams = stats.spotifyStreams + stats.appleMusicStreams + stats.youtubeMusicStreams;
      const dollarsRaised = Math.floor(totalStreams / 100) * 5;
      res.json({ success: true, stats: { ...stats, totalStreams, dollarsRaised } });
    } catch (error) {
      res.status(500).json({ error: "Failed to update stream stats" });
    }
  });

  return httpServer;
}
