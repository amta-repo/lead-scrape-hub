import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface Lead {
  id: string;
  business_name: string;
  niche: string;
  location: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  created_at: string;
}

export default function AdminSavedLeads() {
  const { userId } = useIsAdmin();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("leads")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLeads((data as Lead[]) ?? []);
        setLoading(false);
      });
  }, [userId]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Saved Leads</h1>
        <p className="text-muted-foreground mt-1">All leads you've generated.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : leads.length === 0 ? (
        <Card className="p-10 text-center bg-gradient-card border-border">
          <p className="text-muted-foreground">No leads yet. Run a search to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="p-5 bg-gradient-card border-border">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{lead.business_name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lead.niche} • {lead.location}
                  </p>
                  {lead.address && (
                    <p className="text-sm text-muted-foreground mt-1">{lead.address}</p>
                  )}
                </div>
                <div className="text-right text-sm space-y-1">
                  {lead.phone && <p className="text-foreground">{lead.phone}</p>}
                  {lead.website && (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
