import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrecedentsView } from "@/components/practice/views/PrecedentsView";
import type { Precedent } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Precedents — Cultural Architecture Toolkit",
};

export default async function PrecedentsPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("precedents")
    .select("*")
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
    .order("created_at", { ascending: false });

  const precedents = (data as Precedent[]) || [];

  return (
    <div className="space-y-section">
      <PageHeader
        title="Precedents"
        subtitle="What's been tried before. The institutional memory that prevents starting from scratch."
      />

      {precedents.length === 0 ? (
        <EmptyState
          title="No precedents yet"
          description="Start documenting what's been tried."
        />
      ) : (
        <PrecedentsView precedents={precedents} />
      )}
    </div>
  );
}
