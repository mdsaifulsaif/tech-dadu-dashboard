import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Tech Dadu — Admin Control Center",
  description: "Administrative dashboard for Tech Dadu desk gear, digital boilerplates, blogs and analytics.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isAdmin = session?.user && (session.user as any).role === "admin";

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex bg-theme-bg text-theme-fg selection:bg-theme-primary selection:text-theme-primary-fg font-sans">
        <SessionProvider>
          {isAdmin ? (
            <div className="flex w-full min-h-screen">
              <AdminSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-screen">{children}</div>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
