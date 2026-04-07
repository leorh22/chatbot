import { config } from "../config.js";

function isOriginAllowed(origin) {
  if (config.corsAllowedOrigins.includes("*")) {
    return true;
  }

  return config.corsAllowedOrigins.includes(origin);
}

export function corsMiddleware(req, res, next) {
  const requestOrigin = req.headers.origin;

  if (!requestOrigin && config.corsAllowedOrigins.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (requestOrigin && isOriginAllowed(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return next();
}
