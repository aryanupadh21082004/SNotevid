import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { VideoWithNotes } from "@shared/schema";

export default function Results() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [match, params] = useRoute("/results/:videoId");
  const videoId = params?.videoId;

  // Redirect to home if no videoId
  useEffect(() => {
    if (!match || !videoId) {
      setLocation("/");
    }
  }, [match, videoId, setLocation]);

  // Fetch video results
  const { data: video, isLoading, error } = useQuery<VideoWithNotes>({
    queryKey: ["/api/results", videoId],
    enabled: !!videoId,
    retry: false,
  });

  // Handle unauthorized error
  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const highlightImage = (imageId: string) => {
    const imageElement = document.getElementById(imageId);
    if (imageElement) {
      imageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      const img = imageElement.querySelector('img');
      if (img) {
        img.classList.add('highlight-image');
        setTimeout(() => {
          img.classList.remove('highlight-image');
        }, 2000);
      }
    }
  };

  const renderNotesWithReferences = (notes: string) => {
    // Convert markdown-style notes to JSX with clickable references
    const lines = notes.split('\n');
    const elements: JSX.Element[] = [];
    let currentSection: JSX.Element[] = [];
    let key = 0;

    for (const line of lines) {
      if (line.startsWith('# ')) {
        // Main heading
        if (currentSection.length > 0) {
          elements.push(<div key={key++}>{currentSection}</div>);
          currentSection = [];
        }
        currentSection.push(
          <h2 key={key++} className="text-2xl font-bold text-foreground mb-4 flex items-center">
            <i className="fas fa-lightbulb text-accent mr-2"></i>
            {line.substring(2)}
          </h2>
        );
      } else if (line.startsWith('## ')) {
        // Section heading
        currentSection.push(
          <h3 key={key++} className="text-xl font-semibold text-foreground mb-4 mt-6">
            {line.substring(3)}
          </h3>
        );
      } else if (line.startsWith('### ')) {
        // Subsection heading
        currentSection.push(
          <h4 key={key++} className="font-semibold text-foreground mb-2 mt-4">
            {line.substring(4)}
          </h4>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // List item
        const content = line.substring(2);
        currentSection.push(
          <li key={key++} className="text-muted-foreground mb-1">
            {renderTextWithReferences(content)}
          </li>
        );
      } else if (line.trim()) {
        // Regular paragraph
        currentSection.push(
          <p key={key++} className="text-muted-foreground mb-4 leading-relaxed">
            {renderTextWithReferences(line)}
          </p>
        );
      }
    }

    if (currentSection.length > 0) {
      elements.push(<div key={key++}>{currentSection}</div>);
    }

    return elements;
  };

  const renderTextWithReferences = (text: string) => {
    // Replace [1], [2], etc. with clickable reference markers
    const parts = text.split(/(\[[0-9]+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[([0-9]+)\]$/);
      if (match) {
        const refNumber = match[1];
        return (
          <span 
            key={index}
            onClick={() => highlightImage(`image-${refNumber}`)}
            className="reference-marker"
            data-testid={`reference-${refNumber}`}
          >
            [{refNumber}]
          </span>
        );
      }
      return part;
    });
  };

  if (!match || !videoId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center">
            <LoadingSpinner className="mb-4" />
            <p className="text-muted-foreground">Loading video results...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <Card className="w-full max-w-md mx-4 p-6 text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-destructive mb-4"></i>
            <h2 className="text-xl font-bold text-foreground mb-2">Video Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The video you're looking for could not be found or you don't have access to it.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              Back to Home
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Video Header */}
          <div className="mb-8">
            <Button 
              variant="ghost"
              onClick={() => setLocation("/")}
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-4"
              data-testid="button-back"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back to Home</span>
            </Button>
            
            <Card className="bg-card rounded-xl shadow-lg border border-border p-6">
              <div className="flex items-start space-x-4">
                <img 
                  src={video.thumbnailUrl || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120"} 
                  alt={video.title}
                  className="w-32 h-20 md:w-48 md:h-28 object-cover rounded-lg flex-shrink-0"
                  data-testid="img-video-thumbnail"
                />
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2" data-testid="text-video-title">
                    {video.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <i className="fas fa-calendar"></i>
                      <span data-testid="text-processed-date">
                        {video.processedAt ? new Date(video.processedAt).toLocaleDateString() : 'Unknown date'}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <i className="fas fa-language"></i>
                      <span className="capitalize" data-testid="text-language">{video.language}</span>
                    </span>
                    {video.duration && (
                      <span className="flex items-center space-x-1">
                        <i className="fas fa-clock"></i>
                        <span data-testid="text-duration">{video.duration}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Notes */}
            <div className="lg:col-span-2">
              <Card className="bg-card rounded-xl shadow-lg border border-border p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Study Notes</h2>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-robot text-primary"></i>
                    <span className="text-sm text-muted-foreground font-medium">AI Generated</span>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none" data-testid="content-notes">
                  {video.notes ? (
                    <div className="space-y-4">
                      {renderNotesWithReferences(video.notes)}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No notes available for this video.</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Images */}
            <div className="lg:col-span-1">
              <Card className="bg-card rounded-xl shadow-lg border border-border p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Key Visuals</h3>
                  <i className="fas fa-images text-muted-foreground"></i>
                </div>
                
                <div className="space-y-4" data-testid="gallery-key-frames">
                  {video.keyFrames && video.keyFrames.length > 0 ? (
                    video.keyFrames.map((framePath, index) => (
                      <div key={index} id={`image-${index + 1}`} className="image-frame">
                        <img 
                          src={framePath || `https://images.unsplash.com/photo-${[
                            '1635070041078-e363dbe005cb',
                            '1551288049-bebda4e38f71', 
                            '1509228468518-180dd4864904',
                            '1460925895917-afdab827c52f'
                          ][index % 4]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250`}
                          alt={`Key frame ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                          data-testid={`img-frame-${index + 1}`}
                        />
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            [{index + 1}] Frame {index + 1}
                          </span>
                          <p className="text-sm text-muted-foreground mt-1">Key visual element</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback placeholder frames
                    Array.from({ length: 4 }, (_, index) => (
                      <div key={index} id={`image-${index + 1}`} className="image-frame">
                        <img 
                          src={`https://images.unsplash.com/photo-${[
                            '1635070041078-e363dbe005cb',
                            '1551288049-bebda4e38f71',
                            '1509228468518-180dd4864904', 
                            '1460925895917-afdab827c52f'
                          ][index]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250`}
                          alt={`Educational visual ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                          data-testid={`img-frame-${index + 1}`}
                        />
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            [{index + 1}] Visual {index + 1}
                          </span>
                          <p className="text-sm text-muted-foreground mt-1">Educational content visual</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
