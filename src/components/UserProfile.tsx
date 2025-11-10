import { User, Settings, LogOut, TrendingUp, Bell, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useProStatus } from "@/hooks/useProStatus";

export const UserProfile = () => {
  const { user, logout, getPortfolioCount, getAlertsCount } = useAuth();
  const { isPro, loading: proLoading, expiresAt } = useProStatus();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <Avatar className="w-16 h-16 mx-auto">
          <AvatarFallback className="text-lg font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <Badge variant={isPro ? 'default' : 'secondary'} className="flex items-center gap-1">
              {isPro ? <Crown className="w-3 h-3" /> : null}
              {isPro ? 'Pro' : 'Free'}
            </Badge>
            {isPro && expiresAt && (
              <span className="text-xs text-muted-foreground ml-2">{Math.max(0, Math.ceil((expiresAt.getTime() - Date.now())/86400000))} days left</span>
            )}
          </div>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Member since {user.createdAt.toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
              <TrendingUp className="w-5 h-5" />
              {getPortfolioCount()}
            </div>
            <p className="text-sm text-muted-foreground">Portfolio Holdings</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
              <Bell className="w-5 h-5" />
              {getAlertsCount()}
            </div>
            <p className="text-sm text-muted-foreground">Active Alerts</p>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <Button variant="outline" className="w-full" disabled>
            <Settings className="w-4 h-4 mr-2" />
            Account Settings (Coming Soon)
          </Button>
          <Button variant="outline" onClick={logout} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </Card>
  );
};
