import type { AppType } from "@/app";
import { zValidator } from "@hono/zod-validator";
import { Hono, type MiddlewareHandler } from "hono";
import { verifySchema } from "./request.schema";

type InitPermissionHttpHandlerOptions = object;

export function initPermissionHttpHandler(
  _: InitPermissionHttpHandlerOptions,
  ...midlewareHandler: MiddlewareHandler[]
) {
  const apiRoute: AppType = new Hono();

  apiRoute.use("*", ...midlewareHandler);

  const verifyHandler = apiRoute.post(
    "/verify",
    zValidator("json", verifySchema),
    async (c) => {
      const payload = c.get("jwtPayload");
      return c.json({ user_id: payload.sub }, 200);
    },
  );

  return { apiRoute, verifyHandler };
}
