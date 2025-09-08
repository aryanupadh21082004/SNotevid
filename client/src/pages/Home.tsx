import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { UserHistory } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("en");

  // Fetch user history
  const { data: history, isLoading: historyLoading } = useQuery<UserHistory[]>({
    queryKey: ["/api/history"],
    retry: false,
  });

  // Process video mutation
  const processVideoMutation = useMutation({
    mutationFn: async (data: { url: string; language: string }) => {
      const response = await apiRequest("POST", "/api/process-video", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Notes generated successfully!",
      });
      setLocation(`/results/${data.youtubeId}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process video",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }
    
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      toast({
        title: "Error",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }
    
    processVideoMutation.mutate({ url, language });
  };

  const handleHistoryClick = (youtubeId: string) => {
    setLocation(`/results/${youtubeId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Learn Smarter with 
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> AI Notes</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform any YouTube educational video into comprehensive, structured study notes with intelligent image extraction
            </p>
          </div>

          {/* Input Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-card rounded-xl shadow-lg border border-border p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Generate Notes from Video</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* URL Input */}
                <div>
                  <Label htmlFor="youtube-url" className="block text-sm font-medium text-foreground mb-2">
                    YouTube Video URL
                  </Label>
                  <div className="relative">
                    <Input 
                      id="youtube-url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..." 
                      className="w-full pr-10"
                      data-testid="input-youtube-url"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <i className="fas fa-link text-muted-foreground"></i>
                    </div>
                  </div>
                </div>

                {/* Language Selection and Generate Button */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="language-select" className="block text-sm font-medium text-foreground mb-2">
                      Output Language
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger data-testid="select-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      type="submit"
                      disabled={processVideoMutation.isPending}
                      className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg hover:bg-primary/90 transition-all font-semibold flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
                      data-testid="button-generate-notes"
                    >
                      {processVideoMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-magic"></i>
                          <span>Generate Notes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Processing Status */}
              {processVideoMutation.isPending && (
                <div className="mt-8 p-6 bg-muted/50 rounded-lg text-center">
                  <LoadingSpinner className="mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Processing video... This may take a few minutes</p>
                  <p className="text-sm text-muted-foreground mt-2">Extracting transcript, generating notes, and capturing key frames</p>
                </div>
              )}
            </Card>
          </div>

          {/* History Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card rounded-xl shadow-lg border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Recent Notes</h2>
                <i className="fas fa-history text-muted-foreground"></i>
              </div>
              
              {historyLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                  <p className="text-muted-foreground mt-2">Loading history...</p>
                </div>
              ) : history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleHistoryClick(item.youtubeId)}
                      className="group bg-background hover:bg-muted/50 p-4 rounded-lg border border-border cursor-pointer transition-all hover:shadow-md"
                      data-testid={`history-item-${item.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <img 
                          src={item.thumbnailUrl || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=60"} 
                          alt={item.title}
                          className="w-16 h-10 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{item.processedAt ? new Date(item.processedAt).toLocaleDateString() : 'Unknown date'}</span>
                            <span className="capitalize">{item.language}</span>
                            {item.duration && (
                              <span className="flex items-center space-x-1">
                                <i className="fas fa-clock text-xs"></i>
                                <span>{item.duration}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <i className="fas fa-arrow-right text-muted-foreground group-hover:text-primary group-hover:transform group-hover:translate-x-1 transition-all"></i>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <i className="fas fa-history text-4xl mb-4 opacity-50"></i>
                  <p>No videos processed yet. Start by submitting a YouTube URL above!</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
