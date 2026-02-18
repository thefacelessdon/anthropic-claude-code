import { createClient } from "@/lib/supabase/server";
import type {
  EcosystemStats,
  StaleEntry,
  UpcomingIntervention,
  ActivityLog,
  Decision,
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
    .limit(5);

  return (data as ActivityLog[]) || [];
}

/** Decisions with status deliberating/upcoming that lock within 120 days */
export async function getFormingDecisions(): Promise<Decision[]> {
  const supabase = createClient();
  const now = new Date();
  const cutoff = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000);

  const { data } = await supabase
    .from("decisions")
    .select("*")
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
    .in("status", ["deliberating", "upcoming"])
    .lte("locks_date", cutoff.toISOString().split("T")[0])
    .order("locks_date", { ascending: true })
    .limit(4);

  return (data as Decision[]) || [];
}

/** Get published output for a decision (if any) */
export async function getOutputForDecision(
  decisionId: string
): Promise<{ title: string } | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("outputs")
    .select("title")
    .eq("triggered_by_decision_id", decisionId)
    .eq("is_published", true)
    .limit(1)
    .single();

  return data as { title: string } | null;
}

/** Resolve entity name from its table instead of relying on activity_log.changes */
export async function resolveEntityName(
  entityType: string,
  entityId: string,
  changes: Record<string, unknown> | null
): Promise<string> {
  // First check if changes JSONB has a usable name
  if (changes) {
    const name =
      (changes.title as string) ||
      (changes.initiative_name as string) ||
      (changes.name as string) ||
      (changes.decision_title as string) ||
      (changes.source_name as string);
    if (name) return name;
  }

  const tableMap: Record<string, { table: string; nameField: string }> = {
    organization: { table: "organizations", nameField: "name" },
    investment: { table: "investments", nameField: "initiative_name" },
    decision: { table: "decisions", nameField: "decision_title" },
    precedent: { table: "precedents", nameField: "name" },
    opportunity: { table: "opportunities", nameField: "title" },
    narrative: { table: "narratives", nameField: "source_name" },
    output: { table: "outputs", nameField: "title" },
    practitioner: { table: "practitioners", nameField: "name" },
  };

  const config = tableMap[entityType];
  if (!config) return entityType;

  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic table lookup
  const { data } = await (supabase as any)
    .from(config.table)
    .select(config.nameField)
    .eq("id", entityId)
    .single();

  const row = data as Record<string, string> | null;
  return row?.[config.nameField] || entityType;
}
