import { serve } from "@hono/node-server";
import { prometheus } from "@hono/prometheus";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";
import { app } from "./app";
import { translateError } from "./middlewares/translate-error";
import { initRoute } from "./routes";
import { JWT_AUTH_PUBLIC_KEY } from "./constants";

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "", // Method to generate custom identifiers for clients.
});

const { printMetrics, registerMetrics } = prometheus();

app.onError((err, _) => {
  if (err instanceof HTTPException) {
    // Get the custom response
    return err.getResponse();
  }

  return translateError(err);
});

app.use(
  "*",
  cors({
    origin: (origin, _) => {
      return origin.endsWith(process.env.CORS_ORIGIN_DOMAIN)
        ? origin
        : "http://example.com";
    },
    allowHeaders: [
      "Authorization",
      "Content-Type",
      "Origin",
      "Accept",
      "Referer",
      "User-Agent",
    ],
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    exposeHeaders: ["X-Kuma-Revision", JWT_AUTH_PUBLIC_KEY],
    maxAge: 300,
    credentials: true,
  }),
);

// Apply the rate limiting middleware to all requests.
app.use(limiter);

app.use(secureHeaders());

app.use("*", registerMetrics);

app.get("/metrics", printMetrics);

initRoute(app);

const PORT = Number(process.env.PORT);
const HOSTNAME = process.env.HOSTNAME;
console.log(`Server is running on port ${PORT}`);

serve({
  fetch: app.fetch,
  hostname: HOSTNAME,
  port: PORT,
});
