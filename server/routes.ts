import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateNotes } from "./services/gemini";
import { getVideoInfo, getVideoTranscript, createContentFromVideoInfo } from "./services/youtube.js";
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

      // Try to get transcript first
      let transcript = await getVideoTranscript(youtubeId, language);
      let contentForAI: string;
      
      if (transcript) {
        // Use transcript if available
        contentForAI = transcript;
      } else {
        // Use video metadata if transcript not available
        console.log('No transcript available, using video metadata for analysis...');
        contentForAI = createContentFromVideoInfo(videoInfo);
      }

      // Generate notes with AI
      const notes = await generateNotes(contentForAI, language, videoInfo.title);

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
