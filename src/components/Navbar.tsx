import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Share2, Menu, X, User, LogOut, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProStatus } from "@/hooks/useProStatus";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AuthModal } from "@/components/AuthModal";

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onShare: () => void;
}

export const Navbar = ({ darkMode, onToggleDarkMode, onShare }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { isPro, remainingDays } = useProStatus();

  const getInitials = (name: string | undefined) => {
    if (!name || !name.trim()) {
      return 'U';
    }

    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0].toUpperCase();

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // ✅ ADDED: Handle Get Started button click
  const handleGetStarted = () => {
    if (!isAuthenticated) {
      // Not logged in → Show login modal
      setAuthModalOpen(true);
    } else if (isPro) {
      // Pro user → Go to portfolio
      navigate('/app?tab=portfolio');
    } else {
      // Free user → Go to crypto list
      navigate('/app?tab=crypto');
    }
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/app?tab=crypto", label: "Crypto" },
    { path: "/app?tab=nft", label: "NFTs" },
    { path: "/app?tab=portfolio", label: "Portfolio" },
    { path: "/about", label: "About" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition-opacity">
              <span className="text-3xl">⚡</span>
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                CryptoFlash
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path || location.pathname + location.search === link.path
                      ? "text-primary"
                      : "text-muted-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleDarkMode}
                className="rounded-full"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onShare}
                className="rounded-full hidden sm:flex"
              >
                <Share2 className="w-5 h-5" />
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 p-2"
                    align="end"
                    sideOffset={8}
                  >
                    <div className="flex flex-col space-y-2 p-3 bg-muted/50 rounded-lg mb-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{user.email}</p>
                        {isPro ? (
                          <Badge className="bg-gradient-to-r from-purple-600 to-primary text-white">
                            Pro
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </div>
                      {user.name && (
                        <p className="text-xs text-muted-foreground">{user.name}</p>
                      )}
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        to="/app?tab=portfolio"
                        className="flex items-center py-2 px-2 hover:bg-accent rounded-md transition-colors"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span className="flex-1">My Portfolio</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        to="/checkout"
                        className="flex items-center py-2 px-2 hover:bg-accent rounded-md transition-colors"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        <div className="flex flex-col flex-1">
                          <span>Subscription</span>
                          {isPro && remainingDays !== null && (
                            <span className="text-xs text-muted-foreground">
                              {remainingDays} days left
                            </span>
                          )}
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 py-2 px-2 rounded-md transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // ✅ FIXED: Get Started now opens auth modal instead of going to checkout
                <Button size="sm" className="rounded-full" onClick={handleGetStarted}>
                  Get Started
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${location.pathname === link.path || location.pathname + location.search === link.path
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent"
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ✅ ADDED: Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};