import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center gradient-bg hero-pattern">
          <div className="w-full max-w-md mx-auto px-4">
            <Card className="bg-card rounded-xl shadow-xl p-8 border border-border">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <i className="fas fa-graduation-cap text-2xl text-primary"></i>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to S-Notevid</h2>
                <p className="text-muted-foreground">Transform YouTube videos into comprehensive study notes with AI</p>
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center space-x-3"
                data-testid="button-login"
              >
                <i className="fas fa-play text-lg"></i>
                <span>Login with Replit</span>
              </Button>
              
              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-full mb-2">
                      <i className="fas fa-robot text-secondary"></i>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">AI Summaries</p>
                  </div>
                  <div>
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-accent/10 rounded-full mb-2">
                      <i className="fas fa-images text-accent"></i>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Key Images</p>
                  </div>
                  <div>
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mb-2">
                      <i className="fas fa-language text-primary"></i>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Multi-language</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
