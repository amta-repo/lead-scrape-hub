import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

const ADMIN_USERNAME = "xtenovadmin";
const ADMIN_EMAIL = "xtenovadmin@admin.local";
const ADMIN_PASSWORD = "@fluxgen26";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (data) navigate("/admin/dashboard");
    });
  }, [navigate]);

  const ensureAdminRole = async (userId: string) => {
    await supabase.from("user_roles").insert({ user_id: userId, role: "admin" } as any);
    // Top up to admin allotment if first time
    await supabase
      .from("profiles")
      .update({ credits: 1000 })
      .eq("user_id", userId)
      .lt("credits", 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        throw new Error("Invalid admin credentials");
      }

      // Try sign in first
      let { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (error) {
        // Account doesn't exist yet — create it
        const signUp = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          options: {
            emailRedirectTo: `${window.location.origin}/admin/dashboard`,
            data: { full_name: "Consultant Clinician" },
          },
        });
        if (signUp.error) throw signUp.error;

        // Sign in (works only if email confirmation is disabled)
        const retry = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });
        if (retry.error) {
          throw new Error(
            "Admin account created. Disable email confirmation in auth settings and try again."
          );
        }
        data = retry.data;
      }

      if (data.user) await ensureAdminRole(data.user.id);

      toast({ title: "Welcome, Admin", description: "Login successful." });
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md p-8 bg-gradient-card border-border shadow-card">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 shadow-glow">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Access
          </h1>
          <p className="text-muted-foreground text-center mt-2">Restricted area</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow h-11"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
