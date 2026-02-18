import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/practice/Sidebar";

export default async function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="ml-56">
        {/* Header bar */}
        <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-xs text-dim">{user.email}</span>
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs text-muted hover:text-text transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>
        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
