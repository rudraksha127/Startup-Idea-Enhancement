"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("founder@agencyos.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] dark:bg-[#0b0f0e] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-[#101413] dark:text-white">
          <span className="w-9 h-9 rounded-full bg-[#111614] dark:bg-white text-white dark:text-[#111614] flex items-center justify-center font-bold text-sm shadow-inner">
            A
          </span>
          <span>AgencyOS</span>
        </Link>
        <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#101413] dark:text-white">
          Sign in to your agency
        </h2>
        <p className="mt-2 text-xs text-[#555956] dark:text-[#9aa29e]">
          Or{" "}
          <Link href="/register" className="font-semibold text-[#0da66c] dark:text-emerald-400 hover:underline">
            create a new workspace
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#151d1a] py-8 px-6 shadow-card border border-[#161f1b]/10 dark:border-[#22302b] sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#101413] dark:text-gray-200 mb-1">
                Email address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-[#2b3833] bg-white dark:bg-[#111715] text-[#101413] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d251f] dark:focus:ring-emerald-500 focus:border-transparent"
                  placeholder="founder@agencyos.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101413] dark:text-gray-200 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-[#2b3833] bg-white dark:bg-[#111715] text-[#101413] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d251f] dark:focus:ring-emerald-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-[#101513] hover:bg-[#1a2c27] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign in to Dashboard"}
                {!loading && <ArrowRight size={14} />}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#22302b]">
            <div className="p-3 bg-[#f8f6f0] dark:bg-[#111715] border border-gray-200 dark:border-[#232f2a] rounded-lg text-[11px] text-[#555956] dark:text-[#9aa29e]">
              <b className="text-[#101413] dark:text-white block mb-1">Demo Founder Account Seeded:</b>
              Email: <code className="text-[#0d251f] dark:text-emerald-400 font-mono font-semibold">founder@agencyos.com</code><br />
              Password: <code className="text-[#0d251f] dark:text-emerald-400 font-mono font-semibold">password123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

