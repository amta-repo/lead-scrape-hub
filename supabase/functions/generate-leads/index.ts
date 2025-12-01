import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadRequest {
  niche: string;
  location: string;
  count: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request
    const { niche, location, count }: LeadRequest = await req.json();

    console.log(`Generating ${count} leads for ${niche} in ${location}`);

    // Check user credits
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      throw new Error("Failed to fetch profile");
    }

    if (profile.credits < count) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate mock leads (in production, integrate with real lead scraping API)
    const leads = [];
    const businessTypes = ["LLC", "Inc", "Co", "Group", "Services"];
    
    for (let i = 0; i < count; i++) {
      const lead = {
        business_name: `${niche.charAt(0).toUpperCase() + niche.slice(1)} ${businessTypes[i % businessTypes.length]} ${i + 1}`,
        address: `${Math.floor(Math.random() * 9999) + 1} Main St, ${location}`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        website: `www.${niche.toLowerCase().replace(/\s+/g, "")}${i + 1}.com`,
        niche,
        location,
        user_id: user.id,
      };
      leads.push(lead);
    }

    // Insert leads
    const { error: insertError } = await supabaseClient
      .from("leads")
      .insert(leads);

    if (insertError) {
      console.error("Error inserting leads:", insertError);
      throw new Error("Failed to save leads");
    }

    // Deduct credits
    const newCredits = profile.credits - count;
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ credits: newCredits })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating credits:", updateError);
      throw new Error("Failed to update credits");
    }

    console.log(`Successfully generated ${leads.length} leads. Credits remaining: ${newCredits}`);

    return new Response(
      JSON.stringify({ 
        leads, 
        creditsRemaining: newCredits,
        message: `Successfully generated ${leads.length} leads`
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error in generate-leads function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
