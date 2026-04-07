import OpenAI from "openai";
import { config } from "../config.js";

let clientInstance = null;

export class ChatbotTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "ChatbotTimeoutError";
  }
}

function getClient() {
  if (!config.openAiApiKey) {
    throw new Error("Falta la variable de entorno OPENAI_API_KEY.");
  }

  if (!clientInstance) {
    clientInstance = new OpenAI({
      apiKey: config.openAiApiKey
    });
  }

  return clientInstance;
}

export async function generateAcademyAnswer({ systemPrompt, messages }) {
  const client = getClient();
  const abortController = new AbortController();
  const timeout = setTimeout(() => {
    abortController.abort();
  }, config.openAiTimeoutMs);

  try {
    const response = await client.responses.create(
      {
        model: config.openAiModel,
        input: [
          {
            role: "system",
            content: systemPrompt
          },
          ...messages.map((message) => ({
            role: message.role,
            content: message.content
          }))
        ]
      },
      {
        signal: abortController.signal
      }
    );

    return response.output_text;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ChatbotTimeoutError("La solicitud al modelo excedio el tiempo maximo de espera.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
