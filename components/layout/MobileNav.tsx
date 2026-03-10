"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  BookOpen,
  Trophy,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparky } from "@/components/sparky/Sparky";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />

          {/* Slide-out panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-surface-sidebar border-r border-border flex flex-col md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white font-display font-bold text-lg">
                  L
                </div>
                <span className="font-display text-lg font-bold text-text">
                  LittleSparks
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-background transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname?.startsWith(link.href + "/");
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-body font-medium transition-colors duration-150",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-muted hover:bg-background hover:text-text"
                    )}
                  >
                    <Icon size={20} className="shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Sparky */}
            <div className="px-3 pb-4 shrink-0">
              <div className="flex items-center gap-3 rounded-lg bg-background p-3">
                <Sparky mood="proud" size={40} />
                <p className="text-xs text-text-muted font-body leading-snug">
                  Keep up the great work!
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
