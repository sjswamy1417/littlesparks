"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sparky } from "@/components/sparky/Sparky";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

const ENCOURAGEMENTS = [
  "You're doing great!",
  "Keep learning!",
  "Almost there!",
  "You're a star!",
  "Way to go!",
  "Super brain!",
  "Math wizard!",
  "You rock!",
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [encouragement, setEncouragement] = useState("");

  useEffect(() => {
    setEncouragement(
      ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
    );
  }, []);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-surface-sidebar border-r border-border h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Brand / Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white font-display font-bold text-lg">
          L
        </div>
        {!collapsed && (
          <span className="font-display text-lg font-bold text-text whitespace-nowrap">
            LittleSparks
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_LINKS.map((link) => {
          const isActive =
            pathname === link.href || pathname?.startsWith(link.href + "/");
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-body font-medium transition-colors duration-150",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-background hover:text-text"
              )}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sparky encouragement at bottom */}
      <div className="px-3 pb-4 shrink-0">
        <div
          className={cn(
            "flex items-center rounded-lg bg-background p-3",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <Sparky mood="idle" size={collapsed ? 32 : 40} />
          {!collapsed && (
            <p className="text-xs text-text-muted font-body leading-snug">
              {encouragement}
            </p>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="flex items-center justify-center h-10 border-t border-border text-text-muted hover:text-text transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>
    </aside>
  );
}
