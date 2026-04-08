import { listAcademies } from "../data/academyRepository.js";
import { config } from "../config.js";
import { chatWithAcademy, normalizeMessages } from "../services/chatService.js";
import { ChatbotTimeoutError } from "../services/openaiService.js";

function buildLogMessagePreview(messages) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");

  if (!lastUserMessage) {
    return "(sin mensaje de usuario)";
  }

  return lastUserMessage.content.slice(0, 200);
}

export async function healthController(_req, res) {
  res.json({
    ok: true,
    service: "dance-academy-chatbot"
  });
}

export async function academiesController(_req, res) {
  const academies = await listAcademies();

  res.json({
    academies: academies.map((academy) => ({
      id: academy.id,
      name: academy.name,
      city: academy.city
    }))
  });
}

export async function chatController(req, res) {
  const requestStartedAt = Date.now();

  try {
    const { academyId } = req.body ?? {};
    const messages = normalizeMessages(req.body ?? {});

    if (config.logChatRequests) {
      console.log(
        `[chat:incoming] academyId=${academyId ?? "missing"} ip=${req.ip} message="${buildLogMessagePreview(messages)}"`
      );
    }

    if (!academyId || typeof academyId !== "string") {
      return res.status(400).json({
        error: "Debes enviar academyId."
      });
    }

    if (messages.length === 0) {
      return res.status(400).json({
        error: "Debes enviar mensaje o mensajes con contenido."
      });
    }

    const response = await chatWithAcademy({
      academyId,
      messages
    });

    if (config.logChatRequests) {
      console.log(
        `[chat:success] academyId=${response.academyId} durationMs=${Date.now() - requestStartedAt}`
      );
    }

    return res.json({
      academyId: response.academyId,
      academySlug: response.academySlug,
      academyExternalId: response.academyExternalId,
      academyName: response.academyName,
      answer: response.answer
    });
  } catch (error) {
    let statusCode = 500;
    let errorMessage = "No fue posible generar la respuesta.";

    if (error instanceof Error && error.message === "No se encontro la academia.") {
      statusCode = 404;
    }

    if (error instanceof ChatbotTimeoutError) {
      statusCode = 504;
      errorMessage = "El chatbot tardo demasiado en responder.";
    }

    if (config.logChatRequests) {
      console.log(
        `[chat:error] academyId=${req.body?.academyId ?? "missing"} durationMs=${Date.now() - requestStartedAt} detail="${
          error instanceof Error ? error.message : "Error desconocido"
        }"`
      );
    }

    return res.status(statusCode).json({
      error: errorMessage,
      detail: error instanceof Error ? error.message : "Error desconocido"
    });
  }
}
