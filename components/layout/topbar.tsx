"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/navigation";
import { useGotoShortcuts } from "@/hooks/use-goto-shortcuts";

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  useGotoShortcuts();
  const current = NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.title ?? "Dashboard";

  const openPalette = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 lg:px-6 backdrop-blur">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-mono text-muted-foreground">~/</span>
        <span className="font-medium">{current}</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={openPalette}
          className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors w-64">
          <Search className="h-4 w-4" />
          <span>Search everything…</span>
          <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.65rem]">⌘K</kbd>
        </button>
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={openPalette}><Search className="h-4 w-4" /></Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
