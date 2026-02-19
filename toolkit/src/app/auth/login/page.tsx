"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "magic-link" | "password";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("password");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    if (mode === "password") {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
        } else {
          router.push(redirectTo);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          router.push(redirectTo);
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-surface text-text flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-text">
            Cultural Architecture Toolkit
          </h1>
          <p className="mt-2 text-muted text-sm">
            Sign in to access the practice surface
          </p>
        </div>

        {sent ? (
          <div className="bg-surface-card border border-border rounded-lg p-6">
            <div className="text-status-green text-sm font-medium mb-1">
              Check your email
            </div>
            <p className="text-muted text-sm">
              We sent a magic link to{" "}
              <span className="text-text">{email}</span>. Click it to sign in.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-accent text-sm hover:text-accent-warm transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="bg-surface-card border border-border rounded-lg p-6">
              <label
                htmlFor="email"
                className="block text-sm text-muted mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-surface border border-border rounded px-3 py-2 text-text text-sm placeholder:text-dim focus:outline-none focus:border-accent transition-colors"
              />

              {mode === "password" && (
                <>
                  <label
                    htmlFor="password"
                    className="block text-sm text-muted mb-2 mt-4"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    className="w-full bg-surface border border-border rounded px-3 py-2 text-text text-sm placeholder:text-dim focus:outline-none focus:border-accent transition-colors"
                  />
                </>
              )}

              {error && (
                <p className="mt-2 text-status-red text-sm">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-accent text-surface font-medium text-sm rounded px-4 py-2 hover:bg-accent-warm transition-colors disabled:opacity-50"
              >
                {loading
                  ? mode === "password"
                    ? isSignUp ? "Creating account..." : "Signing in..."
                    : "Sending..."
                  : mode === "password"
                    ? isSignUp ? "Create account" : "Sign in"
                    : "Send magic link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode(mode === "password" ? "magic-link" : "password");
                  setError(null);
                }}
                className="mt-3 w-full text-muted text-sm hover:text-text transition-colors"
              >
                {mode === "password"
                  ? "Use magic link instead"
                  : "Use password instead"}
              </button>

              {mode === "password" && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="mt-2 w-full text-muted text-sm hover:text-text transition-colors"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Need an account? Sign up"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
