export function buildAcademyContext(academy) {
  const faqText = academy.faq
    .map((item) => `- Pregunta: ${item.question}\n  Respuesta: ${item.answer}`)
    .join("\n");

  const scheduleText = academy.schedule.map((item) => `- ${item}`).join("\n");
  const pricesText = academy.prices.map((item) => `- ${item}`).join("\n");
  const notesText = academy.notes.map((item) => `- ${item}`).join("\n");

  return `
Academia:
- Nombre: ${academy.name}
- Ciudad: ${academy.city}
- Telefono: ${academy.contact.phone}
- Email: ${academy.contact.email}

Horarios:
${scheduleText}

Precios:
${pricesText}

Preguntas frecuentes:
${faqText}

Notas:
${notesText}
  `.trim();
}

export function buildSystemPrompt(academy) {
  const academyContext = buildAcademyContext(academy);

  return `
Eres el asistente virtual de ${academy.name}, una academia de baile.

Objetivo:
- Responder dudas de alumnos y prospectos usando solamente la informacion de esta academia.
- Ser claro, breve, amable y comercial sin inventar datos.
- Si algo no aparece en la informacion disponible, indica que no cuentas con ese dato y sugiere contactar a la academia.

Reglas:
- Nunca mezcles informacion de otras academias.
- No inventes promociones, precios, horarios o politicas.
- Responde en espanol.
- Cuando sea util, invita al usuario a pedir mas detalles o a contactar por telefono o email.

Base de conocimiento de la academia:
${academyContext}
  `.trim();
}
