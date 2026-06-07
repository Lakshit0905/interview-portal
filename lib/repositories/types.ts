// A minimal repository contract. The JSON driver implements it now; a Prisma
// driver can implement the same interface later with zero changes to callers.
export interface Entity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Repository<T extends Entity> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: string, patch: Partial<Omit<T, "id" | "createdAt">>): Promise<T | null>;
  remove(id: string): Promise<boolean>;
}
