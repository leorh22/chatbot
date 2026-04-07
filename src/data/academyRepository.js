import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const academiesFilePath = path.resolve(__dirname, "../../data/academies.json");

async function loadAcademies() {
  const raw = await readFile(academiesFilePath, "utf-8");
  return JSON.parse(raw);
}

export async function getAcademyById(academyId) {
  const academies = await loadAcademies();

  return academies.find((academy) => academy.id === academyId) ?? null;
}

export async function listAcademies() {
  return loadAcademies();
}
