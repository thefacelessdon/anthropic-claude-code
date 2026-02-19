"use server";

import { createClient } from "@/lib/supabase/server";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

// Helper to get an untyped supabase client for new tables not yet fully typed
function rawFrom(supabase: ReturnType<typeof createClient>, table: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table);
}

export async function completeMilestone(
  milestoneId: string,
  engagementId: string
): Promise<{ success: boolean }> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { error } = await rawFrom(supabase, "engagement_milestones")
    .update({ completed_at: now })
    .eq("id", milestoneId);

  if (!error) {
    const { data: milestone } = await rawFrom(supabase, "engagement_milestones")
      .select("title")
      .eq("id", milestoneId)
      .single();

    await rawFrom(supabase, "engagement_activity").insert({
      engagement_id: engagementId,
      actor: "practitioner",
      action: "Completed milestone",
      detail: (milestone as { title: string } | null)?.title || "",
    });
  }

  return { success: !error };
}

export async function submitDeliverable(
  deliverableId: string,
  engagementId: string,
  fileUrl?: string
): Promise<{ success: boolean }> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = { submitted_at: now };
  if (fileUrl) updateData.file_url = fileUrl;

  const { error } = await rawFrom(supabase, "engagement_deliverables")
    .update(updateData)
    .eq("id", deliverableId);

  if (!error) {
    const { data: deliverable } = await rawFrom(supabase, "engagement_deliverables")
      .select("title")
      .eq("id", deliverableId)
      .single();

    await rawFrom(supabase, "engagement_activity").insert({
      engagement_id: engagementId,
      actor: "practitioner",
      action: "Submitted deliverable",
      detail: (deliverable as { title: string } | null)?.title || "",
    });
  }

  return { success: !error };
}

export async function confirmComplete(
  engagementId: string,
  role: "practitioner" | "funder"
): Promise<{ success: boolean }> {
  const supabase = createClient();
  const now = new Date().toISOString();

  if (role === "practitioner") {
    await rawFrom(supabase, "engagements")
      .update({ practitioner_confirmed_complete: true })
      .eq("id", engagementId);

    await rawFrom(supabase, "engagement_activity").insert({
      engagement_id: engagementId,
      actor: "practitioner",
      action: "Confirmed completion",
      detail: null,
    });
  } else {
    await rawFrom(supabase, "engagements")
      .update({ funder_confirmed_complete: true })
      .eq("id", engagementId);

    await rawFrom(supabase, "engagement_activity").insert({
      engagement_id: engagementId,
      actor: "funder",
      action: "Confirmed completion",
      detail: null,
    });
  }

  // Check if both confirmed — if so, complete the engagement
  const { data } = await rawFrom(supabase, "engagements")
    .select("practitioner_confirmed_complete, funder_confirmed_complete, title, total_amount, funder_org_id, opportunity_id, profile_id")
    .eq("id", engagementId)
    .single();

  const eng = data as {
    practitioner_confirmed_complete: boolean;
    funder_confirmed_complete: boolean;
    title: string;
    total_amount: number | null;
    funder_org_id: string | null;
    opportunity_id: string | null;
    profile_id: string;
  } | null;

  if (eng?.practitioner_confirmed_complete && eng?.funder_confirmed_complete) {
    // Mark complete
    await rawFrom(supabase, "engagements")
      .update({ status: "complete", completed_at: now })
      .eq("id", engagementId);

    await rawFrom(supabase, "engagement_activity").insert({
      engagement_id: engagementId,
      actor: "system",
      action: "Engagement completed",
      detail: "Both parties confirmed completion",
    });

    // Get practitioner name for investment record
    const { data: profileData } = await rawFrom(supabase, "public_profiles")
      .select("name")
      .eq("id", eng.profile_id)
      .single();
    const profileName = (profileData as { name: string } | null)?.name || "Unknown";

    // Get funder org name
    let funderName: string | null = null;
    if (eng.funder_org_id) {
      const { data: org } = await rawFrom(supabase, "organizations")
        .select("name")
        .eq("id", eng.funder_org_id)
        .single();
      funderName = (org as { name: string } | null)?.name || null;
    }

    // Create investment entry
    const { data: investmentData } = await rawFrom(supabase, "investments").insert({
        ecosystem_id: NWA_ECOSYSTEM_ID,
        initiative_name: eng.title,
        amount: eng.total_amount ? Number(eng.total_amount) : null,
        source_org_id: eng.funder_org_id,
        source_name: funderName,
        status: "completed",
        category: "direct_artist_support",
        outcome: `Completed through NWA Creative Opportunities. Practitioner: ${profileName}.`,
        compounding: "unknown",
        compounding_notes: "Pending assessment",
      })
      .select("id")
      .single();

    const investment = investmentData as { id: string } | null;
    if (investment) {
      await rawFrom(supabase, "engagements")
        .update({ investment_id: investment.id })
        .eq("id", engagementId);
    }

    // Update opportunity status if linked
    if (eng.opportunity_id) {
      await rawFrom(supabase, "opportunities")
        .update({ status: "awarded" })
        .eq("id", eng.opportunity_id);
    }
  }

  return { success: true };
}
