import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, Users, Megaphone, DollarSign } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const REVENUE_PER_LEAD = 5; // $ per lead

export default function AdminLeadSearch() {
  const { userId } = useIsAdmin();
  const { toast } = useToast();
  const [credits, setCredits] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [leadCount, setLeadCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const [{ data: profile }, { count }] = await Promise.all([
        supabase.from("profiles").select("credits").eq("user_id", userId).single(),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", userId),
      ]);
      setCredits(profile?.credits ?? 0);
      setTotalLeads(count ?? 0);
    };
    load();
  }, [userId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (credits < leadCount) {
      toast({
        title: "Insufficient credits",
        description: "Redeem a refill token in Settings to add more credits.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      fetch("https://hooks.zapier.com/hooks/catch/19975848/ukfokes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          niche,
          location,
          numberOfLeads: leadCount,
          email: session?.user?.email || "",
          name: session?.user?.user_metadata?.full_name || "Admin",
        }),
      }).catch(() => {});

      const { data, error } = await supabase.functions.invoke("generate-leads", {
        body: { niche, location, count: leadCount },
      });
      if (error) throw error;
      toast({
        title: "Leads generated",
        description: `${data.leads.length} leads added. ${data.creditsRemaining} credits left.`,
      });
      setCredits(data.creditsRemaining);
      setTotalLeads((n) => n + data.leads.length);
      setNiche("");
      setLocation("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Leads Found",
      value: totalLeads.toLocaleString(),
      icon: Users,
    },
    {
      label: "Active Campaigns",
      value: "0",
      icon: Megaphone,
    },
    {
      label: "Potential Revenue",
      value: `$${(totalLeads * REVENUE_PER_LEAD).toLocaleString()}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lead Search</h1>
        <p className="text-muted-foreground mt-1">Find new prospects by niche and location.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 bg-gradient-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <s.icon className="w-5 h-5 text-accent" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 bg-gradient-card border-border shadow-card">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="niche">Niche</Label>
              <Input
                id="niche"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g., dentist, plumber"
                required
                className="bg-secondary border-border h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York"
                required
                className="bg-secondary border-border h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="count">Number of Leads ({leadCount} credits)</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={500}
              value={leadCount}
              onChange={(e) => setLeadCount(parseInt(e.target.value) || 1)}
              className="bg-secondary border-border h-11"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || credits < leadCount}
            className="w-full h-11 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" /> Generate {leadCount} Leads
              </>
            )}
          </Button>
          {credits < leadCount && (
            <p className="text-destructive text-sm text-center">
              Insufficient credits — redeem a refill token in Settings.
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
