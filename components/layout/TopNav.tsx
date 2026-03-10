"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { StarCounter } from "@/components/gamification/StarCounter";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { Avatar } from "@/components/shared/Avatar";
import { MobileNav } from "./MobileNav";

interface TopNavProps {
  title: string;
  stars?: number;
  streak?: number;
  avatarId?: number;
  userName?: string;
  className?: string;
}

export function TopNav({
  title,
  stars = 0,
  streak = 0,
  avatarId = 1,
  userName,
  className,
}: TopNavProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6 h-16",
          className
        )}
      >
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-2 rounded-md text-text-muted hover:text-text hover:bg-surface transition-colors md:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Page title */}
        <h1 className="font-display text-lg font-bold text-text flex-1 truncate">
          {title}
        </h1>

        {/* Right side: stats + avatar */}
        <div className="flex items-center gap-3">
          <StarCounter count={stars} size="sm" />
          <StreakBadge streak={streak} />

          {/* User avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
              aria-label="User menu"
            >
              <Avatar avatarId={avatarId} size="md" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-lg border border-border bg-surface shadow-xl py-1">
                  {userName && (
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-body font-medium text-text truncate">
                        {userName}
                      </p>
                    </div>
                  )}
                  <a
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm font-body text-text-muted hover:bg-background hover:text-text transition-colors"
                  >
                    Profile
                  </a>
                  <a
                    href="/api/auth/signout"
                    className="flex items-center px-4 py-2 text-sm font-body text-text-muted hover:bg-background hover:text-text transition-colors"
                  >
                    Sign Out
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </>
  );
}
