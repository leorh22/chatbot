# Chatbot simple para academias de baile

Este proyecto es una base en Node.js para un chatbot que responde con informacion personalizada de cada academia de baile usando la API de OpenAI.

## Como funciona

- Cada academia tiene su propia informacion identificada por `academyId`.
- El backend carga solo los datos de esa academia.
- Se construye un prompt con su contexto particular.
- OpenAI genera la respuesta sin mezclar informacion de otras academias.

## Estructura

- `src/server.js`: servidor Express.
- `src/routes.js`: rutas HTTP.
- `src/controllers/chatController.js`: validacion y flujo del endpoint de chat.
- `src/services/openaiService.js`: integracion con OpenAI.
- `src/services/promptBuilder.js`: prompt por academia.
- `src/data/academyRepository.js`: acceso a datos.
- `data/academies.json`: base inicial de ejemplo.

## Instalacion

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo `.env` a partir de `.env.example`.

3. Inicia el proyecto:

```bash
npm run dev
```

## Probar desde consola

Tambien puedes probar el bot directamente desde terminal:

```bash
npm run chat
```

El script te mostrara las academias disponibles, te dejara elegir una y despues podras escribir mensajes en consola. Para salir, escribe `salir`.

Si quieres hacer una prueba puntual sin entrar al modo interactivo:

```bash
npm run chat -- ritmo-libre "Que horarios tienen para salsa?"
```

## Resistencia ante bloqueos

Actualmente el proyecto incluye varias protecciones para evitar que el bot se quede colgado:

- timeout para llamadas a OpenAI usando `OPENAI_TIMEOUT_MS`
- timeout de requests HTTP del servidor
- limite de tamano para el body JSON
- respuesta controlada cuando el modelo tarda demasiado

Si el proceso se cae por un error fatal, lo recomendable es ejecutarlo con PM2 para reinicio automatico:

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
```

Con eso, si Node se detiene, PM2 lo levanta automaticamente.

Si lo subes a Render, normalmente no necesitas PM2, porque Render ya reinicia el servicio cuando corresponde.

## Endpoints

### `GET /`

Devuelve un estado simple del servicio. Sirve como respuesta rapida al abrir la URL base en Render.

### `GET /api/health`

Valida que el servicio este arriba.

### `GET /api/academies`

Lista las academias disponibles.

### `POST /api/chat`

Ejemplo de body:

```json
{
  "academyId": "ritmo-libre",
  "message": "Que horarios tienen para salsa?"
}
```

Tambien puedes enviar historial:

```json
{
  "academyId": "urban-beat",
  "messages": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "Hola, en que te ayudo?" },
    { "role": "user", "content": "Tienen clases para ninos?" }
  ]
}
```

## Deploy en Render

El proyecto ya queda listo para subirlo a Render con `render.yaml`.

Variables importantes:

- `OPENAI_API_KEY`: obligatoria
- `OPENAI_MODEL`: opcional
- `OPENAI_TIMEOUT_MS`: opcional
- `REQUEST_BODY_LIMIT`: opcional
- `CORS_ALLOWED_ORIGINS`: dominios permitidos para consumir la API, separados por coma

Pasos sugeridos:

1. Sube este repositorio a GitHub.
2. En Render, crea un nuevo Web Service desde ese repo.
3. Render detectara `render.yaml`.
4. Agrega el valor real de `OPENAI_API_KEY`.
5. Ajusta `CORS_ALLOWED_ORIGINS` con el dominio de Lovable o el dominio final de tu web.
6. Despliega.

Cuando quede arriba, Lovable podra consumir algo como:

```text
POST https://tu-servicio.onrender.com/api/chat
```

## Siguiente paso recomendado

Si despues quieres llevarlo a produccion, lo natural es reemplazar `data/academies.json` por una base de datos real, por ejemplo:

- PostgreSQL con una tabla por entidad relevante.
- MySQL si ya lo usan en las academias.
- Un CRM o panel administrativo por academia.

Tambien podemos agregar:

- autenticacion por academia
- panel admin para actualizar horarios y precios
- widget web para incrustarlo en su sitio
- integracion con WhatsApp
