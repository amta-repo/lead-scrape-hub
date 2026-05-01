import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, Zap } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export default function AdminSettings() {
  const { userId } = useIsAdmin();
  const { toast } = useToast();
  const [credits, setCredits] = useState(0);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("credits")
      .eq("user_id", userId)
      .single()
      .then(({ data }) => setCredits(data?.credits ?? 0));
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, [userId]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("redeem_refill_token", {
        _code: token.trim(),
      });
      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || "Redemption failed");
      setCredits(result.credits);
      setToken("");
      toast({
        title: "Credits added",
        description: `${result.added} credits added. New balance: ${result.credits}.`,
      });
    } catch (err: any) {
      toast({ title: "Invalid token", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and credits.</p>
      </div>

      <Card className="p-6 bg-gradient-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Account</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="text-foreground">Consultant Clinician</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="text-foreground">{email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="text-accent font-medium">Administrator</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Credits</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-bold text-foreground">{credits}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Admins start with 1,000 free credits. When credits run low, you'll be sent a one-time
          refill token by email — enter it below to add another 1,000 credits.
        </p>
      </Card>

      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">Redeem Refill Token</h2>
        </div>
        <form onSubmit={handleRedeem} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Refill Token</Label>
            <Input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your refill token here"
              required
              className="bg-secondary border-border h-11 font-mono"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !token.trim()}
            className="bg-gradient-primary text-primary-foreground font-semibold shadow-glow"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem Token"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
