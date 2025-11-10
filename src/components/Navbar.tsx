import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Share2, Menu, X, User, LogOut, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProStatus } from "@/hooks/useProStatus";
import { AuthModal } from "./AuthModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onShare: () => void;
}

export const Navbar = ({ darkMode, onToggleDarkMode, onShare }: NavbarProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { isPro, remainingDays } = useProStatus();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/app?tab=crypto", label: "Crypto" },
    { path: "/app?tab=nft", label: "NFTs" },
    { path: "/app?tab=portfolio", label: "Portfolio" },
    { path: "/about", label: "About" },
  ];

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // ✅ FIXED: Handle undefined name
  const getInitials = (name: string | undefined) => {
    if (!name || !name.trim()) {
      return 'U'; // Default to 'U' for User
    }

    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0].toUpperCase();

    // First letter of first name + first letter of last name
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
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
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? "text-primary" : "text-muted-foreground"
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

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-1">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-sm">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium flex items-center justify-between">
                    <span>{user?.name || user?.email || 'User'}</span>
                    {isPro && <Badge variant="premium">Pro</Badge>}
                  </div>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {user?.email}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/app?tab=portfolio" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      My Portfolio
                    </Link>
                  </DropdownMenuItem>
                  {isPro && (
                    <DropdownMenuItem asChild>
                      <Link to="/subscription" className="cursor-pointer">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Subscription
                        <span className="ml-auto text-xs text-muted-foreground">{remainingDays} days left</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" onClick={() => setIsAuthModalOpen(true)}>
                  Login
                </Button>
                <Button onClick={() => setIsAuthModalOpen(true)}>
                  Sign Up
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full md:hidden"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-sm z-40">
            <nav className="container mx-auto px-4 py-6">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={handleMobileLinkClick}
                    className={`text-lg font-medium py-2 px-4 rounded-lg transition-colors hover:bg-accent ${location.pathname === link.path ? "text-primary bg-accent" : "text-foreground"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {!isAuthenticated && (
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}>
                      Login
                    </Button>
                    <Button onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}>
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};