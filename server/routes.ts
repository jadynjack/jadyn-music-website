import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVoteSchema, insertSubscriberSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await storage.initializeCharities();

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

  return httpServer;
}
