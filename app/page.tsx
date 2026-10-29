import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Laptop,
  Layers,
  BookOpen,
  Mail,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Sparkles,
  MousePointerClick,
  Eye,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { auth } from "@/auth";

export default async function AdminDashboardPage() {
  const session = await auth();

  // Strict check: if not logged in or not admin, redirect to login
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="card-surface p-6 sm:p-8 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-primary-light text-theme-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Administrator Control Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-fg tracking-tight">
            Welcome back, {session.user.name || "Saif"}! 👋
          </h1>
          <p className="text-sm text-theme-muted mt-1 max-w-xl">
            Manage your curated desk gear, Next.js templates, SEO blog listicles, and monitor
            Pinterest outbound click conversions.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/products"
            className="btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Gear</span>
          </Link>
          <Link
            href="/templates"
            className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Template</span>
          </Link>
          <Link
            href="/blogs"
            className="btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Article</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Products */}
        <div className="card-surface p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              Desk Gear
            </span>
            <div className="w-9 h-9 rounded-lg bg-theme-primary-light text-theme-primary flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-theme-fg">Catalog</div>
            <p className="text-xs text-theme-muted mt-1">Amazon & Brand Gear</p>
          </div>
          <div className="mt-4 pt-3 border-t border-theme-border flex items-center justify-between text-xs">
            <Link href="/products" className="text-theme-primary font-semibold hover:underline flex items-center gap-1">
              <span>Manage Gear</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Stat 2: Digital Templates */}
        <div className="card-surface p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              Web Templates
            </span>
            <div className="w-9 h-9 rounded-lg bg-theme-secondary-light text-theme-secondary flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-theme-fg">Templates</div>
            <p className="text-xs text-theme-muted mt-1">Next.js & MERN Starters</p>
          </div>
          <div className="mt-4 pt-3 border-t border-theme-border flex items-center justify-between text-xs">
            <Link href="/templates" className="text-theme-secondary font-semibold hover:underline flex items-center gap-1">
              <span>View Boilerplates</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Stat 3: Tech Blogs */}
        <div className="card-surface p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              SEO Guides
            </span>
            <div className="w-9 h-9 rounded-lg bg-theme-primary-light text-theme-accent flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-theme-fg">Articles</div>
            <p className="text-xs text-theme-muted mt-1">Listicles & Tech Reviews</p>
          </div>
          <div className="mt-4 pt-3 border-t border-theme-border flex items-center justify-between text-xs">
            <Link href="/blogs" className="text-theme-primary font-semibold hover:underline flex items-center gap-1">
              <span>Manage Blogs</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Stat 4: Subscribers */}
        <div className="card-surface p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              Newsletter Leads
            </span>
            <div className="w-9 h-9 rounded-lg bg-theme-success/15 text-theme-success flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-theme-fg">Audience</div>
            <p className="text-xs text-theme-muted mt-1">Pinterest & Web Leads</p>
          </div>
          <div className="mt-4 pt-3 border-t border-theme-border flex items-center justify-between text-xs">
            <Link href="/subscribers" className="text-theme-success font-semibold hover:underline flex items-center gap-1">
              <span>View Subscribers</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Grid: Outbound Performance & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outbound Click Engine Summary (2 cols) */}
        <div className="lg:col-span-2 card-surface p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-theme-fg">Pinterest & Outbound Analytics</h2>
              <p className="text-xs text-theme-muted mt-0.5">
                Every outbound affiliate click is tracked to optimize conversions
              </p>
            </div>
            <Link href="/analytics" className="btn-outline text-xs py-1.5 px-3">
              Full Report
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-theme-bg border border-theme-border">
              <div className="flex items-center gap-2 text-xs text-theme-muted mb-1">
                <MousePointerClick className="w-4 h-4 text-theme-primary" />
                <span>Affiliate Clicks</span>
              </div>
              <div className="text-xl font-extrabold text-theme-fg">Tracking Live</div>
              <span className="text-[11px] text-theme-success font-medium">Amazon & AliExpress</span>
            </div>

            <div className="p-4 rounded-xl bg-theme-bg border border-theme-border">
              <div className="flex items-center gap-2 text-xs text-theme-muted mb-1">
                <TrendingUp className="w-4 h-4 text-theme-secondary" />
                <span>Pinterest Traffic</span>
              </div>
              <div className="text-xl font-extrabold text-theme-fg">400k+ Mo</div>
              <span className="text-[11px] text-theme-muted">Organic Pin Impressions</span>
            </div>

            <div className="p-4 rounded-xl bg-theme-bg border border-theme-border">
              <div className="flex items-center gap-2 text-xs text-theme-muted mb-1">
                <Eye className="w-4 h-4 text-theme-accent" />
                <span>SEO Traffic</span>
              </div>
              <div className="text-xl font-extrabold text-theme-fg">Top 10 Guides</div>
              <span className="text-[11px] text-theme-muted">Google Search Console</span>
            </div>
          </div>
        </div>

        {/* System & API Configuration (1 col) */}
        <div className="card-surface p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-theme-fg mb-1">System Health</h2>
            <p className="text-xs text-theme-muted mb-5">Live backend and service connections</p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-theme-bg border border-theme-border">
                <span className="text-theme-fg font-medium">Backend API (5001)</span>
                <span className="inline-flex items-center gap-1 font-semibold text-theme-success">
                  <span className="w-2 h-2 rounded-full bg-theme-success animate-pulse" />
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-theme-bg border border-theme-border">
                <span className="text-theme-fg font-medium">MongoDB Database</span>
                <span className="inline-flex items-center gap-1 font-semibold text-theme-success">
                  <span className="w-2 h-2 rounded-full bg-theme-success" />
                  Cluster0 Atlas
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-theme-bg border border-theme-border">
                <span className="text-theme-fg font-medium">Cloudinary Storage</span>
                <span className="inline-flex items-center gap-1 font-semibold text-theme-primary">
                  dvpfgfwj4
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-theme-border">
            <Link
              href="/settings"
              className="btn-outline w-full text-xs py-2 flex items-center justify-center gap-2"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure Site & Meta Pixels</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
