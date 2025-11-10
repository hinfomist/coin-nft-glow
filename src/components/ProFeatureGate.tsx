import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Zap } from 'lucide-react';

interface ProFeatureGateProps {
    children: React.ReactNode;
    feature?: string;
    showUpgrade?: boolean;
}

export const ProFeatureGate: React.FC<ProFeatureGateProps> = ({
    children,
    feature = 'this feature',
    showUpgrade = true
}) => {
    const { isPro, daysRemaining, user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>;
    }

    // If user is Pro with active subscription, show the feature
    if (isPro && daysRemaining > 0) {
        return <>{children}</>;
    }

    // Show upgrade prompt for non-Pro users
    if (!showUpgrade) {
        return null;
    }

    return (
        <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-purple-500/10">
                        <Crown className="h-5 w-5 text-purple-500" />
                    </div>
                    <CardTitle className="text-xl">Pro Feature Locked</CardTitle>
                </div>
                <CardDescription>
                    Upgrade to Pro to unlock {feature} and many more advanced features.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Unlimited portfolio holdings</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Advanced price alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Real-time data refresh</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">NFT portfolio tracking</span>
                    </div>
                </div>

                <Button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro - $9.99/month
                </Button>
            </CardContent>
        </Card>
    );
};

// Usage Limit Component
export const UsageLimitIndicator = () => {
    const { user, isPro, canUseFeature, planLimit, usageCount } = useAuth();

    if (!user) return null;

    const percentage = Math.round((usageCount / planLimit) * 100);
    const isNearLimit = percentage >= 80;

    return (
        <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Usage</span>
                    {isPro && <Badge variant="default" className="text-xs"><Crown className="h-3 w-3 mr-1" />Pro</Badge>}
                </div>
                <span className="text-sm text-muted-foreground">
                    {usageCount} / {planLimit}
                </span>
            </div>

            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full transition-all ${isNearLimit ? 'bg-red-500' : isPro ? 'bg-purple-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>

            {!canUseFeature() && (
                <p className="text-xs text-destructive mt-2">
                    <Lock className="h-3 w-3 inline mr-1" />
                    Usage limit reached. {!isPro && 'Upgrade to Pro for unlimited access.'}
                </p>
            )}
        </div>
    );
};

// Pro Badge Component
export const ProBadge = () => {
    const { isPro, daysRemaining } = useAuth();

    if (!isPro) return null;

    return (
        <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500">
            <Crown className="h-3 w-3 mr-1" />
            Pro {daysRemaining > 0 && `(${daysRemaining} days)`}
        </Badge>
    );
};