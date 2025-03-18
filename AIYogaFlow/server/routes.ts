import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertSessionSchema,
  insertAchievementSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Existing routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);

      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      await storage.updateUserExperience(sessionData.userId, sessionData.score);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.get("/api/users/:userId/sessions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getUserSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/achievements", async (req, res) => {
    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(achievementData);
      res.status(201).json(achievement);
    } catch (error) {
      res.status(400).json({ message: "Invalid achievement data" });
    }
  });

  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // New routes for yoga poses
  app.get("/api/poses", async (_req, res) => {
    try {
      const poses = await storage.getAllYogaPoses();
      res.json(poses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch yoga poses" });
    }
  });

  app.get("/api/poses/:difficulty", async (req, res) => {
    try {
      const poses = await storage.getYogaPosesByDifficulty(req.params.difficulty);
      res.json(poses);
    } catch (error) {
      res.status(400).json({ message: "Invalid difficulty level" });
    }
  });

  // Routes for store products
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:category", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      res.status(400).json({ message: "Invalid category" });
    }
  });

  // Routes for diet plans
  app.get("/api/diet-plans", async (_req, res) => {
    try {
      const plans = await storage.getDietPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch diet plans" });
    }
  });

  app.get("/api/diet-plans/:type", async (req, res) => {
    try {
      const plans = await storage.getDietPlansByType(req.params.type);
      res.json(plans);
    } catch (error) {
      res.status(400).json({ message: "Invalid diet plan type" });
    }
  });

  // Routes for music tracks
  app.get("/api/music", async (_req, res) => {
    try {
      const tracks = await storage.getMusicTracks();
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch music tracks" });
    }
  });

  app.get("/api/music/:category", async (req, res) => {
    try {
      const tracks = await storage.getMusicTracksByCategory(req.params.category);
      res.json(tracks);
    } catch (error) {
      res.status(400).json({ message: "Invalid music category" });
    }
  });

  // Social feature routes
  app.post("/api/users/:userId/follow", async (req, res) => {
    try {
      const followerId = parseInt(req.body.followerId);
      const followingId = parseInt(req.params.userId);
      const relation = await storage.followUser(followerId, followingId);
      res.status(201).json(relation);
    } catch (error) {
      res.status(400).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/users/:userId/follow", async (req, res) => {
    try {
      const followerId = parseInt(req.body.followerId);
      const followingId = parseInt(req.params.userId);
      await storage.unfollowUser(followerId, followingId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to unfollow user" });
    }
  });

  app.get("/api/users/:userId/followers", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      res.status(400).json({ message: "Failed to get followers" });
    }
  });

  app.get("/api/users/:userId/following", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      res.status(400).json({ message: "Failed to get following" });
    }
  });

  // Challenge and leaderboard routes
  app.post("/api/challenges", async (req, res) => {
    try {
      const challenge = await storage.createChallenge(req.body);
      res.status(201).json(challenge);
    } catch (error) {
      res.status(400).json({ message: "Failed to create challenge" });
    }
  });

  app.get("/api/challenges", async (_req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get("/api/challenges/current", async (_req, res) => {
    try {
      const challenge = await storage.getCurrentChallenge();
      if (challenge) {
        res.json(challenge);
      } else {
        res.status(404).json({ message: "No active challenge found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current challenge" });
    }
  });

  app.post("/api/challenges/:challengeId/join", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      const userId = parseInt(req.body.userId);
      const participant = await storage.joinChallenge(userId, challengeId);
      res.status(201).json(participant);
    } catch (error) {
      res.status(400).json({ message: "Failed to join challenge" });
    }
  });

  app.get("/api/challenges/:challengeId/leaderboard", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      const leaderboard = await storage.getLeaderboard(challengeId);
      res.json(leaderboard);
    } catch (error) {
      res.status(400).json({ message: "Failed to get challenge leaderboard" });
    }
  });

  app.get("/api/leaderboard/global", async (_req, res) => {
    try {
      const leaderboard = await storage.getGlobalLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch global leaderboard" });
    }
  });

  // Add new routes after existing routes
  // Instructor routes
  app.get("/api/instructors", async (_req, res) => {
    try {
      const instructors = await storage.getInstructors();
      res.json(instructors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch instructors" });
    }
  });

  app.get("/api/instructors/:id", async (req, res) => {
    try {
      const instructor = await storage.getInstructorById(parseInt(req.params.id));
      if (instructor) {
        res.json(instructor);
      } else {
        res.status(404).json({ message: "Instructor not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid instructor ID" });
    }
  });

  // Lesson group routes
  app.get("/api/lesson-groups", async (_req, res) => {
    try {
      const groups = await storage.getLessonGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson groups" });
    }
  });

  app.get("/api/lesson-groups/:groupId/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessonsByGroupId(parseInt(req.params.groupId));
      res.json(lessons);
    } catch (error) {
      res.status(400).json({ message: "Invalid group ID" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}