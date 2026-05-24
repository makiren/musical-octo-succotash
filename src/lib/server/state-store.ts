import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

// Where persisted client state (watchlist, portfolio, alerts) lives on disk.
// Defaults to ./.data so a single-user, self-hosted instance keeps its data
// across server restarts without any database.
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), ".data");

// Only these keys may be read/written. Matches the persist `name` of each store.
const ALLOWED_KEYS = new Set(["tad-watchlist", "tad-portfolio", "tad-alerts"]);

export function isAllowedKey(key: string): boolean {
  return ALLOWED_KEYS.has(key);
}

function fileFor(key: string): string {
  return path.join(DATA_DIR, `${key}.json`);
}

export async function readState(key: string): Promise<string | null> {
  if (!isAllowedKey(key)) return null;
  try {
    return await fs.readFile(fileFor(key), "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function writeState(key: string, value: string): Promise<void> {
  if (!isAllowedKey(key)) throw new Error("invalid key");
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Write to a temp file then rename for an atomic, corruption-safe update.
  const target = fileFor(key);
  const tmp = `${target}.${process.pid}.tmp`;
  await fs.writeFile(tmp, value, "utf8");
  await fs.rename(tmp, target);
}

export async function deleteState(key: string): Promise<void> {
  if (!isAllowedKey(key)) return;
  try {
    await fs.unlink(fileFor(key));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}
