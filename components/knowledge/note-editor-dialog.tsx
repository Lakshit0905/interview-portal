"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Save, Eye, Code2, Tag, AlignLeft, Loader2, Trash2,
  Bold, Italic, List, Code, Link as LinkIcon, Hash, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { saveTopicNote, deleteTopicNote, getTopicNoteRaw } from "@/lib/actions/notes";
import type { HubSubject, HubTopic } from "@/lib/data/knowledge-hub";
import { Mdx } from "@/components/shared/mdx";

interface NoteEditorDialogProps {
  open: boolean;
  onClose: () => void;
  subject: HubSubject;
  topic: HubTopic;
  initialHasNote?: boolean;
}

type EditorMode = "write" | "preview";

const STARTER_TEMPLATE = `## Definition

> One clear sentence: what is this?

## Why It Matters

Explain why interviewers ask about this, and what it signals about a candidate.

## How It Works

Core mechanics, step by step.

## Code Example

\`\`\`typescript
// Paste a concise, runnable snippet here
\`\`\`

## Common Mistakes

- Mistake 1
- Mistake 2

## Best Practices

- Best practice 1
- Best practice 2

## Interview Questions

1. Question one?
2. Question two?
3. Question three?

## Revision Notes

Key points to remember the day before the interview.
`;

export function NoteEditorDialog({
  open,
  onClose,
  subject,
  topic,
  initialHasNote = false,
}: NoteEditorDialogProps) {
  const [mode, setMode] = React.useState<EditorMode>("write");
  const [title, setTitle] = React.useState(topic.title);
  const [description, setDescription] = React.useState("");
  const [tagsInput, setTagsInput] = React.useState(topic.title);
  const [content, setContent] = React.useState(STARTER_TEMPLATE);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [showMeta, setShowMeta] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Load existing note content when opening
  React.useEffect(() => {
    if (!open || loaded) return;
    if (initialHasNote) {
      getTopicNoteRaw(subject.slug, topic.slug).then((raw) => {
        if (raw) {
          setTitle(raw.title);
          setDescription(raw.description);
          setTagsInput(raw.tags.join(", "));
          setContent(raw.content || STARTER_TEMPLATE);
        }
        setLoaded(true);
      });
    } else {
      setTitle(topic.title);
      setDescription("");
      setTagsInput([subject.title, topic.title].join(", "));
      setContent(STARTER_TEMPLATE);
      setLoaded(true);
    }
  }, [open, loaded, initialHasNote, subject, topic]);

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setLoaded(false);
      setSaved(false);
      setError(null);
      setMode("write");
      setShowMeta(false);
    }
  }, [open]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      await saveTopicNote({
        subjectSlug: subject.slug,
        topicSlug: topic.slug,
        title: title.trim() || topic.title,
        description: description.trim(),
        content,
        tags,
        section: topic.title,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete notes for "${topic.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteTopicNote(subject.slug, topic.slug);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  // Toolbar insertion helpers
  function insert(before: string, after = "", placeholder = "text") {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = content.slice(start, end) || placeholder;
    const newContent =
      content.slice(0, start) + before + sel + after + content.slice(end);
    setContent(newContent);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Editor panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 mx-auto mt-8 flex w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl"
          style={{ maxHeight: "calc(100vh - 4rem)" }}
        >
          {/* Header bar */}
          <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card/60 px-4 py-3">
            {/* Subject / topic breadcrumb */}
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <span>{subject.title}</span>
              <span>/</span>
              <span className="text-foreground">{topic.title}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Mode toggle */}
              <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
                {(["write", "preview"] as EditorMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition-all",
                      mode === m
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m === "write" ? <Code2 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {m}
                  </button>
                ))}
              </div>

              {/* Meta toggle */}
              <button
                onClick={() => setShowMeta((s) => !s)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-all",
                  showMeta ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <AlignLeft className="h-3 w-3" />
                Meta
                <ChevronDown className={cn("h-3 w-3 transition-transform", showMeta && "rotate-180")} />
              </button>

              {/* Delete (only if note exists) */}
              {initialHasNote && (
                <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}
                  className="h-8 gap-1.5 text-signal-red hover:bg-signal-red/10 hover:text-signal-red">
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              )}

              {/* Save */}
              <Button size="sm" onClick={handleSave} disabled={saving || deleting} className="h-8 gap-1.5">
                {saving
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : saved
                    ? <span className="text-signal-green">✓ Saved</span>
                    : <><Save className="h-3.5 w-3.5" /> Save</>}
              </Button>

              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Meta fields (collapsible) */}
          <AnimatePresence>
            {showMeta && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="shrink-0 overflow-hidden border-b border-border bg-card/30"
              >
                <div className="grid gap-3 p-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block font-mono text-[0.65rem] text-muted-foreground">TITLE</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-[0.65rem] text-muted-foreground">DESCRIPTION</label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="One-line summary shown on cards" className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-[0.65rem] text-muted-foreground">
                      <Tag className="mr-1 inline h-3 w-3" />TAGS (comma-separated)
                    </label>
                    <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="playwright, locators" className="h-8 font-mono text-sm" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toolbar (write mode only) */}
          {mode === "write" && (
            <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border/60 bg-card/20 px-3 py-1.5">
              <ToolbarBtn onClick={() => insert("**", "**", "bold")} title="Bold"><Bold className="h-3.5 w-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => insert("*", "*", "italic")} title="Italic"><Italic className="h-3.5 w-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => insert("`", "`", "code")} title="Inline code"><Code className="h-3.5 w-3.5" /></ToolbarBtn>
              <div className="mx-1.5 h-4 w-px bg-border" />
              <ToolbarBtn onClick={() => insert("## ", "", "Heading")} title="Heading 2"><Hash className="h-3.5 w-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => insert("### ", "", "Heading")} title="Heading 3">
                <span className="font-mono text-[0.6rem]">H3</span>
              </ToolbarBtn>
              <div className="mx-1.5 h-4 w-px bg-border" />
              <ToolbarBtn onClick={() => insert("\n- ", "", "item")} title="Bullet list"><List className="h-3.5 w-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => insert("\n```typescript\n", "\n```", "// code here")} title="Code block">
                <span className="font-mono text-[0.6rem]">{ }</span>
              </ToolbarBtn>
              <ToolbarBtn onClick={() => insert("\n> ", "", "quote")} title="Blockquote">
                <span className="font-mono text-[0.6rem]">❝</span>
              </ToolbarBtn>
              <ToolbarBtn onClick={() => insert("[", "](url)", "link text")} title="Link"><LinkIcon className="h-3.5 w-3.5" /></ToolbarBtn>

              <div className="ml-auto font-mono text-[0.65rem] text-muted-foreground">
                {content.split(/\s+/).filter(Boolean).length} words
              </div>
            </div>
          )}

          {/* Main editing area */}
          <div className="flex flex-1 overflow-hidden">
            {mode === "write" ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full flex-1 resize-none bg-transparent p-5 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40 scrollbar-thin"
                placeholder="Start writing in Markdown…"
                spellCheck={false}
                onKeyDown={(e) => {
                  // Tab → 2 spaces
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const el = e.currentTarget;
                    const s = el.selectionStart;
                    const newContent = content.slice(0, s) + "  " + content.slice(s);
                    setContent(newContent);
                    requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
                  }
                  // Cmd+S → save
                  if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              />
            ) : (
              <div className="w-full flex-1 overflow-y-auto p-6 scrollbar-thin">
                <div className="prose prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-code:text-signal-green prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-pre:bg-card/80 prose-pre:border prose-pre:border-border prose-li:marker:text-primary prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground max-w-none">
                  <Mdx source={content} />
                </div>
              </div>
            )}
          </div>

          {/* Footer status */}
          {error && (
            <div className="shrink-0 border-t border-signal-red/20 bg-signal-red/5 px-4 py-2">
              <p className="font-mono text-xs text-signal-red">{error}</p>
            </div>
          )}
          {!error && (
            <div className="shrink-0 border-t border-border/40 bg-card/20 px-4 py-1.5">
              <p className="font-mono text-[0.6rem] text-muted-foreground/50">
                Saves to <code>content/{subject.slug}/{topic.slug}.mdx</code> · Cmd+S to save · Tab for indent
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ToolbarBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}
