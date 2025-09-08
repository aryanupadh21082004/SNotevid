import {
  users,
  videos,
  userVideos,
  type User,
  type UpsertUser,
  type InsertVideo,
  type Video,
  type InsertUserVideo,
  type UserVideo,
  type VideoWithNotes,
  type UserHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Video operations
  getVideo(youtubeId: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  
  // User video operations
  getUserVideo(userId: string, videoId: string, language: string): Promise<UserVideo | undefined>;
  createUserVideo(userVideo: InsertUserVideo): Promise<UserVideo>;
  getUserHistory(userId: string): Promise<UserHistory[]>;
  getVideoWithNotes(userId: string, videoId: string): Promise<VideoWithNotes | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Video operations
  async getVideo(youtubeId: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.youtubeId, youtubeId));
    return video;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db
      .insert(videos)
      .values(video)
      .onConflictDoUpdate({
        target: videos.youtubeId,
        set: video,
      })
      .returning();
    return newVideo;
  }

  // User video operations
  async getUserVideo(userId: string, videoId: string, language: string): Promise<UserVideo | undefined> {
    const [userVideo] = await db
      .select()
      .from(userVideos)
      .where(
        and(
          eq(userVideos.userId, userId),
          eq(userVideos.videoId, videoId),
          eq(userVideos.language, language)
        )
      );
    return userVideo;
  }

  async createUserVideo(userVideo: InsertUserVideo): Promise<UserVideo> {
    const [newUserVideo] = await db
      .insert(userVideos)
      .values(userVideo)
      .returning();
    return newUserVideo;
  }

  async getUserHistory(userId: string): Promise<UserHistory[]> {
    const history = await db
      .select({
        id: userVideos.id,
        title: videos.title,
        thumbnailUrl: videos.thumbnailUrl,
        language: userVideos.language,
        duration: videos.duration,
        processedAt: userVideos.processedAt,
        youtubeId: videos.youtubeId,
      })
      .from(userVideos)
      .innerJoin(videos, eq(userVideos.videoId, videos.id))
      .where(eq(userVideos.userId, userId))
      .orderBy(desc(userVideos.processedAt))
      .limit(10);
    
    return history;
  }

  async getVideoWithNotes(userId: string, videoId: string): Promise<VideoWithNotes | undefined> {
    const [result] = await db
      .select({
        id: videos.id,
        youtubeId: videos.youtubeId,
        title: videos.title,
        duration: videos.duration,
        thumbnailUrl: videos.thumbnailUrl,
        createdAt: videos.createdAt,
        notes: userVideos.notes,
        keyFrames: userVideos.keyFrames,
        language: userVideos.language,
        processedAt: userVideos.processedAt,
      })
      .from(videos)
      .innerJoin(userVideos, eq(videos.id, userVideos.videoId))
      .where(
        and(
          eq(videos.youtubeId, videoId),
          eq(userVideos.userId, userId)
        )
      );
    
    if (!result) return undefined;
    
    return {
      ...result,
      notes: result.notes || undefined,
      keyFrames: result.keyFrames || undefined,
      language: result.language || undefined,
      processedAt: result.processedAt || undefined
    };
  }
}

export const storage = new DatabaseStorage();
