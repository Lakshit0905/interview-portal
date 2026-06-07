import { promises as fs } from "fs";
import path from "path";
import type { Entity, Repository } from "./types";
import { uid, nowISO } from "@/lib/utils";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/**
 * File-backed collection. Each collection is a single JSON array file.
 * Reads are cheap; writes serialize the whole array (fine for a personal KB).
 * Concurrency is guarded with a simple in-process write queue per file.
 */
export class JsonCollection<T extends Entity> implements Repository<T> {
  private file: string;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(name: string, private seed: T[] = []) {
    this.file = path.join(DATA_DIR, `${name}.json`);
  }

  private async readAll(): Promise<T[]> {
    await ensureDir();
    try {
      const raw = await fs.readFile(this.file, "utf-8");
      return JSON.parse(raw) as T[];
    } catch {
      // First run: write the seed and return it.
      await fs.writeFile(this.file, JSON.stringify(this.seed, null, 2));
      return [...this.seed];
    }
  }

  private async writeAll(items: T[]): Promise<void> {
    await ensureDir();
    await fs.writeFile(this.file, JSON.stringify(items, null, 2));
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
      await this.writeAll(items);
      return entity;
    });
  }

  update(id: string, patch: Partial<Omit<T, "id" | "createdAt">>): Promise<T | null> {
    return this.enqueue(async () => {
      const items = await this.readAll();
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...patch, updatedAt: nowISO() };
      await this.writeAll(items);
      return items[idx];
    });
  }

  remove(id: string): Promise<boolean> {
    return this.enqueue(async () => {
      const items = await this.readAll();
      const next = items.filter((i) => i.id !== id);
      if (next.length === items.length) return false;
      await this.writeAll(next);
      return true;
    });
  }
}
