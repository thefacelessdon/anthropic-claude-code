"use server";

import { createClient } from "@/lib/supabase/server";
import type { Submission } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export interface SubmitResult {
  success: boolean;
  error?: string;
}

export async function submitOpportunity(
  formData: FormData
): Promise<SubmitResult> {
  const title = formData.get("title") as string | null;
  const opportunityType = formData.get("opportunity_type") as string | null;

  if (!title?.trim()) {
    return { success: false, error: "Opportunity title is required." };
  }
  if (!opportunityType) {
    return { success: false, error: "Opportunity type is required." };
  }

  const data: Record<string, unknown> = {
    title: title.trim(),
    opportunity_type: opportunityType,
    source_name: (formData.get("source_name") as string)?.trim() || null,
    amount_description:
      (formData.get("amount_description") as string)?.trim() || null,
    deadline: (formData.get("deadline") as string) || null,
    description: (formData.get("description") as string)?.trim() || null,
    eligibility: (formData.get("eligibility") as string)?.trim() || null,
    application_url:
      (formData.get("application_url") as string)?.trim() || null,
  };

  const submitterName =
    (formData.get("submitter_name") as string)?.trim() || null;
  const submitterEmail =
    (formData.get("submitter_email") as string)?.trim() || null;

  const supabase = createClient();

  const row: Partial<Submission> = {
    ecosystem_id: NWA_ECOSYSTEM_ID,
    submission_type: "opportunity",
    data,
    submitter_name: submitterName,
    submitter_email: submitterEmail,
    status: "pending",
  };

  const { error } = await supabase
    .from("submissions")
    .insert(row as never);

  if (error) {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true };
}
