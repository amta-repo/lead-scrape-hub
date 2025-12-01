import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Database, Zap, User } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

const Settings = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setSession(session);
      setEmail(session.user.email || "");
      await fetchCredits(session.user.id);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setEmail(session.user.email || "");
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="border-border hover:bg-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your account and view your usage
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-gradient-card border-border shadow-card">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">Account Information</h2>
                <p className="text-muted-foreground mb-4">Your account details</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="text-base font-medium">{email}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border shadow-card">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">Lead Credits</h2>
                <p className="text-muted-foreground mb-4">Your available credits for lead generation</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {credits}
                  </span>
                  <span className="text-xl text-muted-foreground">credits remaining</span>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>1 credit = 1 lead</strong>
                    <br />
                    Each lead you generate costs 1 credit. You started with 100 free credits.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
