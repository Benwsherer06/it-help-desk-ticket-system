import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const dbPath = path.join(currentDir, "../../data/db.json");

export async function readDb() {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    const emptyDb = {
      users: [],
      tickets: []
    };

    await writeDb(emptyDb);
    return emptyDb;
  }
}

export async function writeDb(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}