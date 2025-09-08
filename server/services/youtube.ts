import { YoutubeTranscript } from 'youtube-transcript';

interface VideoInfo {
  title: string;
  duration: string;
  thumbnail: string;
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo | null> {
  try {
    // We'll use a simple approach to get basic video info
    // In a production environment, you might want to use the YouTube Data API
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Extract title from HTML
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : `Video ${videoId}`;
    
    // Extract thumbnail
    const thumbnailMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    const thumbnail = thumbnailMatch ? thumbnailMatch[1] : '';
    
    // For duration, we'll use a placeholder since extracting it from HTML is complex
    const duration = "Unknown";
    
    return {
      title,
      duration,
      thumbnail
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
        transcript = await YoutubeTranscript.fetchTranscript(videoId);
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
