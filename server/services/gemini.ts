import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "" 
});

export async function generateNotes(
  transcript: string, 
  language: string = 'en',
  videoTitle: string = ''
): Promise<string> {
  try {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish', 
      'hi': 'Hindi',
      'fr': 'French',
      'de': 'German'
    };

    const targetLanguage = languageNames[language] || 'English';
    
    const prompt = `You are an expert educational content creator. Please analyze the following video transcript and create comprehensive, well-structured study notes.

Video Title: ${videoTitle}
Target Language: ${targetLanguage}

Instructions:
1. Create detailed, hierarchical study notes with clear headings and subheadings
2. Include key concepts, definitions, and important points
3. Use bullet points and numbered lists for clarity
4. Add reference markers like [1], [2], [3], etc. at key points where visual aids would be helpful
5. Organize content logically with proper sections
6. If the transcript is not in ${targetLanguage}, translate the content while maintaining accuracy
7. Focus on educational value and comprehension
8. Include a "Key Takeaways" section at the end
9. Use markdown formatting for better structure

Transcript:
${transcript}

Please generate comprehensive study notes in ${targetLanguage}:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const notes = response.text;
    if (!notes) {
      throw new Error("Failed to generate notes - empty response");
    }

    return notes;
  } catch (error) {
    console.error("Error generating notes:", error);
    throw new Error(`Failed to generate notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
