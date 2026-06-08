import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal markdown renderer for AI-generated lesson content (headings, bullet/
 * numbered lists, tables, bold/code spans, paragraphs). Used instead of the MDX
 * pipeline here because this content is plain generated markdown, not MDX with
 * embedded JSX — and keeps lesson rendering independent of the MDX toolchain.
 */
export function LessonMarkdown({ source, className }: { source: string; className?: string }) {
  const blocks = source.trim().split(/\n{2,}/).filter(Boolean);

  return (
    <div className={cn("space-y-3 text-sm leading-relaxed text-foreground/90", className)}>
      {blocks.map((block, i) => <Block key={i} text={block} />)}
    </div>
  );
}

function Block({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const heading = lines[0]?.match(/^(#{1,6})\s+(.*)$/);
  if (heading) {
    const level = heading[1].length;
    const Tag = (`h${Math.min(level + 1, 6)}` as unknown) as "h2" | "h3" | "h4";
    const rest = lines.slice(1).join("\n");
    return (
      <>
        <Tag className="font-semibold tracking-tight text-foreground">{renderInline(heading[2])}</Tag>
        {rest && <Block text={rest} />}
      </>
    );
  }

  if (lines.every((l) => /^[-*]\s+/.test(l))) {
    return (
      <ul className="list-disc space-y-1 pl-5 marker:text-muted-foreground">
        {lines.map((l, i) => <li key={i}>{renderInline(l.replace(/^[-*]\s+/, ""))}</li>)}
      </ul>
    );
  }

  if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
    return (
      <ol className="list-decimal space-y-1 pl-5 marker:text-muted-foreground">
        {lines.map((l, i) => <li key={i}>{renderInline(l.replace(/^\d+[.)]\s+/, ""))}</li>)}
      </ol>
    );
  }

  if (lines.length >= 2 && lines.every((l) => l.startsWith("|"))) {
    const rows = lines
      .filter((l) => !/^\|[\s|:-]+\|$/.test(l))
      .map((l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
    const [head, ...body] = rows;
    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {head.map((c, i) => <th key={i} className="px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">{renderInline(c)}</th>)}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} className="border-b border-border/60 last:border-0">
                {row.map((c, ci) => <td key={ci} className="px-3 py-2 align-top">{renderInline(c)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <p>{renderInline(lines.join(" "))}</p>;
}

/** Render **bold** and `code` spans inline, leaving everything else as plain text. */
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p !== "");
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">{part.slice(1, -1)}</code>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
