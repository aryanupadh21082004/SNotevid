import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateNotes } from "./services/gemini";
import { getVideoInfo, getVideoTranscript } from "./services/youtube.js";
import { extractKeyFrames } from "./services/frameExtractor.js";
import { insertVideoSchema, insertUserVideoSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve static files for extracted frames
  app.use('/static', (req, res, next) => {
    const staticPath = path.resolve(import.meta.dirname, "..", "static");
    require('express').static(staticPath)(req, res, next);
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user's video history
  app.get('/api/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getUserHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  // Get specific video results
  app.get('/api/results/:videoId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { videoId } = req.params;
      
      const videoWithNotes = await storage.getVideoWithNotes(userId, videoId);
      if (!videoWithNotes) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(videoWithNotes);
    } catch (error) {
      console.error("Error fetching video results:", error);
      res.status(500).json({ message: "Failed to fetch video results" });
    }
  });

  // Process YouTube video
  app.post('/api/process-video', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { url, language = 'en' } = req.body;

      if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }

      // Extract YouTube video ID
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (!videoIdMatch) {
        return res.status(400).json({ message: "Could not extract video ID from URL" });
      }
      
      const youtubeId = videoIdMatch[1];

      // Check if we already have this video processed for this user and language
      let video = await storage.getVideo(youtubeId);
      if (video) {
        const existingUserVideo = await storage.getUserVideo(userId, video.id, language);
        if (existingUserVideo) {
          const videoWithNotes = await storage.getVideoWithNotes(userId, youtubeId);
          return res.json(videoWithNotes);
        }
      }

      // Get video information
      const videoInfo = await getVideoInfo(youtubeId);
      if (!videoInfo) {
        return res.status(404).json({ message: "Video not found or unavailable" });
      }

      // Create or update video record
      if (!video) {
        video = await storage.createVideo({
          youtubeId,
          title: videoInfo.title,
          duration: videoInfo.duration,
          thumbnailUrl: videoInfo.thumbnail,
        });
      }

      // Get transcript
      let transcript = await getVideoTranscript(youtubeId, language);
      
      // If no transcript available, provide a demo transcript for testing
      if (!transcript) {
        if (req.body.demo || youtubeId === 'demo123') {
          transcript = `This is a demo educational video about artificial intelligence and machine learning. 
          
          In this video, we explore the fundamentals of AI and how machine learning algorithms work. We start by understanding what artificial intelligence means - it's the simulation of human intelligence processes by machines, especially computer systems.

          Machine learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed. There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning.

          Supervised learning uses labeled training data to learn a mapping function from input variables to output variables. Common examples include email spam detection and image recognition.

          Unsupervised learning finds hidden patterns in data without labeled examples. Clustering and association are popular unsupervised learning techniques.

          Reinforcement learning is about taking suitable actions to maximize reward in a particular situation. It's used in game playing, robotics, and autonomous vehicles.

          Deep learning, which uses neural networks with multiple layers, has revolutionized fields like computer vision and natural language processing. Applications include self-driving cars, voice assistants, and medical diagnosis.

          The future of AI holds great promise but also challenges around ethics, job displacement, and ensuring AI systems are safe and beneficial for humanity.`;
        } else {
          return res.status(404).json({ message: "No transcript available for this video. Try adding '?demo=true' to test with sample content." });
        }
      }

      // Generate notes with AI
      const notes = await generateNotes(transcript, language, videoInfo.title);

      // Extract key frames
      const keyFrames = await extractKeyFrames(youtubeId, videoInfo.duration);

      // Save user video record
      await storage.createUserVideo({
        userId,
        videoId: video.id,
        language,
        notes,
        keyFrames,
      });

      // Return complete video with notes
      const videoWithNotes = await storage.getVideoWithNotes(userId, youtubeId);
      res.json(videoWithNotes);

    } catch (error) {
      console.error("Error processing video:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process video" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
