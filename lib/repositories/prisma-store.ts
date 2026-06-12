import type { Entity, Repository } from "./types";
import { uid } from "@/lib/utils";

type PrismaDelegate = {
  findMany(args?: unknown): Promise<unknown[]>;
  findUnique(args: unknown): Promise<unknown | null>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
};

const DATE_KEYS = new Set([
  "createdAt",
  "updatedAt",
  "revisitDate",
  "interviewDate",
  "lastReviewedAt",
  "dueAt",
  "lastRevisedAt",
  "nextRevisionAt",
  "completedAt",
]);

function toPrismaValue(key: string, value: unknown): unknown {
  if (DATE_KEYS.has(key) && typeof value === "string") return new Date(value);
  return value;
}

function toEntityValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toEntityValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, toEntityValue(child)]),
    );
  }
  return value;
}

function toPrismaData(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, toPrismaValue(key, value)]),
  );
}

function toEntity<T extends Entity>(row: unknown): T {
  return toEntityValue(row) as T;
}

/**
 * Prisma-backed collection that mirrors JsonCollection's Repository contract.
 * The app's domain types use ISO strings for dates; Prisma uses Date objects,
 * so this adapter converts at the boundary and keeps callers unchanged.
 */
export class PrismaCollection<T extends Entity> implements Repository<T> {
  constructor(private delegate: PrismaDelegate) {}

  async list(): Promise<T[]> {
    const rows = await this.delegate.findMany({ orderBy: { updatedAt: "desc" } });
    return rows.map(toEntity<T>);
  }

  async get(id: string): Promise<T | null> {
    const row = await this.delegate.findUnique({ where: { id } });
    return row ? toEntity<T>(row) : null;
  }

  async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
    const row = await this.delegate.create({
      data: { id: uid(), ...toPrismaData(data as Record<string, unknown>) },
    });
    return toEntity<T>(row);
  }

  async update(id: string, patch: Partial<Omit<T, "id" | "createdAt">>): Promise<T | null> {
    try {
      const row = await this.delegate.update({
        where: { id },
        data: toPrismaData(patch as Record<string, unknown>),
      });
      return toEntity<T>(row);
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
        return null;
      }
      throw err;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await this.delegate.delete({ where: { id } });
      return true;
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
        return false;
      }
      throw err;
    }
  }
}
