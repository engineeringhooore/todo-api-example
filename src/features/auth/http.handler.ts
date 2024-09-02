import type { AppType } from "@/app";
import type { IJWT } from "@/lib/jwt";
import { zValidator } from "@hono/zod-validator";
import { Hono, type MiddlewareHandler } from "hono";
import { loginSchema } from "./request.schema";
import type { IAuthService } from "./service";

type InitAuthHttpHandlerOptions = {
  jwt: IJWT;
  jwtAuthPublicKey: string;
  authService: IAuthService;
};

export function initAuthHttpHandler(
  { authService, jwt }: InitAuthHttpHandlerOptions,
  ...midlewareHandler: MiddlewareHandler[]
) {
  const apiRoute: AppType = new Hono();

  apiRoute.use("*", ...midlewareHandler);

  const generateJWT = async (userId: string) => {
    return jwt.Generate(userId);
  };

  const loginHandler = apiRoute.post(
    "/login",
    zValidator("json", loginSchema),
    async (c) => {
      const data = c.req.valid("json");
      const userId = await authService.Login(data);
      const [accessToken, accessPublicKey, refreshToken, refreshPublicKey] =
        await generateJWT(userId);

      return c.json(
        {
          access_token: accessToken,
          access_public_key: accessPublicKey,
          refresh_token: refreshToken,
          refresh_public_key: refreshPublicKey,
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
      const [accessToken, accessPublicKey, refreshToken, refreshPublicKey] =
        await generateJWT(userId);

      return c.json(
        {
          access_token: accessToken,
          access_public_key: accessPublicKey,
          refresh_token: refreshToken,
          refresh_public_key: refreshPublicKey,
        },
        200,
      );
    },
  );

  return { apiRoute, loginHandler, registerHandler };
}
