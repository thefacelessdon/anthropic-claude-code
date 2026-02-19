import { DecisionFlagForm } from "@/components/public/DecisionFlagForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flag a Decision — NWA Creative Economy",
  description:
    "Know of an upcoming decision that could affect NWA's creative economy? Flag it so we can track it.",
};

export default function SubmitFlagPage() {
  return <DecisionFlagForm />;
}
