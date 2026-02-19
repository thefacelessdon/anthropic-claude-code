import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmissionsView } from "@/components/practice/views/SubmissionsView";
import type { Submission, Organization, Practitioner, Opportunity } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Submissions — Cultural Architecture Toolkit",
};

export default async function SubmissionsPage() {
  const supabase = createClient();

  const [
    { data: submissionData },
    { data: orgData },
    { data: practitionerData },
    { data: opportunityData },
  ] = await Promise.all([
    supabase
      .from("submissions")
      .select("*")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .order("created_at", { ascending: false }),
    supabase
      .from("organizations")
      .select("id, name")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase
      .from("practitioners")
      .select("id, name, discipline")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase
      .from("opportunities")
      .select("id, title, source_name")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
  ]);

  const submissions = (submissionData as Submission[]) || [];
  const orgs = (orgData as Pick<Organization, "id" | "name">[]) || [];
  const practitioners = (practitionerData as Pick<Practitioner, "id" | "name" | "discipline">[]) || [];
  const opportunities = (opportunityData as Pick<Opportunity, "id" | "title" | "source_name">[]) || [];

  // Build lookup data for ecosystem matching
  const orgNames = orgs.map((o) => o.name.toLowerCase());
  const practitionerList = practitioners.map((p) => ({ id: p.id, name: p.name, discipline: p.discipline }));

  // Counts for editorial stats
  const pending = submissions.filter((s) => s.status === "pending" && s.submission_type !== "interest_signal");
  const interestSignals = submissions.filter((s) => s.submission_type === "interest_signal");
  const reviewedActual = submissions.filter((s) => s.status === "approved" || s.status === "rejected");

  let statsSentence = "";
  if (submissions.length > 0) {
    const parts: string[] = [];
    if (pending.length > 0) {
      const types = new Map<string, number>();
      pending.forEach((s) => { types.set(s.submission_type, (types.get(s.submission_type) || 0) + 1); });
      const typeLabels: Record<string, string> = {
        opportunity: "opportunity submission",
        decision_flag: "decision flag",
        investment_verification: "investment verification",
        practitioner_tip: "practitioner tip",
      };
      const typeDesc = Array.from(types.entries())
        .map(([type, count]) => `${count} ${typeLabels[type] || type}${count !== 1 ? "s" : ""}`)
        .join(", ");
      parts.push(`${pending.length} pending review: ${typeDesc}.`);
    } else {
      parts.push("No submissions pending review.");
    }
    if (interestSignals.length > 0) {
      parts.push(`${interestSignals.length} interest signal${interestSignals.length !== 1 ? "s" : ""} from the public surface.`);
    }
    if (reviewedActual.length > 0) {
      const approved = reviewedActual.filter((s) => s.status === "approved").length;
      const rejected = reviewedActual.filter((s) => s.status === "rejected").length;
      parts.push(`${reviewedActual.length} previously reviewed (${approved} approved, ${rejected} rejected).`);
    }
    statsSentence = parts.join(" ");
  }

  return (
    <div className="space-y-section">
      <PageHeader
        title="Submissions"
        subtitle="External contributions waiting for review."
      />

      {submissions.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="External submissions will appear here for review."
        />
      ) : (
        <>
          {statsSentence && (
            <p className="text-[14px] text-text leading-relaxed border-y border-border py-4 -mt-2">
              {statsSentence}
            </p>
          )}

          <SubmissionsView
            submissions={submissions}
            orgNames={orgNames}
            practitionerList={practitionerList}
            existingOpportunities={opportunities}
            allOrgs={orgs}
          />
        </>
      )}
    </div>
  );
}
