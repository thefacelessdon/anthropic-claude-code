import { createClient } from "@/lib/supabase/server";
import { OrgVerificationForm } from "@/components/contributor/OrgVerificationForm";
import { PractitionerCheckInForm } from "@/components/contributor/PractitionerCheckInForm";
import type { Organization, Practitioner } from "@/lib/supabase/types";

export const metadata = {
  title: "Ecosystem Verification — Cultural Architecture",
};

interface PageProps {
  searchParams: { type?: string; id?: string };
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const { type, id } = searchParams;

  if (!type || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-muted text-sm">Invalid verification link.</p>
      </div>
    );
  }

  const supabase = createClient();

  if (type === "organization") {
    const { data } = await supabase
      .from("organizations")
      .select("id, name, org_type, mandate, controls, decision_cycle")
      .eq("id", id)
      .single();

    if (!data) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <p className="text-muted text-sm">Organization not found.</p>
        </div>
      );
    }

    const org = data as Pick<Organization, "id" | "name" | "org_type" | "mandate" | "controls" | "decision_cycle">;

    return (
      <div className="min-h-screen bg-surface py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <OrgVerificationForm org={org} />
        </div>
      </div>
    );
  }

  if (type === "practitioner") {
    const { data } = await supabase
      .from("practitioners")
      .select("id, name, discipline, tenure, income_sources, retention_factors, risk_factors")
      .eq("id", id)
      .single();

    if (!data) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <p className="text-muted text-sm">Practitioner not found.</p>
        </div>
      );
    }

    const practitioner = data as Pick<Practitioner, "id" | "name" | "discipline" | "tenure" | "income_sources" | "retention_factors" | "risk_factors">;

    return (
      <div className="min-h-screen bg-surface py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <PractitionerCheckInForm practitioner={practitioner} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <p className="text-muted text-sm">Unknown verification type.</p>
    </div>
  );
}
