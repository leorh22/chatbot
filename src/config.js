import dotenv from "dotenv";

dotenv.config();

function parseAllowedOrigins(value) {
  if (!value || value.trim().length === 0) {
    return ["*"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  port: Number.parseInt(process.env.PORT ?? "3000", 10),
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  openAiTimeoutMs: Number.parseInt(process.env.OPENAI_TIMEOUT_MS ?? "20000", 10),
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT ?? "100kb",
  corsAllowedOrigins: parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS)
};
