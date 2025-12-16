import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist or has been moved.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 px-4">
      <div className="text-center">
        <h1 className="mb-4 font-bold text-6xl text-slate-900">404</h1>
        <p className="mb-8 text-slate-600 text-xl">Page not found</p>
        <p className="mb-8 text-slate-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          className="inline-block rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800"
          href="/dashboard"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
