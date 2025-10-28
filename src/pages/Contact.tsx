import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const { toast } = useToast();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create mailto link
    const mailtoLink = `mailto:hamza@cryptoflash.app?subject=CryptoFlash Feedback from ${formData.name}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    window.location.href = mailtoLink;
    
    toast({
      title: "Opening email client...",
      description: "Your default email app should open shortly",
    });
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} onShare={handleShare} />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Contact Us
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              Have questions, feedback, or feature requests? We'd love to hear from you!
            </p>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Get in Touch</h2>
              <p>
                <strong className="text-foreground">Email:</strong>{" "}
                <a href="mailto:hamza@cryptoflash.app" className="text-primary hover:underline">
                  hamza@cryptoflash.app
                </a>
              </p>
              <p>
                <strong className="text-foreground">X (Twitter):</strong>{" "}
                <a
                  href="https://x.com/hamzaaslam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @hamzaaslam
                </a>
              </p>
              <p>
                <strong className="text-foreground">LinkedIn:</strong>{" "}
                <a
                  href="https://linkedin.com/in/hamzaaslam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  /in/hamzaaslam
                </a>
              </p>
            </div>

            <div className="mt-8 p-4 border border-border rounded-xl bg-card">
              <p className="text-sm">
                <strong className="text-foreground">Response Time:</strong> We typically respond within 24-48 hours.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                  Message
                </label>
                <Textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                />
              </div>

              <Button type="submit" className="w-full">
                Send Message
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Clicking "Send" will open your email client
              </p>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
