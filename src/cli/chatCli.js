import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { listAcademies } from "../data/academyRepository.js";
import { chatWithAcademy } from "../services/chatService.js";

function getCliArguments() {
  const [, , academyId, ...messageParts] = process.argv;
  const message = messageParts.join(" ").trim();

  if (!academyId || !message) {
    return null;
  }

  return {
    academyId,
    message
  };
}

async function promptAcademySelection(rl) {
  const academies = await listAcademies();

  if (academies.length === 0) {
    throw new Error("No hay academias configuradas para probar.");
  }

  console.log("Academias disponibles:");
  academies.forEach((academy, index) => {
    console.log(`${index + 1}. ${academy.name} (${academy.id})`);
  });

  const selectedValue = await rl.question("\nElige una academia por numero o id: ");
  const selectedAcademy =
    academies[Number.parseInt(selectedValue, 10) - 1] ??
    academies.find((academy) => academy.id === selectedValue.trim());

  if (!selectedAcademy) {
    throw new Error("La academia seleccionada no es valida.");
  }

  return selectedAcademy;
}

async function runSinglePromptMode({ academyId, message }) {
  const response = await chatWithAcademy({
    academyId,
    messages: [
      {
        role: "user",
        content: message
      }
    ]
  });

  console.log(`Academia: ${response.academyName}`);
  console.log(`Pregunta: ${message}`);
  console.log(`Respuesta: ${response.answer}`);
}

async function main() {
  const cliArguments = getCliArguments();

  if (cliArguments) {
    await runSinglePromptMode(cliArguments);
    return;
  }

  const rl = readline.createInterface({ input, output });

  try {
    const academy = await promptAcademySelection(rl);
    const history = [];

    console.log(`\nProbando chatbot de: ${academy.name}`);
    console.log("Escribe tu mensaje. Usa 'salir' para terminar.\n");

    while (true) {
      let userMessage;

      try {
        userMessage = await rl.question("Tu: ");
      } catch (error) {
        if (error instanceof Error && error.message === "readline was closed") {
          console.log("\nSesion finalizada.");
          break;
        }

        throw error;
      }

      const trimmedMessage = userMessage.trim();

      if (!trimmedMessage) {
        continue;
      }

      if (["salir", "exit", "quit"].includes(trimmedMessage.toLowerCase())) {
        console.log("Sesion finalizada.");
        break;
      }

      history.push({
        role: "user",
        content: trimmedMessage
      });

      const response = await chatWithAcademy({
        academyId: academy.id,
        messages: history
      });

      console.log(`\nBot (${response.academyName}): ${response.answer}\n`);

      history.push({
        role: "assistant",
        content: response.answer
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "readline was closed") {
      console.log("\nSesion finalizada.");
      return;
    }

    console.error(`\nError: ${error instanceof Error ? error.message : "Error desconocido"}`);
    process.exitCode = 1;
  } finally {
    if (!rl.closed) {
      rl.close();
    }
  }
}

main();
