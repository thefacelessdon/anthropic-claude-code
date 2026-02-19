import { OpportunitySubmitForm } from "@/components/public/OpportunitySubmitForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit an Opportunity — NWA Creative Economy",
  description:
    "Know of a grant, RFP, commission, residency, or fellowship for NWA creative practitioners? Submit it here.",
};

export default function SubmitOpportunityPage() {
  return <OpportunitySubmitForm />;
}
