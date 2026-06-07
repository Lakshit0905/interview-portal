"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_ITEMS, NAV_GROUPS } from "@/lib/navigation";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { Terminal } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card/40 backdrop-blur">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <Terminal className="h-4 w-4 text-primary" />
        </div>
        <div className="leading-tight">
          <div className="font-mono text-sm font-semibold tracking-tight">sdet<span className="text-primary">.prep</span></div>
          <div className="mono-label !text-[0.6rem]">interview os</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => {
          const items = NAV_ITEMS.filter((n) => n.group === group);
          return (
            <div key={group}>
              <div className="mono-label px-2 mb-1.5">{group}</div>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                          active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                        )}>
                        {active && (
                          <motion.div layoutId="sidebar-active" className="absolute inset-0 rounded-lg bg-accent ring-1 ring-primary/20" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                        )}
                        <Icon name={item.icon} className={cn("relative z-10 h-4 w-4", active && "text-primary")} />
                        <span className="relative z-10 font-medium">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">v1.0.0</span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.65rem]">⌘K</kbd>
        </div>
      </div>
    </aside>
  );
}
