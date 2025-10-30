import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, Shield, Bell, PieChart, Zap, Users, Star, CheckCircle, ArrowRight, Play, BarChart3, DollarSign, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingModal } from "@/components/PricingModal";

const Landing = () => {
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  const handleShare = () => {
    const shareUrl = window.location.origin;
    navigator.clipboard.writeText(shareUrl);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "Real-Time Price Tracking",
      description: "Live cryptocurrency prices updated every 30 seconds with 24/7 monitoring across 50+ coins."
    },
    {
      icon: <PieChart className="w-8 h-8 text-primary" />,
      title: "Portfolio Analytics",
      description: "Track your investments with detailed P&L analysis, visual charts, and performance metrics."
    },
    {
      icon: <Bell className="w-8 h-8 text-primary" />,
      title: "Smart Price Alerts",
      description: "Get notified via email when cryptocurrencies reach your target prices - above or below."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Secure & Private",
      description: "Your data stays private with secure authentication and encrypted storage."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Advanced Filtering",
      description: "Sort and filter cryptocurrencies by market cap, price change, gainers, losers, and more."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Lightning Fast",
      description: "Optimized performance with instant search and real-time updates across all devices."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Crypto Investor",
      content: "CryptoFlash has transformed how I track my investments. The real-time alerts saved me from missing a 15% BTC pump!",
      avatar: "SC"
    },
    {
      name: "Mike Rodriguez",
      role: "Day Trader",
      content: "The portfolio analytics are incredible. I can see my P&L at a glance and make informed decisions quickly.",
      avatar: "MR"
    },
    {
      name: "Emma Thompson",
      role: "DeFi Enthusiast",
      content: "Clean interface, fast updates, and reliable alerts. This is the crypto dashboard I've been waiting for.",
      avatar: "ET"
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: <Users className="w-6 h-6" /> },
    { label: "Cryptocurrencies", value: "50+", icon: <TrendingUp className="w-6 h-6" /> },
    { label: "Price Alerts Sent", value: "2M+", icon: <Bell className="w-6 h-6" /> },
    { label: "Uptime", value: "99.9%", icon: <Shield className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Google Analytics */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `
        }}
      />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "CryptoFlash",
            "description": "Real-time cryptocurrency price tracking, portfolio analytics, and smart price alerts",
            "url": "https://cryptoflash.app",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "author": {
              "@type": "Person",
              "name": "Hamza Aslam"
            }
          })
        }}
      />

      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onShare={handleShare}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="px-3 py-1">
                  🚀 Now Tracking 50+ Cryptocurrencies
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Track Crypto Prices
                  <span className="text-primary block">Like a Pro</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Real-time cryptocurrency tracking with portfolio analytics, smart price alerts, and advanced filtering. No ads, no sign-ups required.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8" onClick={() => navigate('/app?tab=crypto')}>
                  Start Tracking Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => setPricingModalOpen(true)}>
                  <Zap className="w-5 h-5 mr-2" />
                  View Pro Features
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Free Forever
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  No Credit Card
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Real-time Updates
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card border rounded-xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Live Crypto Prices</h3>
                  <Badge variant="secondary">Live</Badge>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Bitcoin", symbol: "BTC", price: "43,250.80", change: "+2.34%", up: true },
                    { name: "Ethereum", symbol: "ETH", price: "2,650.45", change: "+1.87%", up: true },
                    { name: "Solana", symbol: "SOL", price: "98.32", change: "-0.45%", up: false },
                    { name: "Cardano", symbol: "ADA", price: "0.485", change: "+5.21%", up: true }
                  ].map((coin, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                          {coin.symbol[0]}
                        </div>
                        <div>
                          <div className="font-medium">{coin.name}</div>
                          <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${coin.price}</div>
                        <div className={`text-sm ${coin.up ? 'text-green-600' : 'text-red-600'}`}>
                          {coin.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need for Crypto Success
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed for both beginners and experienced traders
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Loved by Crypto Enthusiasts Worldwide
            </h2>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-muted-foreground">4.9/5 rating from 10,000+ users</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Master Your Crypto Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of traders who trust CryptoFlash for their cryptocurrency tracking needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => navigate('/app?tab=crypto')}>
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={() => setPricingModalOpen(true)}>
              <DollarSign className="w-5 h-5 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
          <p className="text-sm mt-4 opacity-75">
            Free forever • No credit card required • Upgrade anytime
          </p>
        </div>
      </section>

      <Footer />

      {/* Pricing Modal */}
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />
    </div>
  );
};

export default Landing;
