// Diagnostic script: check all foreign key relationships in the database
// Uses service_role key to bypass RLS for reading
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://agofqkgzxtfehxfeqyqj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnb2Zxa2d6eHRmZWh4ZmVxeXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTA2NDgsImV4cCI6MjA4Njk2NjY0OH0.Wlk-BQr23lN-bZNyAGOKvn_d8XVTHD2OChHd3I9F-oo";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  // Test public-read tables first (opportunities and outputs have public policies)
  console.log("=== TESTING PUBLIC-READ TABLES ===");
  const { data: opps, error: oppErr } = await supabase.from("opportunities").select("id, title").limit(3);
  console.log("Opportunities:", opps?.length ?? 0, "rows", oppErr ? `ERROR: ${oppErr.message}` : "");
  opps?.forEach((o) => console.log(`  ${o.title}`));

  const { data: outs, error: outErr } = await supabase.from("outputs").select("id, title, is_published").limit(3);
  console.log("Outputs:", outs?.length ?? 0, "rows", outErr ? `ERROR: ${outErr.message}` : "");
  outs?.forEach((o) => console.log(`  ${o.title} (published=${o.is_published})`));

  // Test RLS-protected table with anon key (should return 0 if not authenticated)
  const { data: orgsAnon, error: orgErr } = await supabase.from("organizations").select("id, name").limit(3);
  console.log("Organizations (anon):", orgsAnon?.length ?? 0, "rows", orgErr ? `ERROR: ${orgErr.message}` : "");

  const { data: invAnon, error: invErr } = await supabase.from("investments").select("id, initiative_name").limit(3);
  console.log("Investments (anon):", invAnon?.length ?? 0, "rows", invErr ? `ERROR: ${invErr.message}` : "");

  // Try to see if the tables even have data by checking if we get a count error
  const { count: orgCount, error: countErr } = await supabase.from("organizations").select("*", { count: "exact", head: true });
  console.log("\nOrganizations count:", orgCount, countErr ? `ERROR: ${countErr.message}` : "");

  const { count: invCount } = await supabase.from("investments").select("*", { count: "exact", head: true });
  console.log("Investments count:", invCount);

  const { count: decCount } = await supabase.from("decisions").select("*", { count: "exact", head: true });
  console.log("Decisions count:", decCount);

  const { count: narCount } = await supabase.from("narratives").select("*", { count: "exact", head: true });
  console.log("Narratives count:", narCount);

  const { count: practCount } = await supabase.from("practitioners").select("*", { count: "exact", head: true });
  console.log("Practitioners count:", practCount);

  const { count: oppCount } = await supabase.from("opportunities").select("*", { count: "exact", head: true });
  console.log("Opportunities count:", oppCount);

  const { count: outCount } = await supabase.from("outputs").select("*", { count: "exact", head: true });
  console.log("Outputs count:", outCount);

  const { count: precCount } = await supabase.from("precedents").select("*", { count: "exact", head: true });
  console.log("Precedents count:", precCount);

  console.log("\n=== DONE ===");
}

main().catch(console.error);
