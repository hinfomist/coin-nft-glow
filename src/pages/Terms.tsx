import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";

const Terms = () => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} onShare={handleShare} />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Terms of Use
        </h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-sm text-muted-foreground">Last updated: January 2025</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Acceptance of Terms</h2>
          <p>
            By accessing and using CryptoFlash, you agree to these Terms of Use. If you do not agree, please discontinue use immediately.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Free Service</h2>
          <p>
            CryptoFlash is a <strong className="text-foreground">free tool</strong> provided "as is" without warranties of any kind. We strive for accuracy but do not guarantee uninterrupted service or error-free data.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Not Financial Advice</h2>
          <p>
            All data on CryptoFlash is for <strong className="text-foreground">informational purposes only</strong>. This is <strong className="text-foreground">not financial, investment, or trading advice</strong>. Cryptocurrency investments are risky. Always do your own research (DYOR) and consult a financial advisor before making decisions.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Data Sources</h2>
          <p>
            Price data is sourced from CoinGecko's public API. We are not responsible for data accuracy or availability. Check official sources for critical decisions.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Affiliate Disclosure</h2>
          <p>
            CryptoFlash may include affiliate links (e.g., to Binance, OpenSea). We may earn commissions from qualifying purchases at no extra cost to you. All affiliates are disclosed transparently.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">User Conduct</h2>
          <p>
            You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Use the service for illegal activities</li>
            <li>Overload or disrupt servers (e.g., via bots, scraping)</li>
            <li>Reverse engineer or copy the codebase without permission</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Limitation of Liability</h2>
          <p>
            CryptoFlash and its creator (Hamza Aslam) are not liable for any losses, damages, or consequences arising from use of this service, including but not limited to trading losses, missed opportunities, or data inaccuracies.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms at any time. Continued use constitutes acceptance of updated terms.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Contact</h2>
          <p>
            Questions? Email <a href="mailto:hamza@cryptoflash.app" className="text-primary hover:underline">hamza@cryptoflash.app</a> or visit our <a href="/contact" className="text-primary hover:underline">contact page</a>.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
