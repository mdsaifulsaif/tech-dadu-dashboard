"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || "Authentication failed. Check your admin credentials.");
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to log in to Admin Dashboard");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg px-4 py-12">
      <div className="card-surface w-full max-w-md p-8 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-theme-primary-light blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <Image
            src="/images/logo.png"
            alt="Tech Dadu Admin Logo"
            width={200}
            height={48}
            priority
            className="h-12 w-auto mx-auto mb-3 object-contain dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.85)]"
          />
          <h1 className="text-2xl font-extrabold tracking-tight text-theme-fg">
            Tech<span className="text-theme-primary">Dadu</span> Admin
          </h1>
          <p className="text-xs text-theme-muted mt-1 uppercase tracking-wider font-semibold">
            Restricted Control Panel Access
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-theme-danger text-theme-danger border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-fg mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-theme-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@techdadu.com"
                className="input-theme input-icon-left text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-fg mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-theme-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-theme input-icon-left input-icon-right text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-fg p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2 text-sm font-semibold"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Enter Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-theme-border text-center">
          <p className="text-[11px] text-theme-muted">
            Authorized Personnel Only &bull; Access logs are monitored
          </p>
        </div>
      </div>
    </div>
  );
}

