import { YoutubeTranscript } from 'youtube-transcript';

interface VideoInfo {
  title: string;
  duration: string;
  thumbnail: string;
  description?: string;
  tags?: string[];
  channelTitle?: string;
}

interface YouTubeAPIResponse {
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
      tags?: string[];
      channelTitle?: string;
    };
    contentDetails?: {
      duration?: string;
    };
  }>;
}

function formatDuration(duration: string): string {
  // Convert ISO 8601 duration (PT4M13S) to readable format (4:13)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "Unknown";
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo | null> {
  try {
    // Try YouTube Data API first if available
    if (process.env.YOUTUBE_API_KEY) {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails`;
      const response = await fetch(apiUrl);
      const data: YouTubeAPIResponse = await response.json();
      
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        const snippet = item.snippet;
        const contentDetails = item.contentDetails;
        
        return {
          title: snippet?.title || `Video ${videoId}`,
          duration: contentDetails?.duration ? formatDuration(contentDetails.duration) : "Unknown",
          thumbnail: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url || '',
          description: snippet?.description || '',
          tags: snippet?.tags || [],
          channelTitle: snippet?.channelTitle || ''
        };
      }
    }
    
    // Fallback to HTML scraping
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Extract title from HTML
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/); 
    const title = titleMatch ? titleMatch[1] : `Video ${videoId}`;
    
    // Extract thumbnail
    const thumbnailMatch = html.match(/<meta property="og:image" content="([^"]+)"/); 
    const thumbnail = thumbnailMatch ? thumbnailMatch[1] : '';
    
    // Extract description
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/); 
    const description = descMatch ? descMatch[1] : '';
    
    return {
      title,
      duration: "Unknown",
      thumbnail,
      description,
      tags: [],
      channelTitle: ''
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    return null;
  }
}

export async function getVideoTranscript(
  videoId: string, 
  preferredLanguage: string = 'en'
): Promise<string | null> {
  try {
    // Try to get transcript in preferred language first
    let transcript;
    
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: preferredLanguage
      });
    } catch (error) {
      // If preferred language fails, try English
      console.log(`Transcript not available in ${preferredLanguage}, trying English...`);
      try {
        transcript = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: 'en'
        });
      } catch (error) {
        // If English fails, try without language specification (get first available)
        console.log('English transcript not available, trying first available...');
        try {
          transcript = await YoutubeTranscript.fetchTranscript(videoId);
        } catch (finalError) {
          console.log('No transcript available for this video');
          return null;
        }
      }
    }
    
    if (!transcript || transcript.length === 0) {
      return null;
    }
    
    // Combine transcript segments into a single text
    const fullText = transcript
      .map(segment => segment.text)
      .join(' ')
      .replace(/\[.*?\]/g, '') // Remove any bracketed content like [Music]
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (fullText.length < 100) {
      // Transcript too short, probably not useful
      return null;
    }
    
    return fullText;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}

export function createContentFromVideoInfo(videoInfo: VideoInfo): string {
  // Create comprehensive content from video metadata for AI analysis
  let content = `Video Title: ${videoInfo.title}\n\n`;
  
  if (videoInfo.channelTitle) {
    content += `Channel: ${videoInfo.channelTitle}\n\n`;
  }
  
  if (videoInfo.description) {
    content += `Video Description:\n${videoInfo.description}\n\n`;
  }
  
  if (videoInfo.tags && videoInfo.tags.length > 0) {
    content += `Tags: ${videoInfo.tags.join(', ')}\n\n`;
  }
  
  content += `Duration: ${videoInfo.duration}\n\n`;
  
  // Add context about the analysis
  content += `Note: This analysis is based on the video's title, description, and metadata since transcript was not available.`;
  
  return content;
}