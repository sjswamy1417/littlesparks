"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, LayoutDashboard, ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/parent/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "PARENT") {
      router.replace("/dashboard");
    }
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-secondary" />
          <p className="text-sm text-text-muted font-body">
            Loading Parent Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "PARENT") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4 md:px-6 h-16">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-secondary" />
            <span className="font-display text-lg font-bold text-text">
              Parent Portal
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1 flex-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname?.startsWith(link.href + "/");
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-body font-medium transition-colors duration-150",
                    isActive
                      ? "bg-secondary/10 text-secondary"
                      : "text-text-muted hover:bg-surface hover:text-text"
                  )}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Back to main app */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-body text-text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back to App</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
