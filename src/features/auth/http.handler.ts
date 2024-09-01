import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { loginSchema } from "./request.schema";
import type { IAuthService } from "./service";
import type { IJWT } from "@/lib/jwt";

export function initAuthHttpHandler(jwt: IJWT, authService: IAuthService) {
  const apiRoute = new Hono();

  const loginHandler = apiRoute.post(
    "/login",
    zValidator("json", loginSchema),
    async (c) => {
      const data = c.req.valid("json");
      const userId = await authService.Login(data);
      const [accessToken, refreshToken] = await jwt.Sign(userId);

      return c.json(
        {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
        200,
      );
    },
  );

  const registerHandler = apiRoute.post(
    "/register",
    zValidator("json", loginSchema),
    async (c) => {
      const data = c.req.valid("json");
      const userId = await authService.Register(data);
      const [accessToken, refreshToken] = await jwt.Sign(userId);

      return c.json(
        {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
        200,
      );
    },
  );

  return { apiRoute, loginHandler, registerHandler };
}
