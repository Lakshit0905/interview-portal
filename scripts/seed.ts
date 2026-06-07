/**
 * Seed script for the JSON driver.
 *
 * The JSON collections already self-seed on first read, so this script simply
 * (re)materializes every collection's seed file under /data. It's handy for a
 * clean reset: `rm -rf data && npm run seed`.
 *
 * When you migrate to Prisma, replace the body with prisma.create calls that
 * read from lib/data/seeds.ts.
 */
import { promises as fs } from "fs";
import path from "path";
import {
  codingSeed, questionSeed, behavioralSeed,
  systemDesignSeed, resumeSeed, interviewSeed,
} from "../lib/data/seeds";

const DATA_DIR = path.join(process.cwd(), "data");

const FILES: Record<string, unknown[]> = {
  "coding-problems.json": codingSeed,
  "questions.json": questionSeed,
  "behavioral.json": behavioralSeed,
  "system-design.json": systemDesignSeed,
  "resumes.json": resumeSeed,
  "interviews.json": interviewSeed,
};

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  for (const [file, data] of Object.entries(FILES)) {
    await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
    console.log(`seeded ${file} (${data.length} records)`);
  }
  console.log("\n✓ Seed complete. Start the app with `npm run dev`.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
