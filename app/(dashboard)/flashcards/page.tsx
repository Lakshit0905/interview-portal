import { db } from "@/lib/data/db";
import { FlashcardsClient } from "@/components/flashcards/flashcards-client";

export default async function FlashcardsPage() {
  const cards = await db.flashcards.list();
  return <FlashcardsClient initial={cards} />;
}
