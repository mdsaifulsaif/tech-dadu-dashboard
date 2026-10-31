"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  MousePointerClick,
  TrendingUp,
  Share2,
  ExternalLink,
  Laptop,
  Layers,
  BookOpen,
  Mail,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { analyticsApi } from "@/lib/api";
import { IProduct } from "@/types";

export default function AnalyticsAdminPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string | undefined;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await analyticsApi.getOverview(token);
      return res.data;
    },
    enabled: !!token,
  });

  const counts = data?.counts;
  const topProducts = data?.topProducts || [];
  const platforms = data?.platformBreakdown || [];
  const referrers = data?.referrerBreakdown || [];

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-theme-primary-light text-theme-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-theme-fg">
              Outbound Affiliate & Pinterest Analytics
            </h1>
            {isFetching && !isLoading && (
              <span title="Syncing...">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-theme-muted" />
              </span>
            )}
          </div>
          <p className="text-xs text-theme-muted mt-1">
            Real-time tracking of outbound clicks, top converting tech gear, and referral traffic.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {isLoading ? (
        <div className="card-surface p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-theme-primary mx-auto mb-3" />
          <p className="text-xs text-theme-muted">Aggregating live tracking statistics...</p>
        </div>
      ) : (
        <>
          {/* Top 4 Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-surface p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
                  Total Outbound Clicks
                </span>
                <MousePointerClick className="w-4 h-4 text-theme-primary" />
              </div>
              <div className="text-3xl font-extrabold text-theme-fg">{counts?.clicks || 0}</div>
              <span className="text-[11px] text-theme-success font-medium">Amazon & AliExpress</span>
            </div>

            <div className="card-surface p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
                  Total Gear in Catalog
                </span>
                <Laptop className="w-4 h-4 text-theme-secondary" />
              </div>
              <div className="text-3xl font-extrabold text-theme-fg">{counts?.products || 0}</div>
              <span className="text-[11px] text-theme-muted">Affiliate Products</span>
            </div>

            <div className="card-surface p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
                  Templates & Kits
                </span>
                <Layers className="w-4 h-4 text-theme-accent" />
              </div>
              <div className="text-3xl font-extrabold text-theme-fg">{counts?.templates || 0}</div>
              <span className="text-[11px] text-theme-muted">Next.js & Boilerplates</span>
            </div>

            <div className="card-surface p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
                  Newsletter Leads
                </span>
                <Mail className="w-4 h-4 text-theme-success" />
              </div>
              <div className="text-3xl font-extrabold text-theme-fg">{counts?.subscribers || 0}</div>
              <span className="text-[11px] text-theme-success font-medium">Active Subscribers</span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Clicked Products (2 Cols) */}
            <div className="lg:col-span-2 card-surface p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-theme-border">
                <h2 className="text-sm font-bold text-theme-fg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-theme-primary" />
                  <span>Top Converting Desk Gear</span>
                </h2>
                <span className="text-xs text-theme-muted font-mono">By Total Clicks</span>
              </div>

              {topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((p: IProduct, idx: number) => (
                    <div
                      key={p._id}
                      className="p-3 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-theme-surface border border-theme-border flex items-center justify-center font-bold text-theme-muted text-[11px]">
                          #{idx + 1}
                        </span>
                        <Image
                          src={p.images?.[0] || "/next.svg"}
                          alt={p.title}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg object-cover bg-theme-surface border border-theme-border shrink-0"
                        />
                        <div>
                          <p className="font-bold text-theme-fg line-clamp-1">{p.title}</p>
                          <span className="text-[11px] font-mono text-theme-muted">/{p.slug}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-theme-primary text-sm">
                          {p.clickCount || 0} clicks
                        </span>
                        <p className="text-[11px] text-theme-muted">
                          {p.price?.formatted || `$${p.price?.amount || 0}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-theme-muted">
                  No clicks recorded yet. Clicks will appear once visitors click &quot;Buy on Amazon&quot; links.
                </div>
              )}
            </div>

            {/* Platform & Referral Distribution (1 Col) */}
            <div className="card-surface p-6 rounded-2xl space-y-6">
              <div>
                <h2 className="text-sm font-bold text-theme-fg mb-3 pb-2 border-b border-theme-border flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-theme-secondary" />
                  <span>Platform Share</span>
                </h2>
                <div className="space-y-2 text-xs">
                  {platforms.length > 0 ? (
                    platforms.map((pl) => (
                      <div key={pl.platform} className="flex items-center justify-between">
                        <span className="capitalize font-semibold text-theme-fg">{pl.platform}</span>
                        <span className="font-bold text-theme-primary">{pl.count} clicks</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-theme-muted text-[11px]">Amazon (Default)</div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold text-theme-fg mb-3 pb-2 border-b border-theme-border flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-theme-accent" />
                  <span>Traffic Referrers</span>
                </h2>
                <div className="space-y-2 text-xs">
                  {referrers.length > 0 ? (
                    referrers.map((rf) => (
                      <div key={rf.referrer} className="flex items-center justify-between">
                        <span className="capitalize font-semibold text-theme-fg">{rf.referrer}</span>
                        <span className="font-bold text-theme-secondary">{rf.count} visits</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-theme-muted text-[11px]">Pinterest & Direct</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
