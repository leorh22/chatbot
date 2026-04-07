import { getAcademyById } from "../data/academyRepository.js";
import { buildSystemPrompt } from "./promptBuilder.js";
import { generateAcademyAnswer } from "./openaiService.js";

export function normalizeMessages(body) {
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    return body.messages
      .filter((message) => typeof message?.content === "string" && typeof message?.role === "string")
      .map((message) => ({
        role: message.role,
        content: message.content.trim()
      }))
      .filter((message) => message.content.length > 0);
  }

  if (typeof body.message === "string" && body.message.trim().length > 0) {
    return [
      {
        role: "user",
        content: body.message.trim()
      }
    ];
  }

  return [];
}

export async function chatWithAcademy({ academyId, messages }) {
  if (!academyId || typeof academyId !== "string") {
    throw new Error("Debes enviar academyId.");
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Debes enviar al menos un mensaje.");
  }

  const academy = await getAcademyById(academyId);

  if (!academy) {
    throw new Error("No se encontro la academia.");
  }

  const answer = await generateAcademyAnswer({
    systemPrompt: buildSystemPrompt(academy),
    messages
  });

  return {
    academyId: academy.id,
    academyName: academy.name,
    answer
  };
}
