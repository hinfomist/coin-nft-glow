import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border mt-12">
      <div className="container mx-auto px-4 py-8">
        {/* AdSense Leaderboard */}
        <div className="mb-8 flex justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-YOUR_ID"
            data-ad-slot="YOUR_SLOT"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <a
              href="https://www.coingecko.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CoinGecko
            </a>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          <div className="text-sm text-muted-foreground">
            Built with ❤️ by{" "}
            <a
              href="https://x.com/hamzaaslam"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Hamza Aslam
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground">
            © 2025 CryptoFlash. Free forever. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
};
