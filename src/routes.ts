import type { AppType } from "./app";
import { JWT_AUTH_PUBLIC_KEY } from "./constants";

import { ULID } from "./lib/identifer";
import { JWT } from "./lib/jwt";
import { Argon2id } from "./lib/password";

import { jws } from "./middlewares/jws";

import { initAuthHttpHandler } from "./features/auth/http.handler";
import { AuthRepository } from "./features/auth/repository";
import { AuthService } from "./features/auth/service";

import { initPermissionHttpHandler } from "./features/permission/http.handler";

export function initRoute(honoApp: AppType) {
  const argon2id = new Argon2id();
  const ulid = new ULID();

  const authzJWT = new JWT(process.env.JWT_ISSUER, process.env.JWT_AUDIENCE);

  const jwsMiddleware = jws({
    headerPublicKey: JWT_AUTH_PUBLIC_KEY,
    verifier: async (token, publicKey) => {
      return authzJWT.AccessTokenVerify(token, publicKey);
    },
  });

  const authRepository = new AuthRepository();
  const authService = new AuthService(ulid, argon2id, authRepository);
  const authHttpHandler = initAuthHttpHandler({
    authService,
    jwt: authzJWT,
    jwtAuthPublicKey: JWT_AUTH_PUBLIC_KEY,
  });
  honoApp.route("/api/v1/auth", authHttpHandler.apiRoute);

  const permissionHttpHandler = initPermissionHttpHandler({}, jwsMiddleware);
  honoApp.route("/api/v1/permissions", permissionHttpHandler.apiRoute);
}
