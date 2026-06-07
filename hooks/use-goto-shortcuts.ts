"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation";

// Vim-style "g then <key>" navigation shortcuts (e.g. g d -> dashboard).
export function useGotoShortcuts() {
  const router = useRouter();
  const armed = useRef(false);
  useEffect(() => {
    const map: Record<string, string> = {};
    for (const item of NAV_ITEMS) {
      if (item.shortcut?.startsWith("G ")) map[item.shortcut[2].toLowerCase()] = item.href;
    }
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey) {
        armed.current = true;
        setTimeout(() => (armed.current = false), 800);
        return;
      }
      if (armed.current && map[e.key.toLowerCase()]) {
        e.preventDefault();
        armed.current = false;
        router.push(map[e.key.toLowerCase()]);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [router]);
}
