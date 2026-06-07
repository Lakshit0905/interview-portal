"use server";
import { globalSearch } from "@/lib/data/search";
import type { SearchResult } from "@/types";

export async function searchAction(query: string): Promise<SearchResult[]> {
  return globalSearch(query);
}
