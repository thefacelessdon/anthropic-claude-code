import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmissionsView } from "@/components/practice/views/SubmissionsView";
import type { Submission } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Submissions — Cultural Architecture Toolkit",
};

export default async function SubmissionsPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("submissions")
    .select("*")
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
    .order("created_at", { ascending: false });

  const submissions = (data as Submission[]) || [];

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
        <SubmissionsView submissions={submissions} />
      )}
    </div>
  );
}
