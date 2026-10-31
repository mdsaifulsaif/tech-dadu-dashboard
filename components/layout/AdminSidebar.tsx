"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Laptop,
  Layers,
  BookOpen,
  FolderTree,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Shield,
  ExternalLink,
  Palette,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Products / Gear", href: "/products", icon: Laptop },
  { label: "Categories", href: "/categories", icon: FolderTree },
  { label: "Templates & Kits", href: "/templates", icon: Layers },
  { label: "UI/UX Designs", href: "/templates?category=ui-ux-design", icon: Palette },
  { label: "Guides & Blogs", href: "/blogs", icon: BookOpen },
  { label: "Newsletter Leads", href: "/subscribers", icon: Mail },
  { label: "Outbound Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Site & SEO Settings", href: "/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const liveStoreUrl = process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3001";

  return (
    <aside className="w-64 shrink-0 bg-theme-surface border-r border-theme-border flex flex-col justify-between h-screen sticky top-0 transition-colors">
      <div>
        {/* Dashboard Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-theme-border">
          <Link href="/" className="flex items-center gap-2 group min-w-0">
            <Image
              src="/images/logo.png"
              alt="Tech Dadu Logo"
              width={140}
              height={32}
              priority
              className="h-7 w-auto object-contain transition-transform group-hover:scale-102 dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.85)] shrink-0"
            />
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-theme-primary-light text-theme-primary shrink-0">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-theme-primary text-theme-primary-fg shadow-sm"
                    : "text-theme-muted hover:text-theme-fg hover:bg-theme-surface-hover"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: View Store & Current Admin User */}
      <div className="p-4 border-t border-theme-border space-y-3">
        {/* Quick link to live public store */}
        <a
          href={liveStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline w-full text-xs py-2 px-3 flex items-center justify-center gap-2"
        >
          <span>View Live Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* User Badge & Logout */}
        {session?.user && (
          <div className="p-2.5 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-theme-primary text-theme-primary-fg flex items-center justify-center text-xs font-bold shrink-0">
                {(session.user.name || "A")[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-theme-fg truncate leading-tight">
                  {session.user.name || "Administrator"}
                </p>
                <p className="text-[10px] text-theme-muted truncate leading-none mt-0.5">
                  {session.user.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-danger hover:bg-theme-surface-hover transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

