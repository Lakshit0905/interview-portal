import type { CompanyRound } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";

export function CompanyProcess({ process }: { process: CompanyRound[] }) {
  if (process.length === 0) {
    return <EmptyState icon="ListOrdered" title="No process notes yet" description="Document the interview rounds as you learn about them." />;
  }

  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {process.map((round, i) => (
        <li key={round.name} className="relative">
          <span className="absolute -left-[1.65rem] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card font-mono text-[0.65rem] text-muted-foreground">
            {i + 1}
          </span>
          <h4 className="text-sm font-semibold tracking-tight">{round.name}</h4>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{round.description}</p>
        </li>
      ))}
    </ol>
  );
}
