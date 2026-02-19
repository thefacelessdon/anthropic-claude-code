import { PractitionerTipForm } from "@/components/public/PractitionerTipForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suggest a Practitioner — NWA Creative Economy",
  description:
    "Know a creative practitioner working in NWA who should be on our radar? Tell us about them.",
};

export default function SubmitPractitionerPage() {
  return <PractitionerTipForm />;
}
