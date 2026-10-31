import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('tech-dadu-admin-theme');
                  var theme = saved || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex bg-theme-bg text-theme-fg selection:bg-theme-primary selection:text-theme-primary-fg font-sans">
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider>
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
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
