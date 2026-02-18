import { createClient } from "@/lib/supabase/server";
import type {
  EcosystemStats,
  StaleEntry,
  UpcomingIntervention,
  ActivityLog,
} from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export async function getEcosystemStats(): Promise<EcosystemStats | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("ecosystem_stats")
    .select("*")
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
    .single();

  return data as EcosystemStats | null;
}

export async function getStaleEntries(): Promise<StaleEntry[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("stale_entries")
    .select("*")
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
    .order("last_reviewed_at", { ascending: true })
    .limit(20);

  return (data as StaleEntry[]) || [];
}

export async function getUpcomingInterventions(): Promise<
  UpcomingIntervention[]
> {
  const supabase = createClient();
  const { data } = await supabase
    .from("upcoming_interventions")
    .select("*")
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
    .limit(10);

  return (data as UpcomingIntervention[]) || [];
}

export async function getRecentActivity(): Promise<ActivityLog[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
    .order("created_at", { ascending: false })
    .limit(10);

  return (data as ActivityLog[]) || [];
}
