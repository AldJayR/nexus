import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
        <header className="space-y-1">
          <h1 className="font-bold text-2xl">Login</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to continue to Nexus.
          </p>
        </header>

        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
          <div className="flex flex-col gap-3">
            <Button type="button">Continue</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
