import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { jwt, unauthorizedResponse } from "./jwt";

export const jws = (options: {
  headerPublicKey?: string;
  cookiePublicKey?: string;
  verifier?: (token: string, publicKey: string) => Promise<any>;
}): MiddlewareHandler => {
  const { cookiePublicKey, headerPublicKey, verifier } = options;
  if (!verifier) {
    throw new Error('JWS auth middleware requires options for "verifier"');
  }

  if (!headerPublicKey && !cookiePublicKey) {
    throw new Error(
      'JWS auth middleware requires options for "headerPublicKey" or "cookiePublicKey"',
    );
  }

  return async function jws(ctx, next) {
    const jwtMiddleware = jwt({
      verifier: async (token) => {
        let xAuthKey: string | null = null;
        if (headerPublicKey) {
          xAuthKey = ctx.req.raw.headers.get(headerPublicKey);
        }
        if (cookiePublicKey) {
          xAuthKey = getCookie(ctx, cookiePublicKey) || null;
        }

        if (!xAuthKey) {
          const errDescription = "invalid public key structure";
          throw new HTTPException(401, {
            message: errDescription,
            res: unauthorizedResponse({
              ctx,
              error: "invalid_request",
              errDescription,
            }),
          });
        }
        return verifier(token, xAuthKey);
      },
    });

    return jwtMiddleware(ctx, next);
  };
};
