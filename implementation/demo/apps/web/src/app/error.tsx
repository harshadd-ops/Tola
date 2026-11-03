"use client";

import { Button } from "@heroui/react";
import { ArrowRotateLeft } from "@gravity-ui/icons";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[65dvh] max-w-lg flex-col items-start justify-center gap-3 px-6">
      <p className="t-label">Something went wrong</p>
      <h1 className="t-section">This view stopped. The ledger is fine.</h1>
      <p className="text-sm text-[var(--ink-3)]">{error.message || "Unexpected error"}</p>
      <Button onPress={reset} className="mt-2">
        <ArrowRotateLeft />
        Try again
      </Button>
    </main>
  );
}
