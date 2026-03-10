import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center star-bg px-4 py-12">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand logo */}
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 group"
        >
          <Sparkles className="h-8 w-8 text-primary transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-display text-2xl font-bold text-text">
            Little<span className="text-primary">Sparks</span>
          </span>
        </Link>

        {/* Card container */}
        <div className="rounded-xl border border-border bg-surface/90 backdrop-blur-sm p-8 shadow-xl shadow-black/20">
          {children}
        </div>
      </div>
    </div>
  );
}
