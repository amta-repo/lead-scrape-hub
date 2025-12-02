import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, Settings, LogOut, Zap } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number>(0);
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [leadCount, setLeadCount] = useState(10);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setSession(session);
      await fetchCredits(session.user.id);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchCredits(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchCredits = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("credits")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching credits:", error);
      return;
    }

    setCredits(data?.credits || 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleGenerateLeads = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (credits < leadCount) {
      toast({
        title: "Insufficient credits",
        description: `You need ${leadCount} credits but only have ${credits}.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Trigger Zapier webhook
      fetch("https://hooks.zapier.com/hooks/catch/19975848/ukfokes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          niche,
          location,
          numberOfLeads: leadCount,
          email: session?.user?.email || "",
          name: session?.user?.user_metadata?.full_name || session?.user?.email || "",
        }),
      }).catch(err => console.log("Zapier webhook error:", err));

      const { data, error } = await supabase.functions.invoke("generate-leads", {
        body: { niche, location, count: leadCount },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Generated ${data.leads.length} leads. ${data.creditsRemaining} credits remaining.`,
      });

      setCredits(data.creditsRemaining);
      setNiche("");
      setLocation("");
      setLeadCount(10);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-secondary border border-border">
                <Zap className="w-4 h-4 text-accent" />
                <span className="font-semibold text-foreground">{credits}</span>
                <span className="text-muted-foreground text-sm">credits</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/settings")}
                className="border-border hover:bg-secondary"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-border hover:bg-secondary"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Generate Quality Leads
            </h1>
            <p className="text-muted-foreground text-lg">
              Enter your target niche and location to find potential customers
            </p>
          </div>

          <Card className="p-8 bg-gradient-card border-border shadow-card">
            <form onSubmit={handleGenerateLeads} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="niche" className="text-base">Niche</Label>
                <Input
                  id="niche"
                  type="text"
                  placeholder="e.g., dentist, hair salon, plumber"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  required
                  className="bg-secondary border-border transition-all focus:shadow-glow h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-base">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., New York, Los Angeles, Miami"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="bg-secondary border-border transition-all focus:shadow-glow h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="count" className="text-base">
                  Number of Leads ({leadCount} credits)
                </Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={leadCount}
                  onChange={(e) => setLeadCount(parseInt(e.target.value) || 1)}
                  required
                  className="bg-secondary border-border transition-all focus:shadow-glow h-12 text-base"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow transition-all h-12 text-base"
                disabled={loading || credits < leadCount}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate {leadCount} Leads
                  </>
                )}
              </Button>

              {credits < leadCount && (
                <p className="text-destructive text-sm text-center">
                  You need {leadCount - credits} more credits to generate these leads
                </p>
              )}
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
