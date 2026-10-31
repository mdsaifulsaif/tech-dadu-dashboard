"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Save,
  Check,
  AlertCircle,
  Loader2,
  Globe,
  Share2,
  BarChart3,
  ShieldCheck,
  Bell,
  Sparkles,
} from "lucide-react";
import { siteSettingApi } from "@/lib/api";
import { ISiteSettings } from "@/types";

export default function SettingsAdminPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string | undefined;

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "analytics" | "social" | "announcement">("general");

  // Form State
  const [formData, setFormData] = useState<ISiteSettings>({
    siteName: "Tech Dadu",
    siteTagline: "Curated Desk Setup Gear & Modern Web Dev Templates",
    siteDescription: "Discover top-rated desk accessories, mechanical keyboards, Next.js templates, and modern tech inspirations.",
    siteUrl: "http://localhost:3001",
    logoUrl: "",
    faviconUrl: "",
    defaultOgImage: "",
    socialLinks: {
      pinterest: "https://pinterest.com/techdadu",
      github: "https://github.com",
      twitter: "https://twitter.com",
      youtube: "https://youtube.com",
      facebook: "",
      linkedin: "",
    },
    analytics: {
      gtmId: "",
      gaId: "",
      metaPixelId: "",
      pinterestTagId: "",
      pinterestVerification: "",
      googleVerification: "",
    },
    announcement: {
      enabled: true,
      text: "⚡ Special Deal: 50% off on all Next.js 15 Developer Boilerplates this week!",
      link: "/templates",
    },
  });

  // 1. Fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await siteSettingApi.get();
      return res.data;
    },
  });

  useEffect(() => {
    if (currentSettings) {
      setFormData((prev) => ({
        ...prev,
        ...currentSettings,
        socialLinks: { ...prev.socialLinks, ...currentSettings.socialLinks },
        analytics: { ...prev.analytics, ...currentSettings.analytics },
        announcement: { ...prev.announcement, ...currentSettings.announcement },
      }));
    }
  }, [currentSettings]);

  // 2. Update Mutation
  const updateMutation = useMutation({
    mutationFn: (newData: Partial<ISiteSettings>) => siteSettingApi.update(newData, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      setSuccessMsg("Settings saved and deployed successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.message || "Failed to update site settings");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    updateMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-theme-primary-light text-theme-primary flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-theme-fg">
              Site & Tracking Configuration
            </h1>
          </div>
          <p className="text-xs text-theme-muted mt-1">
            Dynamic Google Tag Manager, Pinterest Domain Verification, GA4, and SEO Meta settings.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{updateMutation.isPending ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-theme-success/15 border border-emerald-500/20 text-theme-success text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Error Alert */}
      {formError && (
        <div className="p-3.5 rounded-xl bg-theme-danger text-theme-danger border border-red-200 dark:border-red-900/50 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-theme-border pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: "general", label: "General & Branding", icon: Globe },
          { id: "analytics", label: "Analytics & Tracking (GTM, Pinterest)", icon: BarChart3 },
          { id: "social", label: "Social Media Links", icon: Share2 },
          { id: "announcement", label: "Announcement Banner", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? "bg-theme-primary text-theme-primary-fg shadow-sm"
                  : "text-theme-muted hover:text-theme-fg hover:bg-theme-surface-hover"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="card-surface p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-theme-primary mx-auto mb-3" />
          <p className="text-xs text-theme-muted">Fetching site configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB 1: General & Branding */}
          {activeTab === "general" && (
            <div className="card-surface p-6 rounded-2xl space-y-4 text-xs">
              <h2 className="text-sm font-bold text-theme-fg border-b border-theme-border pb-3">
                General Website Identity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="input-theme text-xs py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Site URL
                  </label>
                  <input
                    type="url"
                    value={formData.siteUrl}
                    onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.siteTagline}
                  onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
                  className="input-theme text-xs py-2"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Default SEO Description
                </label>
                <textarea
                  rows={3}
                  value={formData.siteDescription}
                  onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                  className="input-theme text-xs py-2 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://.../logo.png"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Default OG / Pinterest Card Image
                  </label>
                  <input
                    type="url"
                    value={formData.defaultOgImage || ""}
                    onChange={(e) => setFormData({ ...formData, defaultOgImage: e.target.value })}
                    placeholder="https://.../og-preview.jpg"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Analytics & Verification */}
          {activeTab === "analytics" && (
            <div className="card-surface p-6 rounded-2xl space-y-4 text-xs">
              <h2 className="text-sm font-bold text-theme-fg border-b border-theme-border pb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-theme-primary" />
                <span>Tracking IDs & Domain Verifications</span>
              </h2>

              <p className="text-theme-muted text-[11px] leading-relaxed">
                Connect your Google Tag Manager, GA4, and Pinterest Tag without writing code or editing files.
                The frontend reads these dynamically from the backend API.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Google Tag Manager (GTM ID)
                  </label>
                  <input
                    type="text"
                    value={formData.analytics?.gtmId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analytics: { ...formData.analytics, gtmId: e.target.value },
                      })
                    }
                    placeholder="e.g. GTM-XXXXXXX"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Google Analytics 4 (GA4 ID)
                  </label>
                  <input
                    type="text"
                    value={formData.analytics?.gaId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analytics: { ...formData.analytics, gaId: e.target.value },
                      })
                    }
                    placeholder="e.g. G-XXXXXXXXXX"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Pinterest Tag ID
                  </label>
                  <input
                    type="text"
                    value={formData.analytics?.pinterestTagId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analytics: { ...formData.analytics, pinterestTagId: e.target.value },
                      })
                    }
                    placeholder="e.g. 2612345678901"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Pinterest Domain Claim Verification Tag
                  </label>
                  <input
                    type="text"
                    value={formData.analytics?.pinterestVerification || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analytics: { ...formData.analytics, pinterestVerification: e.target.value },
                      })
                    }
                    placeholder="e.g. 5a1b2c3d4e5f..."
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Google Search Console Verification Tag
                  </label>
                  <input
                    type="text"
                    value={formData.analytics?.googleVerification || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analytics: { ...formData.analytics, googleVerification: e.target.value },
                      })
                    }
                    placeholder="e.g. googlexxxxxxxxxxxxxxxxx"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Meta / Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={formData.analytics?.metaPixelId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analytics: { ...formData.analytics, metaPixelId: e.target.value },
                      })
                    }
                    placeholder="e.g. 123456789012345"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Social Links */}
          {activeTab === "social" && (
            <div className="card-surface p-6 rounded-2xl space-y-4 text-xs">
              <h2 className="text-sm font-bold text-theme-fg border-b border-theme-border pb-3">
                Social Media Profiles & Channels
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Pinterest Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks?.pinterest || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, pinterest: e.target.value },
                      })
                    }
                    placeholder="https://pinterest.com/techdadu"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks?.github || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, github: e.target.value },
                      })
                    }
                    placeholder="https://github.com/techdadu"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    Twitter / X Profile
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks?.twitter || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                      })
                    }
                    placeholder="https://x.com/techdadu"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                    YouTube Channel
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks?.youtube || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, youtube: e.target.value },
                      })
                    }
                    placeholder="https://youtube.com/@techdadu"
                    className="input-theme text-xs py-2 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Announcement Bar */}
          {activeTab === "announcement" && (
            <div className="card-surface p-6 rounded-2xl space-y-4 text-xs">
              <h2 className="text-sm font-bold text-theme-fg border-b border-theme-border pb-3">
                Top Announcement Bar
              </h2>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="announcementEnabled"
                  checked={formData.announcement?.enabled || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcement: { ...formData.announcement, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-theme-primary cursor-pointer"
                />
                <label htmlFor="announcementEnabled" className="font-semibold text-theme-fg cursor-pointer">
                  Display Announcement Bar on Store Header
                </label>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Announcement Text
                </label>
                <input
                  type="text"
                  value={formData.announcement?.text || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcement: { ...formData.announcement, text: e.target.value },
                    })
                  }
                  placeholder="e.g. ⚡ Special Deal: 50% off on all Next.js 15 Templates!"
                  className="input-theme text-xs py-2"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-theme-fg mb-1">
                  Announcement Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.announcement?.link || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcement: { ...formData.announcement, link: e.target.value },
                    })
                  }
                  placeholder="/templates"
                  className="input-theme text-xs py-2 font-mono"
                />
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme-border">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{updateMutation.isPending ? "Saving Changes..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

