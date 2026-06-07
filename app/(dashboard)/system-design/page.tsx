import { db } from "@/lib/data/db";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Lightbulb } from "lucide-react";

export default async function SystemDesignPage() {
  const designs = await db.systemDesign.list();
  return (
    <div>
      <PageHeader
        title="System Design"
        description="Architecture playbooks for the platform-level questions SDETs get: test frameworks, data services, and contract-testing systems."
      />
      {designs.length === 0 ? (
        <EmptyState icon="Workflow" title="No designs yet" description="Document your reference architectures and the questions they answer." />
      ) : (
        <div className="space-y-5">
          {designs.map((d) => (
            <article key={d.id} className="card-glow rounded-xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold tracking-tight">{d.title}</h2>
              <p className="mt-1 text-muted-foreground">{d.summary}</p>

              {d.diagram && (
                <div className="mt-5">
                  <p className="mono-label mb-2">architecture</p>
                  <pre className="scrollbar-thin overflow-x-auto rounded-lg border border-border bg-background/60 p-4 font-mono text-xs leading-relaxed text-foreground/90">{d.diagram}</pre>
                </div>
              )}

              {d.notes && (
                <div className="mt-5">
                  <p className="mono-label mb-2">design notes</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{d.notes}</p>
                </div>
              )}

              {d.questions.length > 0 && (
                <div className="mt-5">
                  <p className="mono-label mb-2">questions to expect</p>
                  <ul className="space-y-1.5">
                    {d.questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal-violet" /> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {d.sampleAnswer && (
                <details className="group mt-5 rounded-lg border border-border bg-background/40 p-4">
                  <summary className="flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
                    <Lightbulb className="h-4 w-4 text-signal-amber" /> sample answer
                    <Badge variant="muted" className="ml-auto">click to reveal</Badge>
                  </summary>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{d.sampleAnswer}</p>
                </details>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
