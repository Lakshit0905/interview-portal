import { Suspense } from "react";
import { db } from "@/lib/data/db";
import { FlashcardsClient } from "@/components/flashcards/flashcards-client";

export default async function FlashcardsPage() {
  const cards = await db.flashcards.list();
  return (
    <Suspense fallback={null}>
      <FlashcardsClient initial={cards} />
    </Suspense>
  );
}
