"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Send,
  Search,
  Check,
  AlertCircle,
  Loader2,
  Users,
  Calendar,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import { subscriberApi } from "@/lib/api";
import { ISubscriber } from "@/types";

export default function SubscribersAdminPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string | undefined;

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Broadcast Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");

  // 1. Fetch Subscribers
  const {
    data: subData,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["admin-subscribers", page],
    queryFn: async () => {
      const res = await subscriberApi.getAll(page, 25, token);
      return res.data;
    },
    enabled: !!token,
  });

  const subscribers = subData?.subscribers || [];
  const pagination = subData?.pagination;

  // 2. Broadcast Email Mutation
  const broadcastMutation = useMutation({
    mutationFn: ({ subject, content }: { subject: string; content: string }) =>
      subscriberApi.broadcast(subject, content, token),
    onSuccess: (res) => {
      setIsBroadcastOpen(false);
      setBroadcastSubject("");
      setBroadcastContent("");
      setSuccessMsg(res.message || "Newsletter broadcast delivered to subscribers!");
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setFormError(err?.message || "Failed to broadcast newsletter");
    },
  });

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastContent.trim()) {
      setFormError("Both subject and message content are required.");
      return;
    }

    setFormError(null);
    broadcastMutation.mutate({ subject: broadcastSubject, content: broadcastContent });
  };

  const filteredSubscribers = subscribers.filter((s: ISubscriber) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-theme-success/15 text-theme-success flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-theme-fg">
              Newsletter Leads & Subscribers
            </h1>
            {isFetching && !isLoading && (
              <span title="Syncing...">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-theme-muted" />
              </span>
            )}
          </div>
          <p className="text-xs text-theme-muted mt-1">
            Audience captured from Pinterest referral visitors, lead magnets, and blog footer opt-ins.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsBroadcastOpen(true);
          }}
          className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span>Broadcast Newsletter</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-theme-success/15 border border-emerald-500/20 text-theme-success text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Summary Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-surface p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              Total Subscribers
            </span>
            <Users className="w-4 h-4 text-theme-primary" />
          </div>
          <div className="text-2xl font-extrabold text-theme-fg">
            {pagination?.total || subscribers.length}
          </div>
          <span className="text-[11px] text-theme-success font-medium">Active Email List</span>
        </div>

        <div className="card-surface p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              Top Lead Source
            </span>
            <Sparkles className="w-4 h-4 text-theme-secondary" />
          </div>
          <div className="text-xl font-extrabold text-theme-fg">Pinterest & Freebies</div>
          <span className="text-[11px] text-theme-muted">Lead Magnet downloads</span>
        </div>

        <div className="card-surface p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              Email Deliverability
            </span>
            <Check className="w-4 h-4 text-theme-success" />
          </div>
          <div className="text-xl font-extrabold text-theme-fg">SMTP Configured</div>
          <span className="text-[11px] text-theme-muted">Gmail App Password</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card-surface p-4 rounded-xl flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-theme-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email address..."
            className="input-theme input-icon-left text-xs py-2"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-fg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Subscribers Table */}
      {isLoading ? (
        <div className="card-surface p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-theme-primary mx-auto mb-3" />
          <p className="text-xs text-theme-muted">Loading subscriber list...</p>
        </div>
      ) : filteredSubscribers.length > 0 ? (
        <div className="card-surface rounded-2xl overflow-hidden border border-theme-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-theme-bg/60 border-b border-theme-border text-theme-muted uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Lead Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {filteredSubscribers.map((sub: ISubscriber) => (
                  <tr key={sub._id} className="hover:bg-theme-surface-hover/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-theme-fg">
                      {sub.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-theme-bg border border-theme-border text-theme-muted">
                        {sub.source || "Website Opt-in"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          sub.status === "subscribed"
                            ? "bg-theme-success/15 text-theme-success border-emerald-500/20"
                            : "bg-theme-danger text-theme-danger border-red-500/20"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-theme-muted">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "Recent"}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="p-4 border-t border-theme-border flex items-center justify-between text-xs text-theme-muted">
              <span>
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} leads)
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn-outline text-xs py-1 px-3 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-outline text-xs py-1 px-3 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card-surface p-12 text-center rounded-2xl max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-theme-success/15 text-theme-success flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-theme-fg mb-1">No Subscribers Yet</h3>
          <p className="text-xs text-theme-muted mb-2">
            When Pinterest visitors sign up for free templates or desk setup newsletters, they will appear here.
          </p>
        </div>
      )}

      {/* Modal: Broadcast Newsletter */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card-surface w-full max-w-lg rounded-2xl p-6 sm:p-7 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-theme-border">
              <h2 className="text-base font-bold text-theme-fg flex items-center gap-2">
                <Send className="w-4 h-4 text-theme-primary" />
                <span>Broadcast Email to All Subscribers</span>
              </h2>
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="text-theme-muted hover:text-theme-fg p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-theme-danger text-theme-danger border border-red-200 dark:border-red-900/50 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Email Subject *
                </label>
                <input
                  type="text"
                  required
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="e.g. ⚡ Top 5 Desk Setup Deals This Week + Free Next.js Template"
                  className="input-theme text-xs py-2"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Email Message / HTML Body *
                </label>
                <textarea
                  rows={8}
                  required
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  placeholder="Hi there! Here are the latest gear reviews and freebies..."
                  className="input-theme text-xs py-2 resize-y font-mono leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-theme-bg border border-theme-border text-[11px] text-theme-muted">
                ⚠️ Sending will dispatch emails to all {pagination?.total || subscribers.length} verified subscribers via SMTP.
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-theme-border">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="btn-outline text-xs py-2 px-3.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcastMutation.isPending}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  {broadcastMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{broadcastMutation.isPending ? "Sending Broadcast..." : "Send to All"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
