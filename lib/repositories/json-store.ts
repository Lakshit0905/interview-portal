import { promises as fs } from "fs";
import path from "path";
import type { Entity, Repository } from "./types";
import { uid, nowISO } from "@/lib/utils";

const DATA_DIR = path.join(process.cwd(), "data");

/**
 * File-backed collection. Each collection is a single JSON array file.
 * Reads are cheap; writes serialize the whole array (fine for a personal KB).
 * Concurrency is guarded with a simple in-process write queue per file.
 *
 * On read-only filesystems (e.g. Vercel's serverless runtime) the on-disk
 * file may not exist and can't be created. In that case we keep state in an
 * in-memory cache for the lifetime of the instance instead of throwing —
 * persistence is best-effort and falls back to seed data.
 */
export class JsonCollection<T extends Entity> implements Repository<T> {
  private file: string;
  private queue: Promise<unknown> = Promise.resolve();
  private cache: T[] | null = null;

  constructor(name: string, private seed: T[] = []) {
    this.file = path.join(DATA_DIR, `${name}.json`);
  }

  private async readAll(): Promise<T[]> {
    if (this.cache) return this.cache;
    try {
      const raw = await fs.readFile(this.file, "utf-8");
      this.cache = JSON.parse(raw) as T[];
    } catch {
      // First run or read-only fs: seed in memory and try to persist.
      this.cache = [...this.seed];
      await this.persist(this.cache);
    }
    return this.cache;
  }

  /** Best-effort write to disk; silently ignored on read-only filesystems. */
  private async persist(items: T[]): Promise<void> {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(this.file, JSON.stringify(items, null, 2));
    } catch {
      // Read-only filesystem (e.g. Vercel) — keep serving from the in-memory cache.
    }
  }

  private enqueue<R>(op: () => Promise<R>): Promise<R> {
    const run = this.queue.then(op, op);
    this.queue = run.then(() => undefined, () => undefined);
    return run;
  }

  async list(): Promise<T[]> {
    const items = await this.readAll();
    return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<T | null> {
    const items = await this.readAll();
    return items.find((i) => i.id === id) ?? null;
  }

  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
    return this.enqueue(async () => {
      const items = await this.readAll();
      const now = nowISO();
      const entity = { ...data, id: uid(), createdAt: now, updatedAt: now } as T;
      items.push(entity);
      this.cache = items;
      await this.persist(items);
      return entity;
    });
  }

  update(id: string, patch: Partial<Omit<T, "id" | "createdAt">>): Promise<T | null> {
    return this.enqueue(async () => {
      const items = await this.readAll();
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...patch, updatedAt: nowISO() };
      this.cache = items;
      await this.persist(items);
      return items[idx];
    });
  }

  remove(id: string): Promise<boolean> {
    return this.enqueue(async () => {
      const items = await this.readAll();
      const next = items.filter((i) => i.id !== id);
      if (next.length === items.length) return false;
      this.cache = next;
      await this.persist(next);
      return true;
    });
  }
}
