import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer" data-testid="logo">
                S-Notevid 📝
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`font-medium transition-colors ${
              location === "/" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-primary"
            }`}>
              Home
            </Link>
            <Link href="/about" className={`font-medium transition-colors ${
              location === "/about" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-primary"
            }`}>
              About
            </Link>
            {isAuthenticated && (
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="font-medium"
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            )}
          </nav>
          
          <button 
            className="md:hidden"
            onClick={toggleMobileMenu}
            data-testid="button-mobile-menu"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border" data-testid="mobile-menu">
          <div className="px-4 py-2 space-y-2">
            <Link href="/" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link href="/about" className="block py-2 text-muted-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-destructive hover:text-destructive/80 transition-colors font-medium"
                data-testid="button-mobile-logout"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
