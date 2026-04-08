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

function normalizeIdentifier(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function academyMatchesIdentifier(academy, identifier) {
  const normalizedIdentifier = normalizeIdentifier(identifier);

  if (!normalizedIdentifier) {
    return false;
  }

  const candidates = [
    academy.id,
    academy.slug,
    academy.externalId,
    ...(Array.isArray(academy.aliases) ? academy.aliases : [])
  ]
    .filter(Boolean)
    .map(normalizeIdentifier);

  return candidates.includes(normalizedIdentifier);
}

export async function getAcademyByIdentifier(identifier) {
  const academies = await loadAcademies();

  return academies.find((academy) => academyMatchesIdentifier(academy, identifier)) ?? null;
}

export async function listAcademies() {
  return loadAcademies();
}
