import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <i className="fas fa-graduation-cap text-3xl text-primary"></i>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              About S-Notevid
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolutionizing the way students learn from educational videos through AI-powered note generation and intelligent content extraction
            </p>
          </div>

          {/* Mission Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="bg-card rounded-xl shadow-lg border border-border p-8 md:p-12">
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-muted-foreground text-center leading-relaxed">
                S-Notevid bridges the gap between passive video consumption and active learning. 
                We believe that every educational video contains valuable insights that can be 
                transformed into structured, comprehensive study materials that enhance retention and understanding.
              </p>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Powerful Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="bg-card rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <i className="fas fa-robot text-2xl text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">AI-Powered Summaries</h3>
                <p className="text-muted-foreground">
                  Advanced AI analyzes video content to generate comprehensive, structured notes 
                  with key concepts, definitions, and takeaways.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="bg-card rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-lg mb-4">
                  <i className="fas fa-images text-2xl text-secondary"></i>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Key Image Extraction</h3>
                <p className="text-muted-foreground">
                  Automatically identifies and captures important visual elements, 
                  diagrams, and key frames that support the learning material.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="bg-card rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4">
                  <i className="fas fa-language text-2xl text-accent"></i>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Multi-Language Support</h3>
                <p className="text-muted-foreground">
                  Generate notes in multiple languages including English, Spanish, Hindi, 
                  French, and German with intelligent translation capabilities.
                </p>
              </Card>

              {/* Feature 4 */}
              <Card className="bg-card rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <i className="fas fa-link text-2xl text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Interactive References</h3>
                <p className="text-muted-foreground">
                  Click reference markers in notes to instantly view corresponding visual 
                  elements, creating an interactive study experience.
                </p>
              </Card>

              {/* Feature 5 */}
              <Card className="bg-card rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-lg mb-4">
                  <i className="fas fa-history text-2xl text-secondary"></i>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Personal History</h3>
                <p className="text-muted-foreground">
                  Keep track of all processed videos and access your generated notes 
                  anytime with a comprehensive personal history.
                </p>
              </Card>

              {/* Feature 6 */}
              <Card className="bg-card rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4">
                  <i className="fas fa-mobile-alt text-2xl text-accent"></i>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Responsive Design</h3>
                <p className="text-muted-foreground">
                  Access your study notes on any device with a fully responsive, 
                  mobile-optimized interface that works everywhere.
                </p>
              </Card>
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">How It Works</h2>
            <div className="space-y-8">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Submit Video URL</h3>
                  <p className="text-muted-foreground">Paste any educational YouTube video URL and select your preferred output language.</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-lg">2</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">AI Processing</h3>
                  <p className="text-muted-foreground">Our AI extracts the transcript, analyzes content, and identifies key visual moments.</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-lg">3</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Note Generation</h3>
                  <p className="text-muted-foreground">Comprehensive, structured study notes are generated with interactive references to key visuals.</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">4</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Study & Review</h3>
                  <p className="text-muted-foreground">Access your notes anytime, click references to view related images, and enhance your learning.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Stack */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card rounded-xl shadow-lg border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">Built with Modern Technology</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-2">
                  <i className="fab fa-python text-3xl text-primary"></i>
                  <p className="text-sm font-medium text-foreground">Python & FastAPI</p>
                </div>
                <div className="space-y-2">
                  <i className="fas fa-brain text-3xl text-secondary"></i>
                  <p className="text-sm font-medium text-foreground">Google Gemini AI</p>
                </div>
                <div className="space-y-2">
                  <i className="fab fa-youtube text-3xl text-accent"></i>
                  <p className="text-sm font-medium text-foreground">YouTube API</p>
                </div>
                <div className="space-y-2">
                  <i className="fas fa-database text-3xl text-muted-foreground"></i>
                  <p className="text-sm font-medium text-foreground">PostgreSQL</p>
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
