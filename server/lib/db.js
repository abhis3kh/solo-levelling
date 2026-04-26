import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "server", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

let writeQueue = Promise.resolve();

function normalizeDatabase(candidate) {
  return {
    users: Array.isArray(candidate?.users) ? candidate.users : [],
  };
}

export async function ensureDatabase() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DB_FILE);
  } catch (error) {
    await fs.writeFile(DB_FILE, JSON.stringify({ users: [] }, null, 2), "utf8");
  }
}

export async function readDatabase() {
  await ensureDatabase();
  const raw = await fs.readFile(DB_FILE, "utf8");
  return normalizeDatabase(JSON.parse(raw));
}

async function writeDatabase(database) {
  await fs.writeFile(DB_FILE, JSON.stringify(normalizeDatabase(database), null, 2), "utf8");
}

export async function withDatabase(mutator) {
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const database = await readDatabase();
    const result = await mutator(database);
    await writeDatabase(database);
    return result;
  });

  return writeQueue;
}
