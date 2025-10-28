import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Share2 } from "lucide-react";

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onShare: () => void;
}

export const Navbar = ({ darkMode, onToggleDarkMode, onShare }: NavbarProps) => {
  const location = useLocation();
  
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/?tab=crypto", label: "Crypto" },
    { path: "/?tab=nft", label: "NFTs" },
    { path: "/?tab=portfolio", label: "Portfolio" },
    { path: "/about", label: "About" },
  ];

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">⚡</span>
          <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            CryptoFlash
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
            className="rounded-full"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="rounded-full"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
