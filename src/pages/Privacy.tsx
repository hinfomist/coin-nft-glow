import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";

const Privacy = () => {
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
          Privacy Policy
        </h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-sm text-muted-foreground">Last updated: January 2025</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Data Collection</h2>
          <p>
            CryptoFlash is committed to your privacy. We do <strong className="text-foreground">not</strong> collect, store, or share any personal information. All data displayed is fetched directly from CoinGecko's public API.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Local Storage</h2>
          <p>
            Your portfolio data (coins, quantities) is stored locally in your browser's localStorage. This data never leaves your device and is not transmitted to any server. You can clear it anytime via your browser settings.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Cookies</h2>
          <p>
            We do not use tracking cookies. We only use essential browser storage (localStorage) for app functionality like dark mode preferences and portfolio data.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Third-Party Services</h2>
          <p>
            We use the following third-party services:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-foreground">CoinGecko API:</strong> For real-time crypto and NFT price data. See their <a href="https://www.coingecko.com/en/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy policy</a>.</li>
            <li><strong className="text-foreground">Google AdSense:</strong> For non-intrusive advertisements. Google may collect anonymized data. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's privacy policy</a>.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">GDPR Compliance</h2>
          <p>
            As we do not collect personal data, CryptoFlash is fully GDPR-compliant. Your browser-stored data is under your control and can be deleted at any time.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Contact</h2>
          <p>
            Questions about privacy? Email us at <a href="mailto:hamza@cryptoflash.app" className="text-primary hover:underline">hamza@cryptoflash.app</a> or visit our <a href="/contact" className="text-primary hover:underline">contact page</a>.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
