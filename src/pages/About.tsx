import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";

const About = () => {
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
          About CryptoFlash
        </h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-lg">
            CryptoFlash is a free, real-time cryptocurrency and NFT price tracker built for speed, simplicity, and transparency.
          </p>
          
          <p>
            Created by <strong className="text-foreground">Hamza Aslam</strong>, an indie developer passionate about Web3 tools and making crypto data accessible to everyone. No paywalls, no cluttered ads blocking your data, no annoying sign-ups.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why CryptoFlash?</h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>⚡ Real-time prices for 1000+ cryptocurrencies</li>
            <li>🖼️ Live NFT floor prices and collection stats</li>
            <li>📊 Portfolio tracker with P&L calculations (stored locally, private)</li>
            <li>🎨 Beautiful dark mode with smooth animations</li>
            <li>📱 Mobile-first, responsive design</li>
            <li>🔓 Free forever, no account required</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Our Mission</h2>
          <p>
            To democratize access to crypto market data. Whether you're a trader, investor, or just curious about Bitcoin's price, CryptoFlash gives you instant insights without friction.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Connect</h2>
          <p>
            Follow the creator on{" "}
            <a
              href="https://x.com/hamzaaslam"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              X (Twitter)
            </a>{" "}
            or{" "}
            <a
              href="https://linkedin.com/in/hamzaaslam"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              LinkedIn
            </a>
            . Have feedback? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>.
          </p>

          <div className="mt-12 p-6 border border-border rounded-xl bg-card">
            <p className="text-center text-lg">
              Ready to track your portfolio?{" "}
              <Link to="/?tab=portfolio" className="text-primary font-semibold hover:underline">
                Start tracking now →
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
