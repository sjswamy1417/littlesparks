import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-text">
      <h1 className="font-display text-8xl font-bold text-primary">404</h1>
      <p className="mt-4 font-display text-2xl text-text-muted">
        Oops! This page got lost in space
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-primary px-6 py-3 font-display text-lg font-bold text-primary-foreground transition-transform hover:scale-105"
      >
        Go Home
      </Link>
    </div>
  );
}
