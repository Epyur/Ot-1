import * as fs from "fs";
import * as path from "path";

const DATA_FILE = path.resolve(__dirname, "../../data/surveys.json");

function ensureFileExists(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
}

export async function readData<T>(): Promise<T[]> {
  ensureFileExists();
  const raw = await fs.promises.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as T[];
}

export async function writeData<T>(data: T[]): Promise<void> {
  ensureFileExists();
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function addRecord<T>(record: T): Promise<void> {
  const data = await readData<T>();
  data.push(record);
  await writeData(data);
}