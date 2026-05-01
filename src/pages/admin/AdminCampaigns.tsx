import { Card } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export default function AdminCampaigns() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
        <p className="text-muted-foreground mt-1">Outreach campaigns to your leads.</p>
      </div>
      <Card className="p-12 text-center bg-gradient-card border-border">
        <Megaphone className="w-12 h-12 text-accent mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground">No active campaigns</h2>
        <p className="text-muted-foreground mt-2">
          Campaign management is coming soon.
        </p>
      </Card>
    </div>
  );
}
