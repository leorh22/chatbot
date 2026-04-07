import { listAcademies } from "../data/academyRepository.js";
import { chatWithAcademy, normalizeMessages } from "../services/chatService.js";
import { ChatbotTimeoutError } from "../services/openaiService.js";

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
  try {
    const { academyId } = req.body ?? {};
    const messages = normalizeMessages(req.body ?? {});

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

    return res.json({
      academyId: response.academyId,
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

    return res.status(statusCode).json({
      error: errorMessage,
      detail: error instanceof Error ? error.message : "Error desconocido"
    });
  }
}
