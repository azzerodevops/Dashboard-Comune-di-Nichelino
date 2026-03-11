"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold text-zinc-100">
        Qualcosa è andato storto
      </h2>
      <p className="text-sm text-zinc-400">{error.message}</p>
      <Button variant="outline" onClick={reset}>
        Riprova
      </Button>
    </div>
  );
}
