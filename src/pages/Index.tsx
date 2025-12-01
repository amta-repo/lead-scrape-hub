import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Database, Zap, Shield, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="border-b border-border bg-card/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Database className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LeadGen
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-border hover:bg-secondary"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate("/auth")}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Generate Quality Leads
              <br />
              In Seconds
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              Find potential customers for any niche and location. Simple, fast, and effective lead generation for your business.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow text-lg px-8 h-14 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start with 100 Free Credits
            </Button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-card hover:shadow-glow transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-300">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Generate hundreds of leads in seconds. No manual searching or data entry required.
              </p>
            </div>

            <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-card hover:shadow-glow transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-400">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Quality Data</h3>
              <p className="text-muted-foreground">
                Get accurate business information including names, addresses, phone numbers, and websites.
              </p>
            </div>

            <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-card hover:shadow-glow transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-500">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Simple Pricing</h3>
              <p className="text-muted-foreground">
                1 credit = 1 lead. Start with 100 free credits. No subscriptions or hidden fees.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-gradient-card p-12 rounded-3xl border border-border shadow-card text-center">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ready to Generate Leads?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join hundreds of businesses finding their next customers
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow text-lg px-8 h-14"
            >
              Get Started Free
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/30 backdrop-blur-lg mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center">
            <p className="text-muted-foreground">
              © 2025 LeadGen. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
