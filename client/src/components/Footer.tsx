export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-primary">S-Notevid 📝</h3>
            <span className="text-muted-foreground">|</span>
            <p className="text-muted-foreground">AI-Powered Educational Notes</p>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Privacy Policy
            </a>
            <div className="flex items-center space-x-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 S-Notevid. Built for students, by students. Empowering education through AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
