import express from "express";
import { config } from "./config.js";
import { corsMiddleware } from "./middleware/cors.js";
import router from "./routes.js";

const app = express();

app.disable("x-powered-by");

app.use(corsMiddleware);
app.use(express.json({ limit: config.requestBodyLimit }));
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "dance-academy-chatbot",
    message: "Servicio listo para Render"
  });
});
app.use("/api", router);

app.use((req, res) => {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

const server = app.listen(config.port, () => {
  console.log(`Servidor escuchando en http://localhost:${config.port}`);
});

server.headersTimeout = 30000;
server.requestTimeout = 30000;
server.keepAliveTimeout = 5000;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

function shutdown(signal) {
  console.log(`Recibido ${signal}. Cerrando servidor...`);

  server.close(() => {
    console.log("Servidor detenido correctamente.");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
