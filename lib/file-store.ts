import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

export async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  try {
    await ensureDataDir();
    const filePath = path.join(dataDir, fileName);
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(fileName: string, payload: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}
