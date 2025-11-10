import { useProStatus } from "@/hooks/useProStatus";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SubscriptionPage = () => {
    const { isPro, remainingDays, expiresAt } = useProStatus();
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">Your Subscription</CardTitle>
                    <CardDescription>Manage your plan and billing details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                        <div>
                            <p className="font-semibold">Current Plan</p>
                            <p className="text-sm text-muted-foreground">
                                {isPro ? "Pro Plan" : "Free Plan"}
                            </p>
                        </div>
                        <Badge variant={isPro ? "premium" : "secondary"}>
                            {isPro ? "Active" : "Inactive"}
                        </Badge>
                    </div>

                    {isPro && expiresAt && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Subscription Details</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Renews on</span>
                                <span>{expiresAt.toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Remaining time</span>
                                <span>{remainingDays} days</span>
                            </div>
                        </div>
                    )}

                    {!isPro && (
                        <div className="text-center p-4 border-dashed border-2 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Unlock all features and get unlimited access.
                            </p>
                            <Button onClick={() => navigate('/#pricing')}>View Pricing Plans</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SubscriptionPage;
