import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { prometheus } from "@hono/prometheus";
import { cors } from "hono/cors";
import {
  rateLimiter,
  type Promisify,
  type RateLimitInfo,
} from "hono-rate-limiter";
import { translateError } from "./middlewares/translate-error";
import { initAuthHttpHandler } from "./features/auth/http.handler";
import { AuthService } from "./features/auth/service";
import { AuthRepository } from "./features/auth/repository";
import { Argon2id } from "./lib/password";
import { ULID } from "./lib/identifer";
import { JWT } from "./lib/jwt";

const argon2id = new Argon2id();
const ulid = new ULID();
const jwt = new JWT();

const authRepository = new AuthRepository();
const authService = new AuthService(ulid, argon2id, authRepository);
const authHttpHandler = initAuthHttpHandler(jwt, authService);

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "", // Method to generate custom identifiers for clients.
});

const { printMetrics, registerMetrics } = prometheus();

export const app = new Hono<{
  Variables: {
    rateLimit: RateLimitInfo;
    rateLimitStore: {
      get?: (key: string) => Promisify<RateLimitInfo | undefined>;
      resetKey: (key: string) => Promisify<void>;
    };
  };
}>();

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
    exposeHeaders: ["X-Kuma-Revision"],
    maxAge: 300,
    credentials: true,
  }),
);

// Apply the rate limiting middleware to all requests.
app.use(limiter);

app.use("*", registerMetrics);

app.get("/metrics", printMetrics);

app.route("/api/v1/auth", authHttpHandler.apiRoute);
