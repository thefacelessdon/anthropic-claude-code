"use server";

import { createClient } from "@/lib/supabase/server";
import type { OpportunityType } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

// ─── Approve opportunity submission ──────────────────

export async function approveOpportunity(
  submissionId: string,
  data: {
    title: string;
    opportunity_type: string;
    source_org_id?: string;
    source_name?: string;
    amount_min?: number;
    amount_max?: number;
    deadline?: string;
    description?: string;
    eligibility?: string;
    application_url?: string;
  }
) {
  const supabase = createClient();

  // Create the opportunity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: opp, error: oppError } = await (supabase.from("opportunities") as any)
    .insert({
      ecosystem_id: NWA_ECOSYSTEM_ID,
      opportunity_type: data.opportunity_type as OpportunityType,
      title: data.title,
      source_org_id: data.source_org_id || null,
      source_name: data.source_name || null,
      amount_min: data.amount_min || null,
      amount_max: data.amount_max || null,
      deadline: data.deadline || null,
      description: data.description || null,
      eligibility: data.eligibility || null,
      application_url: data.application_url || null,
      status: "open",
      submitted_externally: true,
    })
    .select("id")
    .single();

  if (oppError) {
    console.error("approveOpportunity create error:", oppError);
    return { error: oppError.message };
  }

  // Mark submission as approved
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase.from("submissions") as any)
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      created_entity_id: opp.id,
    })
    .eq("id", submissionId);

  if (updateError) {
    console.error("approveOpportunity update error:", updateError);
    return { error: updateError.message };
  }

  return { success: true, entityId: opp.id };
}

// ─── Approve decision flag ──────────────────────────

export async function approveDecisionFlag(
  submissionId: string,
  data: {
    decision_title: string;
    stakeholder_org_id?: string;
    stakeholder_name?: string;
    description?: string;
    locks_date?: string;
    status?: string;
    intervention_needed?: string;
  }
) {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dec, error: decError } = await (supabase.from("decisions") as any)
    .insert({
      ecosystem_id: NWA_ECOSYSTEM_ID,
      decision_title: data.decision_title,
      stakeholder_org_id: data.stakeholder_org_id || null,
      stakeholder_name: data.stakeholder_name || null,
      description: data.description || null,
      locks_date: data.locks_date || null,
      status: data.status || "upcoming",
      intervention_needed: data.intervention_needed || null,
    })
    .select("id")
    .single();

  if (decError) {
    console.error("approveDecisionFlag create error:", decError);
    return { error: decError.message };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase.from("submissions") as any)
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      created_entity_id: dec.id,
    })
    .eq("id", submissionId);

  if (updateError) console.error("approveDecisionFlag update error:", updateError);

  return { success: true, entityId: dec.id };
}

// ─── Approve practitioner tip ───────────────────────

export async function approvePractitionerTip(
  submissionId: string,
  data: {
    name: string;
    discipline: string;
    tenure?: string;
    notes?: string;
    website?: string;
  }
) {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: prac, error: pracError } = await (supabase.from("practitioners") as any)
    .insert({
      ecosystem_id: NWA_ECOSYSTEM_ID,
      name: data.name,
      discipline: data.discipline,
      tenure_years: null,
      notes: data.notes || null,
    })
    .select("id")
    .single();

  if (pracError) {
    console.error("approvePractitionerTip create error:", pracError);
    return { error: pracError.message };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase.from("submissions") as any)
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      created_entity_id: prac.id,
    })
    .eq("id", submissionId);

  if (updateError) console.error("approvePractitionerTip update error:", updateError);

  return { success: true, entityId: prac.id };
}

// ─── Reject / Dismiss submission ────────────────────

export async function rejectSubmission(submissionId: string, reason?: string) {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("submissions") as any)
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      review_notes: reason || null,
    })
    .eq("id", submissionId);

  if (error) {
    console.error("rejectSubmission error:", error);
    return { error: error.message };
  }
  return { success: true };
}

// ─── Submit decision flag (public form) ─────────────

export async function submitDecisionFlag(formData: FormData) {
  const organization = (formData.get("organization") as string)?.trim();
  const whatBeingDecided = (formData.get("what_being_decided") as string)?.trim();

  if (!organization || !whatBeingDecided) {
    return { success: false, error: "Organization and decision description are required." };
  }

  const supabase = createClient();

  const data = {
    organization,
    what_being_decided: whatBeingDecided,
    approximate_lock_date: (formData.get("lock_date") as string)?.trim() || null,
    context: (formData.get("context") as string)?.trim() || null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("submissions") as any)
    .insert({
      ecosystem_id: NWA_ECOSYSTEM_ID,
      submission_type: "decision_flag",
      data,
      submitter_name: (formData.get("submitter_name") as string)?.trim() || null,
      submitter_email: (formData.get("submitter_email") as string)?.trim() || null,
      status: "pending",
    });

  if (error) {
    console.error("submitDecisionFlag error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
  return { success: true };
}

// ─── Submit practitioner tip (public form) ──────────

export async function submitPractitionerTip(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const discipline = (formData.get("discipline") as string)?.trim();

  if (!name || !discipline) {
    return { success: false, error: "Practitioner name and discipline are required." };
  }

  const supabase = createClient();

  const data = {
    name,
    discipline,
    tenure: (formData.get("tenure") as string)?.trim() || null,
    context: (formData.get("context") as string)?.trim() || null,
    website: (formData.get("website") as string)?.trim() || null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("submissions") as any)
    .insert({
      ecosystem_id: NWA_ECOSYSTEM_ID,
      submission_type: "practitioner_tip",
      data,
      submitter_name: (formData.get("submitter_name") as string)?.trim() || null,
      submitter_email: (formData.get("submitter_email") as string)?.trim() || null,
      status: "pending",
    });

  if (error) {
    console.error("submitPractitionerTip error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
  return { success: true };
}
